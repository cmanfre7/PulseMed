// Enhanced Knowledge Manager with PDF Priority System
// Prioritizes Dr. Patel's vetted PDFs for breastfeeding queries

import { KBManager } from '../admin/kb-manager.js';
import type { KBItem } from '../admin/kb-manager.js';

interface PrioritizedKBItem extends KBItem {
  priority: number;
  source: 'dr_patel_pdf' | 'uptodate' | 'amboss' | 'general';
  relevanceScore: number;
}

interface KnowledgeResponse {
  primarySources: PrioritizedKBItem[];
  fallbackSources: PrioritizedKBItem[];
  confidence: number;
  sourceBreakdown: {
    drPatelPDFs: number;
    uptodate: number;
    amboss: number;
    general: number;
  };
}

class PDFKnowledgeManager {
  private kbManager: KBManager;
  private drPatelPDFs: PrioritizedKBItem[] = [];
  
  constructor(config: { accessToken: string; portalId: string; tableId: string }) {
    this.kbManager = new KBManager(config);
  }

  // Initialize by loading Dr. Patel's PDFs with high priority
  async initialize(): Promise<void> {
    try {
      const allItems = await this.kbManager.getKBItems({ is_active: true });
      
      // Filter and prioritize Dr. Patel's PDFs
      this.drPatelPDFs = allItems
        .filter(item => 
          item.author === 'Dr. Sonal Patel' || 
          item.tags?.includes('dr_patel') ||
          item.source_url?.includes('pdf://')
        )
        .map(item => ({
          ...item,
          priority: 95, // Very high priority
          source: 'dr_patel_pdf' as const,
          relevanceScore: 0
        }));

      console.log(`Loaded ${this.drPatelPDFs.length} Dr. Patel PDF documents`);
    } catch (error) {
      console.error('Error initializing PDF knowledge manager:', error);
    }
  }

  // Enhanced search with PDF prioritization for breastfeeding queries
  async searchBreastfeedingKnowledge(query: string, limit: number = 8): Promise<KnowledgeResponse> {
    const isBreastfeedingQuery = this.isBreastfeedingRelated(query);
    
    if (!isBreastfeedingQuery) {
      // For non-breastfeeding queries, use standard search
      return this.searchGeneralKnowledge(query, limit);
    }

    // For breastfeeding queries, prioritize Dr. Patel's PDFs (90% preference)
    const drPatelResults = await this.searchDrPatelPDFs(query, Math.ceil(limit * 0.9));
    const fallbackResults = await this.searchFallbackSources(query, Math.ceil(limit * 0.1));

    const sourceBreakdown = {
      drPatelPDFs: drPatelResults.length,
      uptodate: fallbackResults.filter(r => r.source === 'uptodate').length,
      amboss: fallbackResults.filter(r => r.source === 'amboss').length,
      general: fallbackResults.filter(r => r.source === 'general').length
    };

    return {
      primarySources: drPatelResults,
      fallbackSources: fallbackResults,
      confidence: drPatelResults.length > 0 ? 0.95 : 0.7,
      sourceBreakdown
    };
  }

  // Search specifically within Dr. Patel's PDFs
  private async searchDrPatelPDFs(query: string, limit: number): Promise<PrioritizedKBItem[]> {
    if (this.drPatelPDFs.length === 0) {
      await this.initialize();
    }

    const results = this.drPatelPDFs.map(item => {
      const relevanceScore = this.calculateRelevanceScore(query, item);
      return {
        ...item,
        relevanceScore
      };
    })
    .filter(item => item.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);

    return results;
  }

  // Search fallback sources (UpToDate, AMBOSS, general)
  private async searchFallbackSources(query: string, limit: number): Promise<PrioritizedKBItem[]> {
    try {
      const allItems = await this.kbManager.getKBItems({ is_active: true });
      
      // Filter out Dr. Patel's PDFs to avoid duplication
      const fallbackItems = allItems
        .filter(item => 
          item.author !== 'Dr. Sonal Patel' && 
          !item.tags?.includes('dr_patel') &&
          !item.source_url?.includes('pdf://')
        )
        .map(item => ({
          ...item,
          priority: this.calculateSourcePriority(item),
          source: this.categorizeSource(item),
          relevanceScore: this.calculateRelevanceScore(query, item)
        }))
        .filter(item => item.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, limit);

      return fallbackItems;
    } catch (error) {
      console.error('Error searching fallback sources:', error);
      return [];
    }
  }

