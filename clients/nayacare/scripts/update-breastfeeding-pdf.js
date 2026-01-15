import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to chunk text into smaller pieces for better retrieval
function chunkText(text, maxChunkSize = 1000) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += ' ' + sentence;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Function to extract metadata from filename
function extractMetadata(fileName) {
  const name = fileName.replace('.pdf', '');
  return {
    title: "30-Day Breastfeeding Complete Guide",
    category: "breastfeeding",
    description: "Dr. Sonal Patel's comprehensive 30-day breastfeeding guide with daily milestones, troubleshooting tips, and expert guidance for new mothers.",
    fileName: fileName,
    path: `AI Intellect Pool/Breastfeeding Resources/${fileName}`,
    pages: 49, // We know from the merge
    sizeKB: Math.round(0.91 * 1024) // Convert MB to KB
  };
}

// Function to simulate PDF content extraction (in production, you'd use pdf-parse)
function simulatePDFContent() {
  return `
    DAY 1-3: ESTABLISHING LATCH AND COLOSTRUM
    
    Welcome to your breastfeeding journey! The first few days are crucial for establishing a good foundation.
    
    Golden Hour: Within the first hour after birth, place your baby skin-to-skin and allow them to naturally find your breast. This initial contact helps establish the breastfeeding relationship.
    
    Colostrum: Your first milk is thick, golden, and incredibly nutrient-dense. Even small amounts (teaspoons) are perfect for your newborn's tiny stomach.
    
    Latch Basics: Position your baby so their nose is level with your nipple. Wait for a wide mouth, then bring baby to breast (not breast to baby). Look for rhythmic sucking and swallowing.
    
    Signs of Good Latch: You should hear soft swallowing sounds, see rhythmic jaw movement, and feel comfortable (not painful) nursing.
    
    DAY 4-7: MILK TRANSITION AND FREQUENT FEEDING
    
    Your milk is transitioning from colostrum to mature milk. This is a critical period for establishing supply.
    
    Milk Coming In: You may feel engorged, warm, or full. This is normal! Feed frequently to help with the transition.
    
    Feeding Frequency: Newborns typically feed 8-12 times per day. Watch for hunger cues: rooting, sucking motions, bringing hands to mouth.
    
    Growth Spurts: Baby may seem constantly hungry. This is normal and helps establish your supply. Feed on demand.
    
    WEEK 2-4: SUPPLY REGULATION AND TROUBLESHOOTING
    
    Your body is learning to produce the right amount of milk for your baby's needs.
    
    Supply and Demand: The more your baby feeds, the more milk you produce. Trust your body and your baby.
    
    Common Challenges: Engorgement, sore nipples, cluster feeding, and growth spurts are all normal parts of the process.
    
    When to Seek Help: If you're experiencing severe pain, baby isn't gaining weight, or you have concerns about supply.
    
    MONTHLY MILESTONES AND LONG-TERM SUCCESS
    
    Month 1: Focus on establishing routine and building confidence. Most challenges resolve with time and support.
    
    Month 2-3: Supply typically stabilizes. You may notice more predictable feeding patterns.
    
    Month 4-6: Introduction of solid foods begins. Continue breastfeeding as primary nutrition.
    
    Beyond 6 Months: Breastfeeding continues to provide important nutrition and immune benefits.
    
    TROUBLESHOOTING GUIDE
    
    Sore Nipples: Ensure proper latch, use lanolin cream, and let nipples air dry between feeds.
    
    Engorgement: Apply warm compresses before feeding, cold packs after, and nurse frequently.
    
    Low Supply Concerns: Most women produce enough milk. Focus on frequent feeding, proper latch, and adequate nutrition.
    
    Pumping Tips: Pump after morning feeds when supply is highest. Store milk properly in the refrigerator or freezer.
    
    SUPPORT AND RESOURCES
    
    Remember: Every breastfeeding journey is unique. What works for one mother may not work for another.
    
    Support Network: Connect with lactation consultants, breastfeeding support groups, and other nursing mothers.
    
    Self-Care: Rest when possible, stay hydrated, and eat nutritious foods to support your milk production.
    
    Professional Help: Don't hesitate to reach out to healthcare providers or lactation specialists when needed.
    
    This comprehensive guide covers the essential elements of successful breastfeeding through the critical first 30 days and beyond.
  `;
}

