// API endpoint to get, update, and delete knowledge base documents
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HubSpotFileManager } from '../hubspot/file-manager.js';

interface KBDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  chunks: number;
  pages: number;
  sizeKB?: number;
  uploadedAt: string;
  description?: string;
  fileUrl?: string;
  hubspotFileId?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { id, category, search } = req.query;

  // Check if HubSpot is configured
  const hubspotConfigured = !!(process.env.HUBSPOT_ACCESS_TOKEN && process.env.HUBSPOT_PORTAL_ID);

  console.log('HubSpot configured:', hubspotConfigured);
  console.log('HubSpot token exists:', !!process.env.HUBSPOT_ACCESS_TOKEN);
  console.log('HubSpot portal ID:', process.env.HUBSPOT_PORTAL_ID);

  // Create HubSpot manager if configured
  let hubspotManager = null;
  try {
    hubspotManager = hubspotConfigured ? new HubSpotFileManager() : null;
    console.log('HubSpot manager created:', !!hubspotManager);
  } catch (err) {
    console.error('Error creating HubSpot manager:', err);
    hubspotManager = null;
  }

  try {
    // GET all documents or search
    if (method === 'GET' && !id) {
      let documents = [];

      if (hubspotManager) {

        try {
          if (search) {
            // Search documents
            documents = await hubspotManager.searchDocuments(
              search as string,
              category as string | undefined
            );
          } else {
            // Get all documents
            documents = await hubspotManager.getAllDocuments();

            // Filter by category if provided
            if (category) {
              documents = documents.filter(doc => doc.category === category);
            }
          }
        } catch (hubspotError: any) {
          console.error('HubSpot API error:', hubspotError);
          // Return empty array instead of failing
          documents = [];
        }
      }

      return res.status(200).json({
        success: true,
        documents: documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          fileName: doc.fileName,
          category: doc.category,
          pages: doc.pages,
          chunks: doc.chunks,
          sizeKB: doc.sizeKB,
          uploadedAt: doc.uploadedAt,
          description: doc.description,
          fileUrl: doc.fileUrl
        })),
        total: documents.length,
        storage: 'HubSpot File Manager'
      });
    }

    // GET single document
    if (method === 'GET' && id) {
      if (!hubspotManager) {
        return res.status(503).json({ error: 'HubSpot not configured' });
      }

      const documents = await hubspotManager.getAllDocuments();
      const doc = documents.find(d => d.id === id);

      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      return res.status(200).json({ success: true, document: doc });
    }

    // PATCH - Update document (e.g., change category)
    if (method === 'PATCH' && id) {
      if (!hubspotManager) {
        return res.status(503).json({ error: 'HubSpot not configured' });
      }

      const updates = req.body;

      await hubspotManager.updateDocument(id as string, updates);

      // Get updated document
      const documents = await hubspotManager.getAllDocuments();
      const updatedDoc = documents.find(d => d.id === id);

      return res.status(200).json({
        success: true,
        document: updatedDoc
      });
    }

    // DELETE document
    if (method === 'DELETE' && id) {
      if (!hubspotManager) {
        return res.status(503).json({ error: 'HubSpot not configured' });
      }

      const documents = await hubspotManager.getAllDocuments();
      const doc = documents.find(d => d.id === id);

      if (!doc) {
        return res.status(404).json({ error: 'Document not found' });
      }

      await hubspotManager.deleteDocument(id as string, doc.hubspotFileId);

      return res.status(200).json({
        success: true,
        message: 'Document deleted from HubSpot',
        document: {
          id: doc.id,
          title: doc.title
        }
      });
    }

    // Method not allowed
    res.setHeader('Allow', 'GET, PATCH, DELETE');
    return res.status(405).json({ error: 'Method Not Allowed' });

  } catch (err) {
    console.error('Knowledge base API error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error'
    });
  }
}

