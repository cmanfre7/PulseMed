#!/usr/bin/env node
/**
 * Hip Preservation PDF Ingestion Script
 * Extracts text from PDFs and adds them to the knowledge base
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Scan all PDFs under knowledge-base (e.g. Hip Arthroscopy/, PAO/, etc.)
const PDF_DIR = path.join(__dirname, '..', 'knowledge-base');
const KB_OUTPUT_DIR = path.join(__dirname, '..', 'knowledge-base', 'pdfs');
const PUBLIC_PDF_DIR = path.join(__dirname, '..', 'public', 'pdfs');
const INDEX_PATH = path.join(__dirname, '..', 'knowledge-base', 'index.json');

// Try to load pdf-parse
let pdfParse;
try {
  pdfParse = (await import('pdf-parse')).default;
} catch (e) {
  console.log('❌ pdf-parse not installed. Run: npm install pdf-parse');
  console.log('   Then re-run this script.\n');
  process.exit(1);
}

/**
 * Recursively find all PDF files in a directory
 */
function findPDFs(dir, basePath = '') {
  const results = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = basePath ? path.join(basePath, item) : item;
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      results.push(...findPDFs(fullPath, relativePath));
    } else if (item.toLowerCase().endsWith('.pdf')) {
      results.push({
        fullPath,
        relativePath,
        filename: item,
        category: basePath || 'general'
      });
    }
  }
  
  return results;
}

/**
 * Extract text from a PDF file
 */
async function extractPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pages: data.numpages,
    info: data.info || {}
  };
}

/**
 * Clean up extracted text
 */
function cleanText(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Generate a clean ID from filename
 */
function generateId(filename) {
  return filename
    .replace('.pdf', '')
    .replace(/\(\d+\)/g, '') // Remove (1), (2) etc
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .replace(/-+/g, '-');
}

/**
 * Generate a readable title from filename
 */
function generateTitle(filename) {
  return filename
    .replace('.pdf', '')
    .replace(/\(\d+\)/g, '') // Remove (1), (2) etc
    .replace(/_/g, ' ')
    .trim();
}

/**
 * Map folder names to categories
 */
function mapCategory(folderName) {
  const map = {
    'Periacetabular Osteotomy': 'pao',
    'Therapy and Rehab': 'rehab',
    'Hip Dysplasia': 'dysplasia',
    'Combined Hip Arthroscopy and PAO': 'combined',
    'Hip Arthroscopy': 'arthroscopy'
  };
  return map[folderName] || folderName.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Main ingestion function
 */
async function ingestPDFs() {
  console.log('📄 Hip Preservation PDF Ingestion\n');
  console.log('='.repeat(50));
  
  // Check if PDF directory exists
  if (!fs.existsSync(PDF_DIR)) {
    console.log(`\n❌ PDF directory not found: ${PDF_DIR}`);
    return;
  }
  
  // Find all PDFs recursively
  const pdfFiles = findPDFs(PDF_DIR);
  
  if (pdfFiles.length === 0) {
    console.log(`\n⚠️  No PDF files found in: ${PDF_DIR}`);
    return;
  }
  
  console.log(`\n📁 Found ${pdfFiles.length} PDF files:\n`);
  
  // Group by category for display
  const byCategory = {};
  for (const pdf of pdfFiles) {
    const cat = pdf.category;
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(pdf.filename);
  }
  
  for (const [cat, files] of Object.entries(byCategory)) {
    console.log(`   📂 ${cat} (${files.length})`);
    files.forEach(f => console.log(`      • ${f}`));
  }
  
  // Create output directories
  fs.mkdirSync(KB_OUTPUT_DIR, { recursive: true });
  fs.mkdirSync(PUBLIC_PDF_DIR, { recursive: true });
  
  const kbEntries = [];
  let successCount = 0;
  let errorCount = 0;
  
  console.log('\n' + '-'.repeat(50));
  console.log('\n🔄 Processing PDFs...\n');
  
  for (const pdf of pdfFiles) {
    const id = generateId(pdf.filename);
    const title = generateTitle(pdf.filename);
    const category = mapCategory(pdf.category);
    
    process.stdout.write(`   Processing: ${pdf.filename.substring(0, 40)}...`);
    
    try {
      // Extract PDF content
      const extracted = await extractPDF(pdf.fullPath);
      const cleanedText = cleanText(extracted.text);
      
      if (cleanedText.length < 50) {
        console.log(' ⚠️ (very little text extracted)');
      } else {
        console.log(` ✓ (${cleanedText.length.toLocaleString()} chars)`);
      }
      
      // Create markdown file
      const mdContent = `---
title: "${title}"
source: "${pdf.filename}"
category: "${category}"
folder: "${pdf.category}"
pages: ${extracted.pages}
extractedAt: "${new Date().toISOString()}"
---

# ${title}

**Category:** ${pdf.category}  
**Pages:** ${extracted.pages}

---

${cleanedText}
`;
      
      const mdPath = path.join(KB_OUTPUT_DIR, `${id}.md`);
      fs.writeFileSync(mdPath, mdContent);
      
      // Copy PDF to public folder for viewing
      const publicPdfPath = path.join(PUBLIC_PDF_DIR, `${id}.pdf`);
      fs.copyFileSync(pdf.fullPath, publicPdfPath);
      
      // Add to KB entries
      kbEntries.push({
        path: `pdfs/${id}.md`,
        title: title,
        category: category,
        folder: pdf.category,
        source: pdf.filename,
        pdfFile: `${id}.pdf`,
        pages: extracted.pages,
        chars: cleanedText.length
      });
      
      successCount++;
      
    } catch (error) {
      console.log(` ❌ Error: ${error.message}`);
      errorCount++;
    }
  }
  
  // Update index.json
  console.log('\n' + '-'.repeat(50));
  console.log('\n📊 Updating knowledge base index...\n');
  
  let index = { documents: [] };
  if (fs.existsSync(INDEX_PATH)) {
    index = JSON.parse(fs.readFileSync(INDEX_PATH, 'utf-8'));
  }
  
  // Remove old PDF entries and add new ones
  index.documents = index.documents.filter(d => !d.path.startsWith('pdfs/'));
  index.documents.push(...kbEntries);
  index.totalDocs = index.documents.length;
  index.pdfIngestedAt = new Date().toISOString();
  index.pdfCount = kbEntries.length;
  
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  
  // Summary
  console.log('✅ PDF INGESTION COMPLETE\n');
  console.log('📊 Summary:');
  console.log(`   • PDFs processed: ${successCount}`);
  console.log(`   • Errors: ${errorCount}`);
  console.log(`   • Total KB documents: ${index.totalDocs}`);
  console.log(`   • PDFs copied to: public/pdfs/`);
  console.log(`   • Markdown saved to: knowledge-base/pdfs/\n`);
  
  console.log('📂 By category:');
  const catCounts = {};
  kbEntries.forEach(e => {
    catCounts[e.folder] = (catCounts[e.folder] || 0) + 1;
  });
  Object.entries(catCounts).forEach(([cat, count]) => {
    console.log(`   • ${cat}: ${count}`);
  });
  
  console.log('\n🚀 Next steps:');
  console.log('   1. Restart the server to load new KB content');
  console.log('   2. Commit and push changes to deploy');
  console.log('   3. Test queries related to PDF content\n');
}

// Run
ingestPDFs().catch(console.error);
