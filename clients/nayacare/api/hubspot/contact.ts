/**
 * HubSpot Contact Management API
 * Creates and updates contacts for research data collection
 */

interface HubSpotContact {
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    hs_lead_status?: string;
    lead_source?: string;
    nayacare_user_type?: string;
    nayacare_conversation_count?: number;
    nayacare_last_interaction?: string;
    nayacare_primary_concerns?: string;
    nayacare_research_consent?: string;
  };
}

interface ConversationLog {
  contactId: string;
  sessionId: string;
  timestamp: string;
  messageType: 'user' | 'bot';
  content: string;
  category?: string;
  sentiment?: string;
  responseTime?: number;
  adminAccess?: boolean;
}

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;

export class HubSpotContactManager {
  private baseUrl = `https://api.hubapi.com/crm/v3/objects/contacts`;
  
  /**
   * Create or update a contact in HubSpot
   */
  async createOrUpdateContact(email: string, contactData: Partial<HubSpotContact['properties']> = {}): Promise<string> {
    try {
      // First, try to find existing contact
      const existingContact = await this.findContactByEmail(email);
      
      if (existingContact) {
        // Update existing contact
        await this.updateContact(existingContact.id, contactData);
        return existingContact.id;
      } else {
        // Create new contact
        const newContact = await this.createContact(email, contactData);
        return newContact.id;
      }
    } catch (error) {
      console.error('Error managing HubSpot contact:', error);
      throw error;
    }
  }
  
  /**
   * Find contact by email
   */
  private async findContactByEmail(email: string): Promise<{ id: string } | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: 'email',
                operator: 'EQ',
                value: email
              }]
            }],
            properties: ['id', 'email']
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`HubSpot API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.results?.[0] || null;
    } catch (error) {
      console.error('Error finding HubSpot contact:', error);
      return null;
    }
  }
  
  /**
   * Create new contact
   */
  private async createContact(email: string, contactData: Partial<HubSpotContact['properties']>): Promise<{ id: string }> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email,
          lead_source: 'NayaCare Chatbot',
          nayacare_user_type: 'Patient/Parent',
          nayacare_conversation_count: 1,
          nayacare_last_interaction: new Date().toISOString(),
          nayacare_research_consent: 'Anonymous Data Collection',
          ...contactData
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create HubSpot contact: ${response.status}`);
    }
    
    return await response.json();
  }
  
  /**
   * Update existing contact
   */
  private async updateContact(contactId: string, contactData: Partial<HubSpotContact['properties']>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${contactId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          nayacare_last_interaction: new Date().toISOString(),
          ...contactData
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update HubSpot contact: ${response.status}`);
    }
  }
  
  /**
   * Log conversation data
   */
  async logConversation(logData: ConversationLog): Promise<void> {
    try {
      // Create a custom object for conversation logs
      const response = await fetch(`https://api.hubapi.com/crm/v3/objects/conversation_logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            contact_id: logData.contactId,
            session_id: logData.sessionId,
            timestamp: logData.timestamp,
            message_type: logData.messageType,
            content: logData.content,
            category: logData.category || 'General',
            sentiment: logData.sentiment || 'Neutral',
            response_time: logData.responseTime || 0,
            admin_access: logData.adminAccess || false
          }
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to log conversation to HubSpot:', response.status);
      }
    } catch (error) {
      console.error('Error logging conversation:', error);
    }
  }
  
  /**
   * Get conversation analytics
   */
  async getConversationAnalytics(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    try {
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/conversation_logs/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            filterGroups: [{
              filters: [{
                propertyName: 'timestamp',
                operator: 'GTE',
                value: this.getTimeframeDate(timeframe)
              }]
            }],
            properties: ['timestamp', 'message_type', 'category', 'sentiment', 'response_time']
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get analytics: ${response.status}`);
      }
      
      const data = await response.json();
      return this.processAnalytics(data.results);
    } catch (error) {
      console.error('Error getting analytics:', error);
      return null;
    }
  }
  
  private getTimeframeDate(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'day':
        now.setDate(now.getDate() - 1);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
    }
    return now.toISOString();
  }
  
  private processAnalytics(conversations: any[]): any {
    const analytics = {
      totalConversations: conversations.length,
      categories: {},
      sentiment: {},
      avgResponseTime: 0,
      userMessages: 0,
      botMessages: 0
    };
    
    let totalResponseTime = 0;
    
    conversations.forEach(conv => {
      // Count message types
      if (conv.properties.message_type === 'user') analytics.userMessages++;
      if (conv.properties.message_type === 'bot') analytics.botMessages++;
      
      // Count categories
      const category = conv.properties.category || 'General';
      analytics.categories[category] = (analytics.categories[category] || 0) + 1;
      
      // Count sentiment
      const sentiment = conv.properties.sentiment || 'Neutral';
      analytics.sentiment[sentiment] = (analytics.sentiment[sentiment] || 0) + 1;
      
      // Sum response times
      totalResponseTime += conv.properties.response_time || 0;
    });
    
    analytics.avgResponseTime = analytics.botMessages > 0 ? totalResponseTime / analytics.botMessages : 0;
    
    return analytics;
  }
}

export default HubSpotContactManager;
