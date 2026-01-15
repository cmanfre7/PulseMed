import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HubSpotFileManager } from '../hubspot/file-manager.js';

/**
 * Diagnostic endpoint to check what's stored in HubSpot
 * Usage: GET /api/admin/diagnostic
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hubspotManager = new HubSpotFileManager();

  try {
    // Get all documents from HubSpot
    const documents = await hubspotManager.getAllDocuments();

    const diagnosticReport = {
      timestamp: new Date().toISOString(),
      totalDocuments: documents.length,
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        category: doc.category,
        pages: doc.pages,
        pagesType: typeof doc.pages,
        chunks: doc.chunks,
        chunksType: typeof doc.chunks,
        sizeKB: doc.sizeKB,
        uploadedAt: doc.uploadedAt,
        descriptionLength: doc.description?.length || 0,
        textContentLength: doc.textContent?.length || 0,
        hasTextContent: !!doc.textContent,
        textContentPreview: doc.textContent?.substring(0, 200) || 'No text content'
      })),
      summary: {
        totalPages: documents.reduce((sum, doc) => sum + (doc.pages || 0), 0),
        totalChunks: documents.reduce((sum, doc) => sum + (doc.chunks || 0), 0),
        totalSizeKB: documents.reduce((sum, doc) => sum + (doc.sizeKB || 0), 0),
        documentsWithText: documents.filter(doc => doc.textContent && doc.textContent.length > 0).length,
        documentsWithoutText: documents.filter(doc => !doc.textContent || doc.textContent.length === 0).length,
        averagePagesPerDoc: documents.length > 0 ? (documents.reduce((sum, doc) => sum + (doc.pages || 0), 0) / documents.length).toFixed(2) : 0
      },
      categories: [...new Set(documents.map(doc => doc.category))].map(category => ({
        name: category,
        count: documents.filter(doc => doc.category === category).length,
        totalPages: documents.filter(doc => doc.category === category).reduce((sum, doc) => sum + (doc.pages || 0), 0)
      }))
    };

    return res.status(200).json(diagnosticReport);
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return res.status(500).json({
      error: 'Failed to run diagnostic',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 30,
};
