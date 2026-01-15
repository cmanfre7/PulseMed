// HubSpot HubDB Knowledge Base Manager
// For physician document management and AI response vetting

interface HubSpotConfig {
  accessToken: string;
  portalId: string;
  tableId: string;
}

interface KBItem {
  id?: string;
  topic: string;
  audience: 'infant' | 'birthing_parent' | 'both';
  age_window: string;
  risk_level: 'general' | 'high_risk';
  summary: string;
  content: string;
  author: string;
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  source_url?: string;
  tags: string;
  version: string;
  embedding?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AIResponse {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  confidence: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
}

class KBManager {
  private config: HubSpotConfig;
  private baseUrl = 'https://api.hubapi.com/cms/v3/hubdb';

  constructor(config: HubSpotConfig) {
    this.config = config;
  }

  // Create new knowledge base item
  async createKBItem(item: Omit<KBItem, 'id'>): Promise<KBItem> {
    const response = await fetch(`${this.baseUrl}/tables/${this.config.tableId}/rows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: {
          topic: item.topic,
          audience: item.audience,
          age_window: item.age_window,
          risk_level: item.risk_level,
          summary: item.summary,
          content: item.content,
          author: item.author,
          reviewed_by: item.reviewed_by,
          review_date: item.review_date,
          expiry_date: item.expiry_date,
          source_url: item.source_url,
          tags: item.tags,
          version: item.version,
          embedding: item.embedding,
          is_active: item.is_active
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create KB item: ${response.statusText}`);
    }

    return response.json();
  }

  // Update existing knowledge base item
  async updateKBItem(id: string, updates: Partial<KBItem>): Promise<KBItem> {
    const response = await fetch(`${this.baseUrl}/tables/${this.config.tableId}/rows/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: updates
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to update KB item: ${response.statusText}`);
    }

    return response.json();
  }

  // Get all knowledge base items with filtering
  async getKBItems(filters?: {
    is_active?: boolean;
    audience?: string;
    risk_level?: string;
    tags?: string;
  }): Promise<KBItem[]> {
    let url = `${this.baseUrl}/tables/${this.config.tableId}/rows`;
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch KB items: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  }

  // Semantic search using embeddings
  async searchKBItems(query: string, limit: number = 5): Promise<KBItem[]> {
    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Get all active items
    const allItems = await this.getKBItems({ is_active: true });
    
    // Calculate similarity scores (cosine similarity)
    const scoredItems = allItems.map(item => {
      if (!item.embedding) return { item, score: 0 };
      
      try {
        const itemEmbedding = JSON.parse(item.embedding);
        const score = this.cosineSimilarity(queryEmbedding, itemEmbedding);
        return { item, score };
      } catch (error) {
        console.error('Error parsing embedding:', error);
        return { item, score: 0 };
      }
    });

    // Sort by score and return top results
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(result => result.item);
  }

  // Generate embedding using OpenAI or similar service
  private async generateEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-3-small'
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate embedding: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  // Update embedding for a KB item
  async updateEmbedding(itemId: string): Promise<void> {
    const items = await this.getKBItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) {
      throw new Error('KB item not found');
    }

    const textToEmbed = `${item.topic} ${item.summary} ${item.content} ${item.tags}`;
    const embedding = await this.generateEmbedding(textToEmbed);
    
    await this.updateKBItem(itemId, {
      embedding: JSON.stringify(embedding)
    });
  }

  // Get items that need review (expired or high-risk)
  async getItemsNeedingReview(): Promise<KBItem[]> {
    const allItems = await this.getKBItems({ is_active: true });
    const now = new Date();
    
    return allItems.filter(item => {
      // Check if expired
      if (item.expiry_date) {
        const expiryDate = new Date(item.expiry_date);
        if (expiryDate <= now) return true;
      }
      
      // Check if high-risk and not recently reviewed
      if (item.risk_level === 'high_risk' && item.review_date) {
        const reviewDate = new Date(item.review_date);
        const daysSinceReview = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceReview > 30) return true; // Review high-risk items monthly
      }
      
      return false;
    });
  }
}

// Response Vetting System
class ResponseVetter {
  private config: HubSpotConfig;
  private baseUrl = 'https://api.hubapi.com/cms/v3/hubdb';

  constructor(config: HubSpotConfig) {
    this.config = config;
  }

  // Store AI response for physician review
  async storeAIResponse(response: Omit<AIResponse, 'id' | 'created_at'>): Promise<AIResponse> {
    // This would typically be stored in a separate HubDB table for AI responses
    // For now, we'll use a simple approach
    const aiResponse: AIResponse = {
      ...response,
      id: `ai_resp_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // In a real implementation, this would save to HubDB
    console.log('AI Response stored for review:', aiResponse);
    return aiResponse;
  }

  // Get pending responses for review
  async getPendingResponses(): Promise<AIResponse[]> {
    // This would fetch from HubDB
    // For now, return mock data
    return [];
  }

  // Approve or reject AI response
  async reviewResponse(responseId: string, decision: 'approved' | 'rejected' | 'needs_revision', reviewer: string, notes?: string): Promise<void> {
    // Update the response status in HubDB
    console.log(`Response ${responseId} ${decision} by ${reviewer}`, notes);
  }
}

export { KBManager, ResponseVetter, type KBItem, type AIResponse, type HubSpotConfig };