  // General knowledge search for non-breastfeeding queries
  private async searchGeneralKnowledge(query: string, limit: number): Promise<KnowledgeResponse> {
    try {
      const allItems = await this.kbManager.searchKBItems(query, limit);
      
      const prioritizedItems = allItems.map(item => ({
        ...item,
        priority: this.calculateSourcePriority(item),
        source: this.categorizeSource(item),
        relevanceScore: this.calculateRelevanceScore(query, item)
      }));

      return {
        primarySources: prioritizedItems,
        fallbackSources: [],
        confidence: 0.8,
        sourceBreakdown: {
          drPatelPDFs: 0,
          uptodate: prioritizedItems.filter(r => r.source === 'uptodate').length,
          amboss: prioritizedItems.filter(r => r.source === 'amboss').length,
          general: prioritizedItems.filter(r => r.source === 'general').length
        }
      };
    } catch (error) {
      console.error('Error in general knowledge search:', error);
      return {
        primarySources: [],
        fallbackSources: [],
        confidence: 0.3,
        sourceBreakdown: { drPatelPDFs: 0, uptodate: 0, amboss: 0, general: 0 }
      };
    }
  }

  // Check if query is breastfeeding-related
  private isBreastfeedingRelated(query: string): boolean {
    const breastfeedingKeywords = [
      'breastfeed', 'breastfeeding', 'nurse', 'nursing', 'milk', 'latch', 'latching',
      'feeding', 'feed', 'supplement', 'formula', 'pump', 'pumping', 'supply',
      'skin to skin', 'skin-to-skin', 'golden hour', 'colostrum', 'engorgement',
      'mastitis', 'nipple', 'areola', 'letdown', 'let down', 'cluster feeding'
    ];

    const queryLower = query.toLowerCase();
    return breastfeedingKeywords.some(keyword => queryLower.includes(keyword));
  }

  // Calculate relevance score for a knowledge item
  private calculateRelevanceScore(query: string, item: KBItem): number {
    const queryLower = query.toLowerCase();
    const content = (item.content || '').toLowerCase();
    const tags = (item.tags || '').toLowerCase();
    const topic = (item.topic || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();

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
      if (summary.includes(term)) score += 3;
      if (content.includes(term)) score += 2;
    });

    // Boost for Dr. Patel's documents
    if (item.author === 'Dr. Sonal Patel' || item.tags?.includes('dr_patel')) {
      score += 15;
    }

    // Boost for PDF sources
    if (item.source_url?.includes('pdf://')) {
      score += 10;
    }

    return score;
  }

  // Calculate source priority
  private calculateSourcePriority(item: KBItem): number {
    if (item.author === 'Dr. Sonal Patel' || item.tags?.includes('dr_patel')) {
      return 95;
    }
    if (item.tags?.includes('uptodate')) {
      return 85;
    }
    if (item.tags?.includes('amboss')) {
      return 80;
    }
    return 70;
  }

  // Categorize source type
  private categorizeSource(item: KBItem): 'dr_patel_pdf' | 'uptodate' | 'amboss' | 'general' {
    if (item.author === 'Dr. Sonal Patel' || item.tags?.includes('dr_patel') || item.source_url?.includes('pdf://')) {
      return 'dr_patel_pdf';
    }
    if (item.tags?.includes('uptodate')) {
      return 'uptodate';
    }
    if (item.tags?.includes('amboss')) {
      return 'amboss';
    }
    return 'general';
  }

  // Get statistics about available knowledge
  async getKnowledgeStats(): Promise<{
    totalSources: number;
    drPatelPDFs: number;
    uptodateSources: number;
    ambossSources: number;
    generalSources: number;
  }> {
    try {
      const allItems = await this.kbManager.getKBItems({ is_active: true });
      
      return {
        totalSources: allItems.length,
        drPatelPDFs: allItems.filter(item => item.author === 'Dr. Sonal Patel' || item.tags?.includes('dr_patel')).length,
        uptodateSources: allItems.filter(item => item.tags?.includes('uptodate')).length,
        ambossSources: allItems.filter(item => item.tags?.includes('amboss')).length,
        generalSources: allItems.filter(item => 
          item.author !== 'Dr. Sonal Patel' && 
          !item.tags?.includes('dr_patel') &&
          !item.tags?.includes('uptodate') &&
          !item.tags?.includes('amboss')
        ).length
      };
    } catch (error) {
      console.error('Error getting knowledge stats:', error);
      return {
        totalSources: 0,
        drPatelPDFs: 0,
        uptodateSources: 0,
        ambossSources: 0,
        generalSources: 0
      };
    }
  }
}

export { PDFKnowledgeManager, type PrioritizedKBItem, type KnowledgeResponse };
