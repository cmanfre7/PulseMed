// PDF Parser for Dr. Patel's Vetted Documents
// Extracts text from PDFs in AI Intellect Pool and creates knowledge base entries

import { PDFDocument, PDFPage } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

interface PDFContent {
  title: string;
  author: string;
  content: string;
  pages: number;
  extractedAt: string;
  source: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  tags: string[];
}

interface BreastfeedingDocument {
  id: string;
  title: string;
  author: string;
  content: string;
  priority: number; // 90+ for Dr. Patel's documents
  category: 'breastfeeding' | 'general' | 'emergency';
  source: 'dr_patel_pdf' | 'uptodate' | 'amboss' | 'general';
  tags: string[];
  ageWindow: string;
  audience: 'infant' | 'birthing_parent' | 'both';
  riskLevel: 'general' | 'high_risk';
  summary: string;
}

class PDFParser {
  private intellectPoolPath: string;
  
  constructor(intellectPoolPath: string = './AI Intellect Pool') {
    this.intellectPoolPath = intellectPoolPath;
  }

  // Extract text from PDF using pdf-parse (simpler approach)
  async extractTextFromPDF(pdfPath: string): Promise<string> {
    try {
      // For now, we'll use a simple approach
      // In production, you'd want to use a proper PDF parsing library
      const pdfBuffer = fs.readFileSync(pdfPath);
      
      // Using pdf-parse library (would need to be installed)
      // const pdfParse = require('pdf-parse');
      // const data = await pdfParse(pdfBuffer);
      // return data.text;
      
      // For now, return a placeholder that indicates the PDF content
      // This will be replaced with actual PDF parsing
      return `[PDF Content from ${path.basename(pdfPath)} - Text extraction pending]`;
    } catch (error) {
      console.error(`Error extracting text from ${pdfPath}:`, error);
      return '';
    }
  }

  // Process all PDFs in the AI Intellect Pool
  async processIntellectPool(): Promise<BreastfeedingDocument[]> {
    const documents: BreastfeedingDocument[] = [];
    
    try {
      const breastfeedingPath = path.join(this.intellectPoolPath, 'Breastfeeding Resources');
      
      if (!fs.existsSync(breastfeedingPath)) {
        console.log('Breastfeeding Resources folder not found');
        return documents;
      }

      const files = fs.readdirSync(breastfeedingPath);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

      console.log(`Found ${pdfFiles.length} PDF files in Breastfeeding Resources`);

      for (const pdfFile of pdfFiles) {
        const pdfPath = path.join(breastfeedingPath, pdfFile);
        const content = await this.extractTextFromPDF(pdfPath);
        
        if (content) {
          const document = this.createBreastfeedingDocument(pdfFile, content);
          documents.push(document);
          console.log(`Processed: ${pdfFile}`);
        }
      }

      return documents;
    } catch (error) {
      console.error('Error processing AI Intellect Pool:', error);
      return documents;
    }
  }

