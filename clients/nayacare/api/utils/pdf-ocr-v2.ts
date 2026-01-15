/**
 * PDF OCR Utility v2
 * Uses pdf.js + tesseract.js - Pure JavaScript, no system dependencies
 */

import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { Canvas, createCanvas } from 'canvas';

// Lazy-load pdf-parse for text extraction attempt
let pdfParse: any = null;
async function getPdfParse() {
  if (!pdfParse) {
    pdfParse = (await import('pdf-parse')).default;
  }
  return pdfParse;
}

export interface PDFExtractionResult {
  text: string;
  pages: number;
  method: 'text-extraction' | 'ocr' | 'failed';
  confidence?: number;
  errors?: string[];
}

/**
 * Extract text from PDF - tries text extraction first, falls back to OCR
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {
  console.log(`📄 [${fileName}] Starting text extraction...`);
  const errors: string[] = [];

  // STEP 1: Try text extraction first (fast, for text-based PDFs)
  try {
    const pdfParseFunc = await getPdfParse();
    const pdfData = await pdfParseFunc(pdfBuffer);

    const cleanText = pdfData.text.trim();
    if (cleanText.length > 100) { // At least 100 characters of actual text
      console.log(`✅ [${fileName}] Text extraction successful: ${pdfData.numpages} pages, ${cleanText.length} characters`);
      return {
        text: cleanText,
        pages: pdfData.numpages,
        method: 'text-extraction'
      };
    }

    console.log(`⚠️ [${fileName}] Text extraction returned minimal content (${cleanText.length} chars)`);
    errors.push(`Text extraction: Only ${cleanText.length} chars extracted`);
  } catch (parseErr: any) {
    console.log(`⚠️ [${fileName}] Text extraction failed: ${parseErr.message}`);
    errors.push(`Text extraction: ${parseErr.message}`);
  }

  // STEP 2: Fall back to OCR using pdf.js + tesseract.js
  try {
    console.log(`🔍 [${fileName}] Starting OCR (pdf.js + tesseract.js)...`);
    const ocrResult = await extractTextWithOCR(pdfBuffer, fileName);

    if (ocrResult.text.length > 0) {
      console.log(`✅ [${fileName}] OCR successful!`);
      return {
        ...ocrResult,
        errors: errors.length > 0 ? errors : undefined
      };
    } else {
      errors.push('OCR: No text extracted');
      throw new Error('OCR returned empty text');
    }
  } catch (ocrErr: any) {
    console.error(`❌ [${fileName}] OCR failed: ${ocrErr.message}`);
    errors.push(`OCR: ${ocrErr.message}`);

    return {
      text: '',
      pages: 1,
      method: 'failed',
      errors
    };
  }
}

/**
 * Extract text using OCR with pdf.js + tesseract.js
 */
async function extractTextWithOCR(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {

  try {
    // Load PDF with pdf.js
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(pdfBuffer),
      useSystemFonts: true,
      standardFontDataUrl: 'node_modules/pdfjs-dist/standard_fonts/',
    });

    const pdfDocument = await loadingTask.promise;
    const numPages = pdfDocument.numPages;

    console.log(`📖 [${fileName}] PDF loaded: ${numPages} pages`);

    // Create Tesseract worker
    const worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`   OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      }
    });

    let fullText = '';
    let totalConfidence = 0;
    let pagesProcessed = 0;

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        console.log(`📄 [${fileName}] Processing page ${pageNum}/${numPages}...`);

        // Get page
        const page = await pdfDocument.getPage(pageNum);

        // Get viewport at 2x scale for better OCR
        const viewport = page.getViewport({ scale: 2.0 });

        // Create canvas
        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        // Render PDF page to canvas
        await page.render({
          canvasContext: context as any,
          viewport: viewport
        }).promise;

        // Convert canvas to image buffer
        const imageBuffer = canvas.toBuffer('image/png');

        // Run OCR on the image
        const { data } = await worker.recognize(imageBuffer);

        if (data.text && data.text.trim().length > 0) {
          fullText += `\n\n--- Page ${pageNum} ---\n\n${data.text}`;
          totalConfidence += data.confidence;
          pagesProcessed++;

          console.log(`✅ [${fileName}] Page ${pageNum}: ${data.text.length} chars, ${data.confidence.toFixed(1)}% confidence`);
        } else {
          console.log(`⚠️ [${fileName}] Page ${pageNum}: No text found`);
        }

      } catch (pageErr: any) {
        console.error(`❌ [${fileName}] Error processing page ${pageNum}:`, pageErr.message);
      }
    }

    await worker.terminate();

    const avgConfidence = pagesProcessed > 0 ? totalConfidence / pagesProcessed : 0;

    console.log(`✅ [${fileName}] OCR complete: ${pagesProcessed}/${numPages} pages, ${fullText.length} characters, ${avgConfidence.toFixed(1)}% avg confidence`);

    return {
      text: fullText.trim(),
      pages: numPages,
      method: 'ocr',
      confidence: avgConfidence
    };

  } catch (error: any) {
    console.error(`❌ [${fileName}] OCR error:`, error);
    throw error;
  }
}
