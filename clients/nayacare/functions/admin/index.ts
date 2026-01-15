// Admin API for Knowledge Base Management
// Handles document upload, review, and AI response vetting

import { KBManager, ResponseVetter, type KBItem, type AIResponse } from './kb-manager';

interface AdminConfig {
  hubspotAccessToken: string;
  hubspotPortalId: string;
  hubspotTableId: string;
}

// Initialize managers
const getManagers = (): { kbManager: KBManager; responseVetter: ResponseVetter } => {
  const config: AdminConfig = {
    hubspotAccessToken: process.env.HUBSPOT_ACCESS_TOKEN || '',
    hubspotPortalId: process.env.HUBSPOT_PORTAL_ID || '',
    hubspotTableId: process.env.HUBSPOT_TABLE_ID || ''
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

// Create new knowledge base item
export async function POST(req: any) {
  try {
    requireAdminAuth(req);
    
    const { action, data } = await req.json();
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
        
        return Response.json({ success: true, data: kbItem });
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
        
        return Response.json({ success: true, data: kbItem });
      }

      case 'store_ai_response': {
        const aiResponse = await responseVetter.storeAIResponse(data);
        return Response.json({ success: true, data: aiResponse });
      }

      case 'review_ai_response': {
        const { responseId, decision, reviewer, notes } = data;
        await responseVetter.reviewResponse(responseId, decision, reviewer, notes);
        return Response.json({ success: true });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// Get knowledge base items and pending reviews
export async function GET(req: any) {
  try {
    requireAdminAuth(req);
    
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const { kbManager, responseVetter } = getManagers();

    switch (action) {
      case 'kb_items': {
        const filters = {
          is_active: url.searchParams.get('is_active') === 'true' ? true : undefined,
          audience: url.searchParams.get('audience') || undefined,
          risk_level: url.searchParams.get('risk_level') || undefined,
          tags: url.searchParams.get('tags') || undefined
        };
        
        const items = await kbManager.getKBItems(filters);
        return Response.json({ success: true, data: items });
      }

      case 'items_needing_review': {
        const items = await kbManager.getItemsNeedingReview();
        return Response.json({ success: true, data: items });
      }

      case 'pending_ai_responses': {
        const responses = await responseVetter.getPendingResponses();
        return Response.json({ success: true, data: responses });
      }

      case 'search_kb': {
        const query = url.searchParams.get('query');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        
        if (!query) {
          return Response.json({ error: 'Query parameter required' }, { status: 400 });
        }
        
        const results = await kbManager.searchKBItems(query, limit);
        return Response.json({ success: true, data: results });
      }

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin GET error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error && error.message.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// Health check
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
