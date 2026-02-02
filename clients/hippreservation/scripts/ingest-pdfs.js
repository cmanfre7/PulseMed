#!/usr/bin/env node
/**
 * Hip Preservation PDF Ingestion Script
 * Extracts text from PDFs and adds them to the knowledge base
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_DIR = path.join(__dirname, '..', 'public', 'pdfs');
const KB_DIR = path.join(__dirname, '..', 'knowledge-base', 'pdfs');
const INDEX_PATH = path.join(__dirname, '..', 'knowledge-base', 'index.json');

// Try to load pdf-parse, provide fallback instructions if not installed
let pdfParse;
try {
  pdfParse = (await import('pdf-parse')).default;
} catch (e) {
  console.log('❌ pdf-parse not installed. Run: npm install pdf-parse');
  console.log('   Then re-run this script.\n');
  process.exit(1);
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
 * Chunk text into smaller pieces for retrieval
 */
function chunkText(text, maxSize = 600) {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/);
  let current = '';
  
  for (const para of paragraphs) {
    if ((current + para).length > maxSize && current) {
      chunks.push({
        text: current.trim(),
        type: detectChunkType(current)
      });
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  
  if (current) {
    chunks.push({
      text: current.trim(),
      type: detectChunkType(current)
    });
  }
  
  return chunks;
}

/**
 * Detect the type of content in a chunk
 */
function detectChunkType(text) {
  const lower = text.toLowerCase();
  
  if (lower.includes('emergency') || lower.includes('call 911') || 
      lower.includes('red flag') || lower.includes('seek immediate')) {
    return 'emergency';
  }
  if (lower.includes('day 1') || lower.includes('week 1') || 
      lower.includes('timeline') || lower.includes('day-by-day')) {
    return 'timeline';
  }
  if (lower.includes('protocol') || lower.includes('step 1') || 
      lower.includes('procedure') || lower.includes('instructions')) {
    return 'protocol';
  }
  if (lower.includes('tip') || lower.includes('recommendation') || 
      lower.includes('advice') || lower.includes('best practice')) {
    return 'advice';
  }
  if (lower.includes('q:') || lower.includes('question') || 
      lower.includes('faq') || lower.includes('a:')) {
    return 'faq';
  }
  
  return 'general';
}

/**
 * Generate a clean ID from filename
 */
function generateId(filename) {
  return filename
    .replace('.pdf', '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate a readable title from filename
 */
function generateTitle(filename) {
  return filename
    .replace('.pdf', '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Main ingestion function
 */
async function ingestPDFs() {
  console.log('📄 Hip Preservation PDF Ingestion\n');
  console.log('=' .repeat(50));
  
  // Check if PDF directory exists
  if (!fs.existsSync(PDF_DIR)) {
    console.log(`\n❌ PDF directory not found: ${PDF_DIR}`);
    console.log('   Create this folder and add your PDFs, then re-run.');
    fs.mkdirSync(PDF_DIR, { recursive: true });
    console.log('   ✓ Created empty folder for you.\n');
    return;
  }
  
  // Get PDF files
  const files = fs.readdirSync(PDF_DIR).filter(f => f.toLowerCase().endsWith('.pdf'));
  
  if (files.length === 0) {
    console.log(`\n⚠️  No PDF files found in: ${PDF_DIR}`);
    console.log('   Add your PDFs to this folder and re-run.\n');
    return;
  }
  
  console.log(`\n📁 Found ${files.length} PDF files:\n`);
  files.forEach(f => console.log(`   • ${f}`));
  
  // Create KB pdfs directory
  fs.mkdirSync(KB_DIR, { recursive: true });
  
  const kbEntries = [];
  const chunkStats = { emergency: 0, timeline: 0, protocol: 0, advice: 0, faq: 0, general: 0 };
  
  console.log('\n' + '-'.repeat(50));
  
  for (const file of files) {
    console.log(`\n📄 Processing: ${file}`);
    
    const filePath = path.join(PDF_DIR, file);
    const id = generateId(file);
    const title = generateTitle(file);
    
    try {
      // Extract PDF content
      const extracted = await extractPDF(filePath);
      const cleanedText = cleanText(extracted.text);
      const chunks = chunkText(cleanedText);
      
      // Count chunk types
      chunks.forEach(c => chunkStats[c.type]++);
      
      // Create markdown file
      const mdContent = `---
title: "${title}"
source: "${file}"
category: pdf
pages: ${extracted.pages}
extractedAt: "${new Date().toISOString()}"
chunkCount: ${chunks.length}
---

# ${title}

${cleanedText}
`;
      
      const mdPath = path.join(KB_DIR, `${id}.md`);
      fs.writeFileSync(mdPath, mdContent);
      
      // Add to KB entries
      kbEntries.push({
        path: `pdfs/${id}.md`,
        title: title,
        category: 'pdf',
        source: file,
        pages: extracted.pages,
        chunks: chunks.length,
        chunkTypes: [...new Set(chunks.map(c => c.type))]
      });
      
      console.log(`   ✓ Extracted: ${cleanedText.length.toLocaleString()} chars`);
      console.log(`   ✓ Pages: ${extracted.pages}`);
      console.log(`   ✓ Chunks: ${chunks.length}`);
      console.log(`   ✓ Saved to: knowledge-base/pdfs/${id}.md`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
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
  index.documents = index.documents.filter(d => d.category !== 'pdf');
  index.documents.push(...kbEntries);
  index.totalDocs = index.documents.length;
  index.pdfIngestedAt = new Date().toISOString();
  
  fs.writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2));
  
  // Summary
  console.log('✅ PDF INGESTION COMPLETE\n');
  console.log('📊 Summary:');
  console.log(`   • PDFs processed: ${kbEntries.length}`);
  console.log(`   • Total chunks created: ${Object.values(chunkStats).reduce((a, b) => a + b, 0)}`);
  console.log(`   • Chunk breakdown:`);
  Object.entries(chunkStats).forEach(([type, count]) => {
    if (count > 0) console.log(`     - ${type}: ${count}`);
  });
  console.log(`\n   • Knowledge base now has ${index.totalDocs} documents`);
  console.log(`   • Index updated: knowledge-base/index.json\n`);
  
  console.log('🚀 Next steps:');
  console.log('   1. Restart the server to load new KB content');
  console.log('   2. Test queries related to your PDF content');
  console.log('   3. Verify the chatbot uses PDF information in responses\n');
}

// Run
ingestPDFs().catch(console.error);
