/**
 * PDF OCR Utility
 * Extracts text from image-based PDFs using Tesseract OCR
 */

import { createWorker } from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Lazy-load pdf-parse to avoid ENOENT error
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
}

/**
 * Extract text from PDF - tries text extraction first, falls back to OCR
 */
export async function extractTextFromPDF(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {
  console.log(`📄 Extracting text from: ${fileName}`);

  // STEP 1: Try text extraction first (fast, for text-based PDFs)
  try {
    const pdfParseFunc = await getPdfParse();
    const pdfData = await pdfParseFunc(pdfBuffer);

    // Check if we got meaningful text (not just whitespace/garbage)
    const cleanText = pdfData.text.trim();
    if (cleanText.length > 50) { // At least 50 characters of actual text
      console.log(`✅ Text extraction successful: ${pdfData.numpages} pages, ${cleanText.length} characters`);
      return {
        text: cleanText,
        pages: pdfData.numpages,
        method: 'text-extraction'
      };
    }

    console.log(`⚠️ Text extraction returned minimal content (${cleanText.length} chars) - trying OCR...`);
  } catch (parseErr: any) {
    console.log(`⚠️ Text extraction failed: ${parseErr.message} - trying OCR...`);
  }

  // STEP 2: Fall back to OCR (slower, for scanned/image-based PDFs)
  try {
    const ocrResult = await extractTextWithOCR(pdfBuffer, fileName);
    return ocrResult;
  } catch (ocrErr: any) {
    console.error(`❌ OCR failed: ${ocrErr.message}`);
    return {
      text: '',
      pages: 1,
      method: 'failed'
    };
  }
}

/**
 * Extract text using OCR (for scanned PDFs)
 */
async function extractTextWithOCR(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PDFExtractionResult> {
  console.log(`🔍 Starting OCR for: ${fileName}`);

  const tempDir = os.tmpdir();
  const pdfPath = path.join(tempDir, `${Date.now()}-${fileName}`);

  try {
    // Write PDF to temp file (required by pdf2pic)
    fs.writeFileSync(pdfPath, pdfBuffer);

    // Convert PDF pages to images
    const options = {
      density: 300,        // DPI (higher = better quality, slower)
      saveFilename: `ocr-${Date.now()}`,
      savePath: tempDir,
      format: 'png',
      width: 2000,
      height: 2000
    };

    const convert = fromPath(pdfPath, options);

    // Get page count first
    const firstPage = await convert(1, { responseType: 'image' });
    const pageCount = 1; // pdf2pic doesn't easily give total pages, we'll estimate

    console.log(`📸 Converting PDF to images (estimated ${pageCount} page(s))...`);

    // Create Tesseract worker
    const worker = await createWorker('eng');

    let fullText = '';
    let totalConfidence = 0;
    let pagesProcessed = 0;

    // Process each page (we'll try up to 20 pages max to avoid hanging)
    const MAX_PAGES = 20;
    for (let pageNum = 1; pageNum <= MAX_PAGES; pageNum++) {
      try {
        console.log(`📄 Processing page ${pageNum}...`);

        const pageImage = await convert(pageNum, { responseType: 'image' });

        if (!pageImage || !pageImage.path) {
          console.log(`✅ Reached end of PDF at page ${pageNum - 1}`);
          break; // No more pages
        }

        // Run OCR on the image
        const { data } = await worker.recognize(pageImage.path);

        if (data.text && data.text.trim().length > 0) {
          fullText += `\n\n--- Page ${pageNum} ---\n\n${data.text}`;
          totalConfidence += data.confidence;
          pagesProcessed++;

          console.log(`✅ Page ${pageNum} OCR: ${data.text.length} chars, ${data.confidence.toFixed(1)}% confidence`);
        }

        // Clean up temp image
        if (fs.existsSync(pageImage.path)) {
          fs.unlinkSync(pageImage.path);
        }

      } catch (pageErr: any) {
        // If we get an error, assume we've reached the end of the PDF
        if (pageNum === 1) {
          throw pageErr; // First page should never fail
        }
        console.log(`✅ Reached end of PDF at page ${pageNum - 1}`);
        break;
      }
    }

    await worker.terminate();

    // Clean up temp PDF
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }

    const avgConfidence = pagesProcessed > 0 ? totalConfidence / pagesProcessed : 0;

    console.log(`✅ OCR complete: ${pagesProcessed} pages, ${fullText.length} characters, ${avgConfidence.toFixed(1)}% avg confidence`);

    return {
      text: fullText.trim(),
      pages: pagesProcessed,
      method: 'ocr',
      confidence: avgConfidence
    };

  } catch (error: any) {
    // Clean up on error
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
    }
    throw error;
  }
}
