// Progressive Memory Management System
class MemoryManager {
  constructor() {
    this.memoryKey = 'nayacare_memory';
    this.conversationKey = 'nayacare_conversations';
    this.userProfileKey = 'nayacare_user_profile';
    this.learningKey = 'nayacare_learning';
    this.maxConversations = 50;
    this.maxMemoryItems = 100;
  }

  // Core Memory Operations
  saveMemory(key, data, expirationDays = 30) {
    try {
      const memoryData = {
        data,
        timestamp: Date.now(),
        expiration: Date.now() + (expirationDays * 24 * 60 * 60 * 1000),
        accessCount: 0,
        lastAccessed: Date.now()
      };
      
      const existing = this.getMemory(key);
      if (existing) {
        memoryData.accessCount = existing.accessCount + 1;
      }
      
      localStorage.setItem(`${this.memoryKey}_${key}`, JSON.stringify(memoryData));
      return true;
    } catch (error) {
      console.error('Error saving memory:', error);
      return false;
    }
  }

  getMemory(key) {
    try {
      const item = localStorage.getItem(`${this.memoryKey}_${key}`);
      if (!item) return null;
      
      const memoryData = JSON.parse(item);
      
      // Check expiration
      if (Date.now() > memoryData.expiration) {
        this.deleteMemory(key);
        return null;
      }
      
      // Update access info
      memoryData.accessCount = (memoryData.accessCount || 0) + 1;
      memoryData.lastAccessed = Date.now();
      localStorage.setItem(`${this.memoryKey}_${key}`, JSON.stringify(memoryData));
      
      return memoryData.data;
    } catch (error) {
      console.error('Error getting memory:', error);
      return null;
    }
  }

  deleteMemory(key) {
    try {
      localStorage.removeItem(`${this.memoryKey}_${key}`);
      return true;
    } catch (error) {
      console.error('Error deleting memory:', error);
      return false;
    }
  }

