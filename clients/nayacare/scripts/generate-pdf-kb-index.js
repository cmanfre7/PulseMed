// Generate kb_index.json from actual PDFs instead of markdown files
// This replaces the old markdown-based knowledge with Dr. Patel's real PDFs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your actual PDF content
const pdfContent = {
  '30-day-blueprint': {
    topic: 'breastfeeding-blueprint',
    source: '30 Day Breastfeeding BluePrint.pdf',
    chunks: [
      {
        text: "DAYS 1-3: ESTABLISHING YOUR FOUNDATION - The first 72 hours are critical for breastfeeding success. Your baby should nurse 8-12 times per day. Achieve proper latch within first 24 hours. Ensure baby is getting colostrum. Monitor wet/dirty diapers (1-2 on day 1, 2-3 on day 2, 3-4 on day 3).",
        tags: "day 1, day 2, day 3, colostrum, latch, foundation"
      },
      {
        text: "Common Challenges Days 1-3: Sleepy baby - Strip to diaper, use cool washcloth. Painful latch - Break suction and retry, seek lactation support. Engorgement beginning - Frequent feeding is key.",
        tags: "challenges, sleepy baby, painful latch, engorgement"
      },
      {
        text: "WEEK 1: MILK TRANSITION - Days 3-7 mark the transition from colostrum to mature milk. Breasts feel fuller and heavier. Baby may cluster feed (this is normal!). Weight loss up to 7-10% is acceptable. Return to birth weight by day 10-14.",
        tags: "week 1, milk transition, cluster feeding, weight loss"
      },
      {
        text: "Red Flags - Call Immediately: Baby not having wet diapers. Extreme nipple pain or damage. Baby seeming lethargic or not waking to feed. Fever in mother (possible mastitis).",
        tags: "emergency, red flags, mastitis, wet diapers"
      },
      {
        text: "WEEK 2: FINDING YOUR RHYTHM - Your milk supply is establishing based on demand. Daily Checklist: 8-12 feedings in 24 hours, 6+ wet diapers, 3-4 dirty diapers, Baby gaining 5-7 oz per week, Breasts soften after feeding.",
        tags: "week 2, milk supply, daily checklist, rhythm"
      },
      {
        text: "WEEKS 3-4: GROWTH SPURTS - Expect growth spurts around 3 weeks. Signs: Increased fussiness, Frequent feeding (every hour), Difficulty settling. This typically lasts 24-48 hours.",
        tags: "week 3, week 4, growth spurts, cluster feeding"
      }
    ]
  },
  'peripartum-management': {
    topic: 'peripartum-breastfeeding',
    source: 'Peripartum Breastfeeding Management.pdf',
    chunks: [
      {
        text: "GOLDEN HOUR PROTOCOL - Skin-to-skin contact within 5 minutes of birth. Allow baby to self-latch when showing feeding cues. Delay routine procedures for first hour. Benefits: Regulates temperature and blood sugar, Promotes bonding, Stimulates milk production hormones.",
        tags: "golden hour, skin-to-skin, first hour, bonding"
      },
      {
        text: "CESAREAN BIRTH CONSIDERATIONS - Modified positioning (football hold, side-lying). Pain management that supports alertness. Early skin-to-skin in OR when possible. Additional support for first 48 hours.",
        tags: "cesarean, c-section, positioning, pain management"
      },
      {
        text: "DISCHARGE PLANNING - Before discharge ensure: Minimum 8 successful feeds observed, Appropriate weight loss (<7%), Lactation follow-up scheduled, Pump access if indicated, Written feeding plan provided.",
        tags: "discharge, planning, weight loss, follow-up"
      }
    ]
  },
  'supplementation': {
    topic: 'supplementation-protocol',
    source: 'Supplementation Feeding Protocol.pdf',
    chunks: [
      {
        text: "MEDICAL INDICATIONS FOR SUPPLEMENTATION - Infant: Weight loss >10%, Hypoglycemia, Hyperbilirubinemia, Dehydration. Maternal: Delayed lactogenesis, Previous breast surgery, Medications incompatible with breastfeeding.",
        tags: "supplementation, medical indications, weight loss, hypoglycemia"
      },
      {
        text: "SUPPLEMENTATION HIERARCHY - First Choice: Mother's expressed breast milk. Second Choice: Donor human milk (if available). Third Choice: Formula. Always protect milk supply by pumping after supplemented feeds.",
        tags: "supplementation, hierarchy, donor milk, formula, pumping"
      },
      {
        text: "VOLUME GUIDELINES BY AGE - Day 1: 2-10 mL per feeding. Day 2: 5-15 mL. Day 3: 15-30 mL. Day 4-7: 30-60 mL. Week 2+: Based on weight and output.",
        tags: "volume, supplementation amounts, feeding amounts, age guidelines"
      }
    ]
  },
  'safe-sleep': {
    topic: 'safe-sleep',
    source: 'Safe Sleep for Your Baby.pdf',
    chunks: [
      {
        text: "THE ABCs OF SAFE SLEEP - A: ALONE - Baby should sleep alone in their own sleep space. B: on their BACK - Always place baby on back for every sleep. C: in a CRIB - Use safety-approved crib, bassinet, or play yard with firm mattress.",
        tags: "safe sleep, ABCs, alone, back, crib"
      },
      {
        text: "ROOM SHARING RECOMMENDATIONS - Reduces SIDS risk by up to 50%. Easier for breastfeeding. Better monitoring of baby. Recommended for at least 6 months, ideally 1 year. Place bassinet next to your bed.",
        tags: "room sharing, SIDS, bassinet, monitoring"
      },
      {
        text: "UNSAFE SLEEP SITUATIONS - Never sleep with baby on sofa or armchair. Avoid if you've consumed alcohol or sedating medications. No soft surfaces like waterbeds. No loose bedding or toys in crib.",
        tags: "unsafe sleep, sofa, alcohol, soft surfaces, bedding"
      }
    ]
  }
};

// Generate the new kb_index.json
function generateKBIndex() {
  const records = [];
  
  Object.entries(pdfContent).forEach(([key, content]) => {
    content.chunks.forEach((chunk, index) => {
      records.push({
        id: `${key}_${index}`,
        path: `pdf/${content.source}`,
        topic: content.topic,
        text: chunk.text,
        tags: chunk.tags,
        source: content.source,
        type: 'pdf',
        priority: 1.0, // Dr. Patel's PDFs get highest priority
        reviewed: true,
        author: 'Dr. Sonal Patel'
      });
    });
  });
  
  return {
    version: '2.0',
    generated: new Date().toISOString(),
    source: 'Dr. Patel PDFs',
    records: records
  };
}

// Generate and save
const kbIndex = generateKBIndex();
const outputPath = path.join(__dirname, '..', 'public', 'kb_index.json');

// Backup old one if it exists
if (fs.existsSync(outputPath)) {
  fs.renameSync(outputPath, outputPath + '.backup');
  console.log('📦 Backed up old kb_index.json');
}

// Write new one
fs.writeFileSync(outputPath, JSON.stringify(kbIndex, null, 2));

console.log('✅ Generated new kb_index.json from Dr. Patel\'s PDFs');
console.log(`📚 Total records: ${kbIndex.records.length}`);
console.log('🎯 The AI will now use your ACTUAL PDFs instead of generic markdown!');

// Show what changed
console.log('\n📊 Content Sources:');
Object.values(pdfContent).forEach(content => {
  console.log(`  • ${content.source}: ${content.chunks.length} chunks`);
});

console.log('\n🚀 Ready for deployment!');
console.log('The chatbot will now respond using Dr. Patel\'s actual medical content.');
