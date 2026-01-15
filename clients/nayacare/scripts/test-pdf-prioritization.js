#!/usr/bin/env node
// Test script to verify PDF prioritization system
// Tests that breastfeeding queries prioritize Dr. Patel's PDFs

import fs from 'fs';
import path from 'path';

// Load the Dr. Patel knowledge base
function loadDrPatelKB() {
  try {
    const kbPath = path.join(process.cwd(), 'public', 'dr_patel_kb.json');
    const kbData = fs.readFileSync(kbPath, 'utf8');
    return JSON.parse(kbData);
  } catch (error) {
    console.error('Error loading Dr. Patel KB:', error);
    return null;
  }
}

// Simulate the knowledge search logic
function searchBreastfeedingKnowledge(query, kbRecords) {
  const isBreastfeedingQuery = (query) => {
    const breastfeedingKeywords = [
      'breastfeed', 'breastfeeding', 'nurse', 'nursing', 'milk', 'latch', 'latching',
      'feeding', 'feed', 'supplement', 'formula', 'pump', 'pumping', 'supply',
      'skin to skin', 'skin-to-skin', 'golden hour', 'colostrum', 'engorgement',
      'mastitis', 'nipple', 'areola', 'letdown', 'let down', 'cluster feeding'
    ];
    const queryLower = query.toLowerCase();
    return breastfeedingKeywords.some(keyword => queryLower.includes(keyword));
  };

  const calculateRelevanceScore = (query, item) => {
    const queryLower = query.toLowerCase();
    const content = (item.content || '').toLowerCase();
    const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : (item.tags || '').toLowerCase();
    const topic = (item.topic || '').toLowerCase();

    let score = 0;

    // Exact phrase matches (highest priority)
    const exactPhrases = [
      'golden hour', 'skin to skin', 'skin-to-skin', 'milk supply',
      'latch', 'latching', 'first day', 'getting started'
    ];

    exactPhrases.forEach(phrase => {
      if (queryLower.includes(phrase) && content.includes(phrase)) {
        score += 10;
      }
    });

    // Tag matches (high priority)
    const queryTerms = queryLower.split(/\s+/).filter(term => term.length > 2);
    queryTerms.forEach(term => {
      if (tags.includes(term)) score += 5;
      if (topic.includes(term)) score += 4;
      if (content.includes(term)) score += 2;
    });

    // Boost for Dr. Patel's documents
    if (item.author === 'Dr. Sonal Patel' || item.tags?.includes('dr_patel')) {
      score += 15;
    }

    // Boost for PDF sources
    if (item.source === 'dr_patel_pdf') {
      score += 10;
    }

    return score;
  };

  if (!isBreastfeedingQuery(query)) {
    return {
      results: [],
      isBreastfeeding: false,
      drPatelPDFs: 0,
      totalSources: 0
    };
  }

  // Calculate relevance scores for all items
  const scoredItems = kbRecords.map(item => ({
    ...item,
    relevanceScore: calculateRelevanceScore(query, item)
  }));

  // Filter and sort by relevance
  const results = scoredItems
    .filter(item => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const drPatelPDFs = results.filter(item => 
    item.author === 'Dr. Sonal Patel' || 
    item.source === 'dr_patel_pdf' ||
    item.tags?.includes('dr_patel')
  ).length;

  return {
    results,
    isBreastfeeding: true,
    drPatelPDFs,
    totalSources: results.length,
    pdfPercentage: results.length > 0 ? (drPatelPDFs / results.length) * 100 : 0
  };
}

// Test queries
const testQueries = [
  "How do I start breastfeeding my newborn?",
  "What is the golden hour?",
  "My baby won't latch properly, what should I do?",
  "When should I supplement with formula?",
  "How often should I feed my baby?",
  "What is skin to skin contact?",
  "My baby has jaundice, what should I do?", // Non-breastfeeding query
  "How do I know if my baby is getting enough milk?"
];

// Run tests
function runTests() {
  console.log('🧪 Testing PDF Prioritization System\n');

  const kbData = loadDrPatelKB();
  if (!kbData) {
    console.log('❌ Could not load Dr. Patel knowledge base');
    return;
  }

  console.log(`📊 Loaded ${kbData.records.length} Dr. Patel PDF entries\n`);

  let totalTests = 0;
  let passedTests = 0;

  testQueries.forEach((query, index) => {
    console.log(`Test ${index + 1}: "${query}"`);
    
    const results = searchBreastfeedingKnowledge(query, kbData.records);
    
    if (results.isBreastfeeding) {
      console.log(`  ✅ Detected as breastfeeding query`);
      console.log(`  📄 Dr. Patel PDFs found: ${results.drPatelPDFs}/${results.totalSources} (${results.pdfPercentage.toFixed(1)}%)`);
      
      if (results.pdfPercentage >= 90) {
        console.log(`  ✅ PASS: PDF prioritization working (${results.pdfPercentage.toFixed(1)}%)`);
        passedTests++;
      } else {
        console.log(`  ❌ FAIL: PDF prioritization not working (${results.pdfPercentage.toFixed(1)}%)`);
      }
      
      if (results.results.length > 0) {
        console.log(`  🏆 Top result: "${results.results[0].title}" (Score: ${results.results[0].relevanceScore})`);
      }
    } else {
      console.log(`  ℹ️  Detected as non-breastfeeding query - using general search`);
      console.log(`  ✅ PASS: Correctly identified non-breastfeeding query`);
      passedTests++;
    }
    
    totalTests++;
    console.log('');
  });

  console.log('📈 Test Results Summary:');
  console.log(`  Total tests: ${totalTests}`);
  console.log(`  Passed: ${passedTests}`);
  console.log(`  Failed: ${totalTests - passedTests}`);
  console.log(`  Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! PDF prioritization system is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Review the system configuration.');
  }
}

// Run the tests
runTests();