  // Conversation Memory
  saveConversation(conversationId, messages, metadata = {}) {
    try {
      const conversation = {
        id: conversationId,
        messages: messages.slice(-20), // Keep last 20 messages
        metadata: {
          ...metadata,
          timestamp: Date.now(),
          messageCount: messages.length,
          topics: this.extractTopics(messages),
          sentiment: this.analyzeSentiment(messages),
          userConcerns: this.extractConcerns(messages)
        }
      };
      
      const conversations = this.getConversations();
      conversations[conversationId] = conversation;
      
      // Keep only recent conversations
      const sortedConversations = Object.values(conversations)
        .sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)
        .slice(0, this.maxConversations);
      
      const conversationMap = {};
      sortedConversations.forEach(conv => {
        conversationMap[conv.id] = conv;
      });
      
      localStorage.setItem(this.conversationKey, JSON.stringify(conversationMap));
      return true;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return false;
    }
  }

  getConversations() {
    try {
      const conversations = localStorage.getItem(this.conversationKey);
      return conversations ? JSON.parse(conversations) : {};
    } catch (error) {
      console.error('Error getting conversations:', error);
      return {};
    }
  }

  getConversation(conversationId) {
    const conversations = this.getConversations();
    return conversations[conversationId] || null;
  }

  // User Profile Memory
  saveUserProfile(profileData) {
    try {
      const profile = {
        ...profileData,
        lastUpdated: Date.now(),
        version: '1.0'
      };
      
      localStorage.setItem(this.userProfileKey, JSON.stringify(profile));
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  }

  getUserProfile() {
    try {
      const profile = localStorage.getItem(this.userProfileKey);
      return profile ? JSON.parse(profile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Learning and Adaptation
  saveLearning(interactionData) {
    try {
      const learning = {
        userPreferences: this.extractPreferences(interactionData),
        commonQuestions: this.extractCommonQuestions(interactionData),
        responsePatterns: this.analyzeResponsePatterns(interactionData),
        timestamp: Date.now()
      };
      
      const existingLearning = this.getLearning();
      const updatedLearning = {
        ...existingLearning,
        ...learning,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(this.learningKey, JSON.stringify(updatedLearning));
      return true;
    } catch (error) {
      console.error('Error saving learning:', error);
      return false;
    }
  }

  getLearning() {
    try {
      const learning = localStorage.getItem(this.learningKey);
      return learning ? JSON.parse(learning) : {};
    } catch (error) {
      console.error('Error getting learning:', error);
      return {};
    }
  }

  // Memory Analysis and Insights
  getMemoryInsights() {
    try {
      const conversations = this.getConversations();
      const userProfile = this.getUserProfile();
      const learning = this.getLearning();
      
      return {
        totalConversations: Object.keys(conversations).length,
        averageConversationLength: this.calculateAverageConversationLength(conversations),
        mostCommonTopics: this.getMostCommonTopics(conversations),
        userPreferences: learning.userPreferences || {},
        lastActive: this.getLastActive(conversations),
        userProfile: userProfile
      };
    } catch (error) {
      console.error('Error getting memory insights:', error);
      return {};
    }
  }

  // Helper Methods
  extractTopics(messages) {
    const topics = [];
    const topicKeywords = {
      'feeding': ['feed', 'breast', 'bottle', 'milk', 'hungry', 'latch'],
      'sleep': ['sleep', 'tired', 'nap', 'bedtime', 'awake'],
      'development': ['roll', 'sit', 'crawl', 'walk', 'milestone', 'development'],
      'health': ['fever', 'sick', 'doctor', 'medicine', 'temperature'],
      'concerns': ['worried', 'concerned', 'scared', 'nervous', 'anxious']
    };
    
    messages.forEach(message => {
      const text = message.text || message.content || '';
      Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
          if (!topics.includes(topic)) {
            topics.push(topic);
          }
        }
      });
    });
    
    return topics;
  }

  analyzeSentiment(messages) {
    const userMessages = messages.filter(m => m.sender === 'user');
    const positiveWords = ['happy', 'good', 'great', 'excited', 'love', 'wonderful'];
    const negativeWords = ['worried', 'scared', 'nervous', 'anxious', 'concerned', 'frustrated'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    userMessages.forEach(message => {
      const text = (message.text || message.content || '').toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) negativeCount++;
      });
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  extractConcerns(messages) {
    const concerns = [];
    const concernKeywords = ['worried', 'concerned', 'scared', 'nervous', 'anxious', 'frustrated', 'overwhelmed'];
    
    messages.forEach(message => {
      const text = (message.text || message.content || '').toLowerCase();
      concernKeywords.forEach(keyword => {
        if (text.includes(keyword) && !concerns.includes(keyword)) {
          concerns.push(keyword);
        }
      });
    });
    
    return concerns;
  }

  extractPreferences(interactionData) {
    // Analyze user interaction patterns to extract preferences
    const preferences = {
      communicationStyle: 'conversational', // Default
      detailLevel: 'moderate',
      preferredTopics: [],
      responseFormat: 'friendly'
    };
    
    // This would be enhanced with more sophisticated analysis
    return preferences;
  }

  extractCommonQuestions(interactionData) {
    // Extract frequently asked questions
    return [];
  }

  analyzeResponsePatterns(interactionData) {
    // Analyze what types of responses work best for this user
    return {};
  }

  calculateAverageConversationLength(conversations) {
    const convs = Object.values(conversations);
    if (convs.length === 0) return 0;
    
    const totalMessages = convs.reduce((sum, conv) => sum + conv.messages.length, 0);
    return Math.round(totalMessages / convs.length);
  }

  getMostCommonTopics(conversations) {
    const topicCounts = {};
    Object.values(conversations).forEach(conv => {
      conv.metadata.topics.forEach(topic => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });
    
    return Object.entries(topicCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }

  getLastActive(conversations) {
    const convs = Object.values(conversations);
    if (convs.length === 0) return null;
    
    const mostRecent = convs.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp)[0];
    return new Date(mostRecent.metadata.timestamp);
  }

  // Memory Cleanup
  cleanupExpiredMemories() {
    try {
      const keys = Object.keys(localStorage);
      const memoryKeys = keys.filter(key => key.startsWith(this.memoryKey));
      
      memoryKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          const memoryData = JSON.parse(item);
          if (Date.now() > memoryData.expiration) {
            localStorage.removeItem(key);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error cleaning up memories:', error);
      return false;
    }
  }

  // Export/Import Memory
  exportMemory() {
    try {
      const memory = {
        conversations: this.getConversations(),
        userProfile: this.getUserProfile(),
        learning: this.getLearning(),
        exportDate: Date.now()
      };
      
      return JSON.stringify(memory, null, 2);
    } catch (error) {
      console.error('Error exporting memory:', error);
      return null;
    }
  }

  importMemory(memoryData) {
    try {
      const data = JSON.parse(memoryData);
      
      if (data.conversations) {
        localStorage.setItem(this.conversationKey, JSON.stringify(data.conversations));
      }
      if (data.userProfile) {
        localStorage.setItem(this.userProfileKey, JSON.stringify(data.userProfile));
      }
      if (data.learning) {
        localStorage.setItem(this.learningKey, JSON.stringify(data.learning));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing memory:', error);
      return false;
    }
  }
}

// Create singleton instance
const memoryManager = new MemoryManager();

export default memoryManager;
