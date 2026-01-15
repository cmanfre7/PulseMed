import type { VercelRequest, VercelResponse } from '@vercel/node';
import multiparty from 'multiparty';
import fs from 'fs';
import path from 'path';
import { HubSpotFileManager } from '../hubspot/file-manager.js';

// HubSpot File Manager integration for PDF storage
// Bypasses Vercel's 4.5MB body size limit

interface PDFDocument {
  id: string;
  title: string;
  fileName: string;
  category: string;
  pages: number;
  sizeKB: number;
  uploadedAt: string;
  description?: string;
  chunks: number;
}

// Category to folder mapping
const CATEGORY_FOLDERS: Record<string, string> = {
  'breastfeeding': 'Breastfeeding',
  'newborn-care': 'Newborn Care',
  'postpartum': 'Postpartum Recovery',
  'sleep': 'Sleep Guidance',
  'feeding': 'Feeding & Nutrition',
  'development': 'Development',
  'safety': 'Safety & Emergency',
  'other': 'Other Resources'
};

/**
 * PDF upload handler with HubSpot File Manager integration
 * Uploads PDFs to HubSpot (300MB limit) instead of Vercel (4.5MB limit)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
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
    // Parse form data with increased limits
    const form = new multiparty.Form({
      maxFilesSize: 100 * 1024 * 1024, // 100MB local limit (HubSpot supports up to 300MB)
      maxFields: 1000,
      maxFieldsSize: 100 * 1024 * 1024,
      uploadDir: '/tmp' // Ensure temp directory exists
    });

    console.log('📥 Starting form parse...');

    const { fields, files }: any = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('❌ Form parse error:', err);
          console.error('Error details:', {
            message: err.message,
            code: err.code,
            statusCode: err.statusCode
          });
          reject(err);
        } else {
          console.log('✅ Form parsed successfully');
          console.log('Fields:', Object.keys(fields));
          console.log('Files:', Object.keys(files));
          resolve({ fields, files });
        }
      });
    });

    const uploadedFiles = files.files ? (Array.isArray(files.files) ? files.files : [files.files]) : [];
    const category = fields.category ? (Array.isArray(fields.category) ? fields.category[0] : fields.category) : 'other';

    console.log(`Processing ${uploadedFiles.length} file(s) for category: ${category}`);

    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
        message: 'Please select at least one PDF file to upload'
      });
    }

    const processedDocs: any[] = [];
    const errors: string[] = [];

    for (const file of uploadedFiles) {
      if (!file) continue;

      try {
        const fileName = file.originalFilename || 'unknown.pdf';

        // Validate PDF
        if (!fileName.toLowerCase().endsWith('.pdf')) {
          errors.push(`${fileName}: Not a PDF file`);
          continue;
        }

        // Get file stats
        const fileStats = fs.statSync(file.path);
        const fileSizeKB = Math.round(fileStats.size / 1024);
        const fileSizeMB = (fileSizeKB / 1024).toFixed(2);

        console.log(`📦 Processing: ${fileName} (${fileSizeMB}MB / ${fileSizeKB}KB)`);

        // Validate file size (100MB limit - Railway has no hard restriction)
        const MAX_FILE_SIZE_MB = 100;
        if (fileSizeKB > MAX_FILE_SIZE_MB * 1024) {
          errors.push(`${fileName}: File too large (${fileSizeMB}MB). Maximum size is ${MAX_FILE_SIZE_MB}MB`);
          console.error(`❌ File too large: ${fileName} (${fileSizeMB}MB)`);
          continue;
        }

        // Read file buffer
        const fileBuffer = fs.readFileSync(file.path);

        // Extract text from PDF using OCR
        console.log(`📄 Extracting text from ${fileName}...`);

        const { extractTextFromPDF } = await import('../utils/pdf-ocr.js');
        const extractionResult = await extractTextFromPDF(fileBuffer, fileName);

        const textContent = extractionResult.text;
        const pages = extractionResult.pages;
        const extractionMethod = extractionResult.method;

        console.log(`✅ Extraction complete: ${pages} pages, ${textContent.length} chars, method: ${extractionMethod}`);

        if (extractionResult.confidence) {
          console.log(`   OCR confidence: ${extractionResult.confidence.toFixed(1)}%`);
        }

        // Log first 200 chars for verification
        if (textContent.length > 0) {
          console.log(`   Text preview: "${textContent.substring(0, 200)}..."`);
        } else {
          console.warn(`   ⚠️ WARNING: No text extracted!`);
        }

        // Upload to HubSpot File Manager
        console.log(`⬆️  Uploading ${fileName} to HubSpot...`);
        const { fileId, fileUrl } = await hubspotManager.uploadFile(fileBuffer, fileName, category);
        console.log(`✅ Uploaded to HubSpot: ${fileId}`);

        // Calculate chunks (approximate based on text length)
        const CHUNK_SIZE = 1000; // characters per chunk
        const chunks = textContent.length > 0 ? Math.ceil(textContent.length / CHUNK_SIZE) : 1;

        // Create knowledge base record in HubSpot Custom Object
        const title = fileName.replace('.pdf', '').replace(/-/g, ' ').replace(/_/g, ' ');
        const description = textContent.length > 200
          ? textContent.substring(0, 200) + '...'
          : textContent || `PDF document: ${fileName}`;

        console.log(`📝 Creating knowledge base record...`);

        const textToSave = textContent.substring(0, 65000);
        console.log(`   💾 Saving ${textToSave.length} chars of text to HubSpot`);
        console.log(`   📄 First 100 chars: "${textToSave.substring(0, 100)}"`);

        const recordId = await hubspotManager.createKnowledgeBaseRecord({
          title,
          fileName,
          category,
          fileUrl,
          hubspotFileId: fileId,
          pages,
          sizeKB: fileSizeKB,
          uploadedAt: new Date().toISOString(),
          description,
          chunks,
          textContent: textToSave
        });

        console.log(`✅ Knowledge base record created: ${recordId}`);

        const doc: PDFDocument = {
          id: recordId,
          title,
          fileName,
          category,
          pages,
          sizeKB: fileSizeKB,
          uploadedAt: new Date().toISOString(),
          description,
          chunks
        };

        processedDocs.push({
          id: doc.id,
          title: doc.title,
          fileName: doc.fileName,
          category: doc.category,
          pages: doc.pages,
          chunks: doc.chunks,
          sizeKB: doc.sizeKB,
          fileUrl
        });

        console.log(`✅ Processed: ${fileName}`);

        // Clean up temp file
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

      } catch (err: any) {
        console.error(`Error processing file:`, err);
        errors.push(`${file.originalFilename || 'unknown'}: ${err.message}`);

        // Clean up temp file on error
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    const response = {
      success: true,
      processed: processedDocs.length,
      documents: processedDocs,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully uploaded ${processedDocs.length} PDF(s) to HubSpot File Manager.`,
      storage: 'HubSpot File Manager'
    };

    console.log('Upload response:', response);
    return res.status(200).json(response);

  } catch (err: any) {
    console.error('Upload handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message || 'Failed to process upload',
      details: err.toString()
    });
  }
}

// Vercel config - bodyParser must be false for multipart uploads
export const config = {
  api: {
    bodyParser: false, // Required for multiparty to work
  },
  maxDuration: 60, // Allow up to 60 seconds for large uploads
};