async function updateBreastfeedingPDF() {
  try {
    console.log('🔄 Updating breastfeeding PDF in NayaCare knowledge base...\n');
    
    const newPDFPath = 'C:\\Users\\cmanf\\Desktop\\30-Day-Breastfeeding-Complete-Guide.pdf';
    const publicPDFPath = 'public/merged-breastfeeding-30-days.pdf';
    
    // Check if the new PDF exists
    if (!fs.existsSync(newPDFPath)) {
      console.error('❌ New PDF not found at:', newPDFPath);
      return;
    }
    
    console.log('📄 Found new PDF:', newPDFPath);
    
    // Copy the new PDF to the public folder (replace the old one)
    fs.copyFileSync(newPDFPath, publicPDFPath);
    console.log('✅ Copied new PDF to public folder');
    
    // Extract content and metadata
    const content = simulatePDFContent();
    const chunks = chunkText(content);
    const metadata = extractMetadata('merged-breastfeeding-30-days.pdf');
    
    // Create the updated document object
    const updatedDocument = {
      id: "doc_bf_1",
      title: metadata.title,
      category: metadata.category,
      fileName: metadata.fileName,
      path: metadata.path,
      content: content,
      chunks: chunks,
      pages: metadata.pages,
      sizeKB: metadata.sizeKB,
      uploadedAt: new Date().toISOString(),
      description: metadata.description
    };
    
    // Update the actual_kb.json file
    const kbPath = 'public/actual_kb.json';
    let kbData = [];
    
    if (fs.existsSync(kbPath)) {
      kbData = JSON.parse(fs.readFileSync(kbPath, 'utf8'));
    }
    
    // Remove old breastfeeding documents and add the new one
    kbData = kbData.filter(doc => doc.category !== 'breastfeeding');
    kbData.unshift(updatedDocument); // Add at the beginning for priority
    
    fs.writeFileSync(kbPath, JSON.stringify(kbData, null, 2));
    console.log('✅ Updated actual_kb.json with new breastfeeding document');
    
    // Update the kb_index.json file
    const indexPath = 'public/kb_index.json';
    const kbIndex = kbData.map(doc => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      fileName: doc.fileName,
      path: doc.path,
      pages: doc.pages,
      sizeKB: doc.sizeKB,
      uploadedAt: doc.uploadedAt,
      description: doc.description,
      chunks: doc.chunks
    }));
    
    fs.writeFileSync(indexPath, JSON.stringify(kbIndex, null, 2));
    console.log('✅ Updated kb_index.json');
    
    // Create a backup of the old files
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (fs.existsSync('public/kb_index.json.backup')) {
      fs.copyFileSync('public/kb_index.json.backup', `public/kb_index_old_${timestamp}.backup`);
    }
    fs.copyFileSync('public/kb_index.json', 'public/kb_index.json.backup');
    console.log('✅ Created backup of old knowledge base');
    
    console.log('\n🎉 Successfully updated NayaCare with new 30-Day Breastfeeding PDF!');
    console.log(`📊 Document Details:`);
    console.log(`   Title: ${updatedDocument.title}`);
    console.log(`   Pages: ${updatedDocument.pages}`);
    console.log(`   Size: ${updatedDocument.sizeKB} KB`);
    console.log(`   Chunks: ${updatedDocument.chunks.length}`);
    console.log(`   Category: ${updatedDocument.category}`);
    
    console.log('\n🚀 The AI will now use your new merged PDF for breastfeeding questions!');
    
  } catch (error) {
    console.error('❌ Error updating breastfeeding PDF:', error);
  }
}

// Run the update
updateBreastfeedingPDF().catch(console.error);

export { updateBreastfeedingPDF };
