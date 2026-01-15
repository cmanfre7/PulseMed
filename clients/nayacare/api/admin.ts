// Admin API for Knowledge Base Management
// Handles document upload, review, and AI response vetting

import { KBManager, ResponseVetter, type KBItem, type AIResponse } from '../functions/admin/kb-manager.js';

interface AdminConfig {
  accessToken: string;
  portalId: string;
  tableId: string;
}

// Initialize managers
const getManagers = (): { kbManager: KBManager; responseVetter: ResponseVetter } => {
  const config: AdminConfig = {
    accessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
    portalId: process.env.HUBSPOT_PORTAL_ID || '',
    tableId: process.env.HUBSPOT_TABLE_ID || ''
  };

  return {
    kbManager: new KBManager(config),
    responseVetter: new ResponseVetter(config)
  };
};

// Middleware for admin authentication
const requireAdminAuth = (req: any) => {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.ADMIN_API_TOKEN;
  
  if (!authHeader || !expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    throw new Error('Unauthorized: Invalid admin token');
  }
};

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      requireAdminAuth(req);
      
      const { action, data } = req.body;
      const { kbManager, responseVetter } = getManagers();

      switch (action) {
        case 'create_kb_item': {
          const kbItem = await kbManager.createKBItem(data);
          
          // Generate embedding for the new item
          try {
            await kbManager.updateEmbedding(kbItem.id!);
          } catch (error) {
            console.warn('Failed to generate embedding:', error);
          }
          
          return res.status(200).json({ success: true, data: kbItem });
        }

        case 'update_kb_item': {
          const { id, updates } = data;
          const kbItem = await kbManager.updateKBItem(id, updates);
          
          // Regenerate embedding if content changed
          if (updates.content || updates.topic || updates.summary || updates.tags) {
            try {
              await kbManager.updateEmbedding(id);
            } catch (error) {
              console.warn('Failed to regenerate embedding:', error);
            }
          }
          
          return res.status(200).json({ success: true, data: kbItem });
        }

        case 'store_ai_response': {
          const aiResponse = await responseVetter.storeAIResponse(data);
          return res.status(200).json({ success: true, data: aiResponse });
        }

        case 'review_ai_response': {
          const { responseId, decision, reviewer, notes } = data;
          await responseVetter.reviewResponse(responseId, decision, reviewer, notes);
          return res.status(200).json({ success: true });
        }

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    }

    if (req.method === 'GET') {
      requireAdminAuth(req);
      
      const { action } = req.query;
      const { kbManager, responseVetter } = getManagers();

      switch (action) {
        case 'kb_items': {
          const filters = {
            is_active: req.query.is_active === 'true' ? true : undefined,
            audience: req.query.audience || undefined,
            risk_level: req.query.risk_level || undefined,
            tags: req.query.tags || undefined
          };
          
          const items = await kbManager.getKBItems(filters);
          return res.status(200).json({ success: true, data: items });
        }

        case 'items_needing_review': {
          const items = await kbManager.getItemsNeedingReview();
          return res.status(200).json({ success: true, data: items });
        }

        case 'pending_ai_responses': {
          const responses = await responseVetter.getPendingResponses();
          return res.status(200).json({ success: true, data: responses });
        }

        case 'search_kb': {
          const query = req.query.query;
          const limit = parseInt(req.query.limit || '10');
          
          if (!query) {
            return res.status(400).json({ error: 'Query parameter required' });
          }
          
          const results = await kbManager.searchKBItems(query, limit);
          return res.status(200).json({ success: true, data: results });
        }

        default:
          return res.status(400).json({ error: 'Invalid action' });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Admin API error:', error);
    const status = error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500;
    return res.status(status).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
}
