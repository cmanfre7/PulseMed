import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HubSpotFileManager } from '../hubspot/file-manager.js';
import { extractTextFromPDF } from '../utils/pdf-ocr.js';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

/**
 * Process a PDF that was already uploaded directly to HubSpot
 * Downloads it, extracts text, and creates knowledge base record
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const hubspotManager = new HubSpotFileManager();

  try {
    const { fileId, fileName, category, sizeKB } = req.body;

    if (!fileId || !fileName) {
      return res.status(400).json({
        success: false,
        error: 'fileId and fileName are required'
      });
    }

    console.log(`📝 Processing uploaded PDF: ${fileName} (ID: ${fileId})`);

    // Get file details from HubSpot
    const fileDetailsResponse = await fetch(`https://api.hubapi.com/files/v3/files/${fileId}`, {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
      }
    });

    if (!fileDetailsResponse.ok) {
      throw new Error(`Failed to get file details: ${fileDetailsResponse.status}`);
    }

    const fileDetails = await fileDetailsResponse.json();
    const fileUrl = fileDetails.url;

    console.log(`📥 Downloading PDF from: ${fileUrl}`);

    // Download the PDF from HubSpot to extract text
    const pdfResponse = await fetch(fileUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.status}`);
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());
    console.log(`✅ Downloaded ${pdfBuffer.length} bytes`);

    // Extract text from PDF (tries text extraction, falls back to OCR)
    console.log(`📄 Extracting text from ${fileName}...`);
    const extractionResult = await extractTextFromPDF(pdfBuffer, fileName);

    const textContent = extractionResult.text;
    const pages = extractionResult.pages;

    console.log(`✅ Extraction complete: ${pages} pages, ${textContent.length} chars, method: ${extractionResult.method}`);

    if (extractionResult.confidence) {
      console.log(`   OCR confidence: ${extractionResult.confidence.toFixed(1)}%`);
    }

    // Calculate chunks
    const CHUNK_SIZE = 1000;
    const chunks = textContent.length > 0 ? Math.ceil(textContent.length / CHUNK_SIZE) : 1;

    // Create knowledge base record
    const title = fileName.replace('.pdf', '').replace(/-/g, ' ').replace(/_/g, ' ');
    const description = textContent.length > 200
      ? textContent.substring(0, 200) + '...'
      : textContent || `PDF document: ${fileName}`;

    console.log(`📝 Creating knowledge base record...`);
    const recordId = await hubspotManager.createKnowledgeBaseRecord({
      title,
      fileName,
      category: category || 'other',
      fileUrl,
      hubspotFileId: fileId,
      pages,
      sizeKB: sizeKB || Math.round(pdfBuffer.length / 1024),
      uploadedAt: new Date().toISOString(),
      description,
      chunks,
      textContent: textContent.substring(0, 65000) // HubSpot property size limit
    });

    console.log(`✅ Knowledge base record created: ${recordId}`);

    return res.status(200).json({
      success: true,
      document: {
        id: recordId,
        title,
        fileName,
        category: category || 'other',
        pages,
        chunks,
        sizeKB: sizeKB || Math.round(pdfBuffer.length / 1024),
        fileUrl
      }
    });

  } catch (err: any) {
    console.error('❌ Error processing PDF:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message || 'Failed to process PDF'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 60,
};