  // Create a structured document from PDF content
  private createBreastfeedingDocument(filename: string, content: string): BreastfeedingDocument {
    const title = this.extractTitleFromFilename(filename);
    const tags = this.generateTagsFromContent(content, filename);
    const summary = this.generateSummary(content, filename);
    
    return {
      id: `dr_patel_${filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
      title,
      author: 'Dr. Sonal Patel',
      content,
      priority: 95, // Very high priority for Dr. Patel's documents
      category: 'breastfeeding',
      source: 'dr_patel_pdf',
      tags,
      ageWindow: this.determineAgeWindow(content, filename),
      audience: 'both',
      riskLevel: this.determineRiskLevel(content, filename),
      summary
    };
  }

  // Extract meaningful title from filename
  private extractTitleFromFilename(filename: string): string {
    const nameWithoutExt = filename.replace('.pdf', '');
    
    // Map specific filenames to better titles
    const titleMap: Record<string, string> = {
      '30 Day Breastfeeding BluePrint.pdf': '30-Day Breastfeeding Blueprint - Dr. Sonal Patel',
      'Peripartum Breastfeeding Management.pdf': 'Peripartum Breastfeeding Management Guide',
      'Supplementation Feeding Protocol.pdf': 'Supplementation Feeding Protocol & Guidelines'
    };

    return titleMap[filename] || nameWithoutExt.replace(/[-_]/g, ' ');
  }

  // Generate relevant tags based on content and filename
  private generateTagsFromContent(content: string, filename: string): string[] {
    const baseTags = ['breastfeeding', 'dr_patel', 'vetted', 'medical_guidance'];
    
    // Add filename-specific tags
    const filenameTags: Record<string, string[]> = {
      '30 Day Breastfeeding BluePrint.pdf': ['blueprint', '30-day', 'comprehensive', 'beginner'],
      'Peripartum Breastfeeding Management.pdf': ['peripartum', 'postpartum', 'management', 'hospital'],
      'Supplementation Feeding Protocol.pdf': ['supplementation', 'formula', 'protocol', 'guidelines']
    };

    const fileSpecificTags = filenameTags[filename] || [];
    
    // Add content-based tags (simplified)
    const contentLower = content.toLowerCase();
    const contentTags: string[] = [];
    
    if (contentLower.includes('golden hour')) contentTags.push('golden_hour');
    if (contentLower.includes('skin to skin')) contentTags.push('skin_to_skin');
    if (contentLower.includes('latch')) contentTags.push('latch');
    if (contentLower.includes('milk supply')) contentTags.push('milk_supply');
    if (contentLower.includes('supplement')) contentTags.push('supplementation');
    if (contentLower.includes('formula')) contentTags.push('formula');
    if (contentLower.includes('pump')) contentTags.push('pumping');
    
    return [...baseTags, ...fileSpecificTags, ...contentTags];
  }

  // Determine age window from content
  private determineAgeWindow(content: string, filename: string): string {
    const contentLower = content.toLowerCase();
    
    // Check for specific age ranges in content
    if (contentLower.includes('0-30') || contentLower.includes('first 30') || filename.includes('30 Day')) {
      return '0-30 days';
    }
    if (contentLower.includes('0-12') || contentLower.includes('first 12')) {
      return '0-12 weeks';
    }
    if (contentLower.includes('peripartum') || contentLower.includes('hospital')) {
      return '0-7 days';
    }
    
    // Default for breastfeeding documents
    return '0-12 weeks';
  }

  // Determine risk level from content
  private determineRiskLevel(content: string, filename: string): 'general' | 'high_risk' {
    const contentLower = content.toLowerCase();
    
    // High risk indicators
    const highRiskKeywords = ['emergency', 'urgent', 'complications', 'risk', 'warning', 'immediate'];
    
    if (highRiskKeywords.some(keyword => contentLower.includes(keyword))) {
      return 'high_risk';
    }
    
    return 'general';
  }

  // Generate summary from content
  private generateSummary(content: string, filename: string): string {
    const titleMap: Record<string, string> = {
      '30 Day Breastfeeding BluePrint.pdf': 'Comprehensive 30-day breastfeeding guide covering everything from initial latch to establishing milk supply and troubleshooting common issues.',
      'Peripartum Breastfeeding Management.pdf': 'Hospital-based breastfeeding management protocols for immediate postpartum care and initial feeding establishment.',
      'Supplementation Feeding Protocol.pdf': 'Evidence-based guidelines for when and how to supplement breastfeeding with formula or donor milk.'
    };

    return titleMap[filename] || `Medical guidance document on ${this.extractTitleFromFilename(filename)}`;
  }

  // Save processed documents to knowledge base
  async saveToKnowledgeBase(documents: BreastfeedingDocument[]): Promise<void> {
    try {
      // This would integrate with the KBManager to save to HubSpot HubDB
      console.log(`Saving ${documents.length} documents to knowledge base...`);
      
      for (const doc of documents) {
        console.log(`- ${doc.title} (Priority: ${doc.priority})`);
        // TODO: Integrate with KBManager.createKBItem(doc)
      }
    } catch (error) {
      console.error('Error saving to knowledge base:', error);
    }
  }
}

export { PDFParser, type BreastfeedingDocument, type PDFContent };
