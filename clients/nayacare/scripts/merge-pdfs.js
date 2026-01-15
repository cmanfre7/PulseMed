import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// PDF merging using pdf-lib library
// Note: You'll need to install pdf-lib: npm install pdf-lib

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function mergePDFs() {
  try {
    // Import pdf-lib dynamically since it's not installed yet
    const { PDFDocument } = await import('pdf-lib');
    
    const sourceDir = 'C:\\Users\\cmanf\\Desktop\\Breastfeeding 30 days';
    const outputPath = path.join(process.cwd(), 'public', 'merged-breastfeeding-30-days.pdf');
    
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Get all PDF files from the directory
    const files = fs.readdirSync(sourceDir)
      .filter(file => file.toLowerCase().endsWith('.pdf'))
      .sort((a, b) => {
        // Sort by the number in the filename
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
      });
    
    console.log(`Found ${files.length} PDF files to merge:`);
    files.forEach(file => console.log(`  - ${file}`));
    
    // Process each PDF file
    for (const file of files) {
      const filePath = path.join(sourceDir, file);
      console.log(`Processing: ${file}`);
      
      try {
        // Read the PDF file
        const pdfBytes = fs.readFileSync(filePath);
        
        // Load the PDF document
        const pdf = await PDFDocument.load(pdfBytes);
        
        // Copy all pages from the current PDF to the merged PDF
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach(page => mergedPdf.addPage(page));
        
        console.log(`  ✓ Added ${pdf.getPageCount()} pages from ${file}`);
      } catch (error) {
        console.error(`  ✗ Error processing ${file}:`, error.message);
      }
    }
    
    // Save the merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);
    
    console.log(`\n✅ Successfully merged ${files.length} PDFs into: ${outputPath}`);
    console.log(`📄 Total pages in merged PDF: ${mergedPdf.getPageCount()}`);
    console.log(`📁 File size: ${(mergedPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error merging PDFs:', error);
    
    if (error.message.includes('Cannot resolve module')) {
      console.log('\n📦 Installing required dependencies...');
      console.log('Please run: npm install pdf-lib');
      console.log('Then run this script again.');
    }
  }
}

// Run the merge function
mergePDFs().catch(console.error);

export { mergePDFs };
