// PDF Ingestion Function for AI Intellect Pool
// Processes Dr. Patel's vetted PDFs and integrates them into the knowledge base

import { PDFParser, type BreastfeedingDocument } from './pdf-parser.js';
import { KBManager } from '../admin/kb-manager.js';

interface IngestionResponse {
  success: boolean;
  processed: number;
  documents: BreastfeedingDocument[];
  errors: string[];
}

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize PDF parser
    const pdfParser = new PDFParser('./AI Intellect Pool');
    
    // Process all PDFs in the AI Intellect Pool
    console.log('Starting PDF ingestion from AI Intellect Pool...');
    const documents = await pdfParser.processIntellectPool();
    
    console.log(`Processed ${documents.length} PDF documents`);
    
    // Initialize KB Manager if HubSpot is configured
    let savedToKB = false;
    const errors: string[] = [];
    
    if (process.env.HUBSPOT_ACCESS_TOKEN && process.env.HUBSPOT_PORTAL_ID && process.env.HUBSPOT_TABLE_ID) {
      try {
        const kbManager = new KBManager({
          accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
          portalId: process.env.HUBSPOT_PORTAL_ID,
          tableId: process.env.HUBSPOT_PORTAL_ID
        });

        // Save each document to the knowledge base
        for (const doc of documents) {
          try {
            await kbManager.createKBItem({
              topic: doc.title,
              audience: doc.audience,
              age_window: doc.ageWindow,
              risk_level: doc.riskLevel,
              summary: doc.summary,
              content: doc.content,
              author: doc.author,
              reviewed_by: 'Dr. Sonal Patel',
              review_date: new Date().toISOString(),
              source_url: `pdf://${doc.id}`,
              tags: doc.tags.join(', '),
              version: '1.0',
              is_active: true
            });
            console.log(`Saved to KB: ${doc.title}`);
          } catch (error) {
            const errorMsg = `Failed to save ${doc.title}: ${error}`;
            console.error(errorMsg);
            errors.push(errorMsg);
          }
        }
        savedToKB = true;
      } catch (error) {
        const errorMsg = `KB Manager error: ${error}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    } else {
      errors.push('HubSpot configuration not available - documents processed but not saved to KB');
    }

    // Create response
    const response: IngestionResponse = {
      success: documents.length > 0,
      processed: documents.length,
      documents,
      errors
    };

    console.log('PDF ingestion completed:', response);

    return res.status(200).json(response);

  } catch (error) {
    console.error('PDF ingestion error:', error);
    return res.status(500).json({
      success: false,
      processed: 0,
      documents: [],
      errors: [`Ingestion failed: ${error}`]
    });
  }
}

// Health check endpoint
export async function GET(req: any, res: any) {
  return res.status(200).json({
    status: 'healthy',
    service: 'PDF Ingestion',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
