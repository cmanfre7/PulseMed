/**
 * HubSpot Analytics API
 * Tracks conversation patterns and research data
 */

interface AnalyticsData {
  sessionId: string;
  contactId?: string;
  timestamp: string;
  messageCount: number;
  conversationDuration: number;
  primaryTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  userSatisfaction?: number;
  escalatedToHuman: boolean;
  adminAccess: boolean;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  location?: string;
}

interface ResearchMetrics {
  totalSessions: number;
  avgSessionDuration: number;
  commonTopics: { [key: string]: number };
  sentimentDistribution: { [key: string]: number };
  escalationRate: number;
  adminAccessRate: number;
  deviceDistribution: { [key: string]: number };
  timeBasedPatterns: { [key: string]: number };
}

export class HubSpotAnalytics {
  private contactManager: any;
  
  constructor(contactManager: any) {
    this.contactManager = contactManager;
  }
  
  /**
   * Log session analytics
   */
  async logSessionAnalytics(data: AnalyticsData): Promise<void> {
    try {
      const response = await fetch(`https://api.hubapi.com/crm/v3/objects/session_analytics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            session_id: data.sessionId,
            contact_id: data.contactId || 'anonymous',
            timestamp: data.timestamp,
            message_count: data.messageCount,
            conversation_duration: data.conversationDuration,
            primary_topics: data.primaryTopics.join(','),
            sentiment: data.sentiment,
            user_satisfaction: data.userSatisfaction || 0,
            escalated_to_human: data.escalatedToHuman,
            admin_access: data.adminAccess,
            device_type: data.deviceType,
            location: data.location || 'unknown'
          }
        })
      });
      
      if (!response.ok) {
        console.warn('Failed to log session analytics:', response.status);
      }
    } catch (error) {
      console.error('Error logging session analytics:', error);
    }
  }
  
  /**
   * Get research metrics for Dr. Patel
   */
  async getResearchMetrics(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<ResearchMetrics> {
    try {
      const response = await fetch(
        `https://api.hubapi.com/crm/v3/objects/session_analytics/search`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
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
            properties: [
              'session_id', 'message_count', 'conversation_duration', 
              'primary_topics', 'sentiment', 'user_satisfaction',
              'escalated_to_human', 'admin_access', 'device_type'
            ]
          })
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to get research metrics: ${response.status}`);
      }
      
      const data = await response.json();
      return this.processResearchMetrics(data.results);
    } catch (error) {
      console.error('Error getting research metrics:', error);
      return this.getEmptyMetrics();
    }
  }
  
  /**
   * Generate research report for Dr. Patel
   */
  async generateResearchReport(timeframe: 'week' | 'month' | 'quarter' = 'month'): Promise<any> {
    const metrics = await this.getResearchMetrics(timeframe);
    const conversationAnalytics = await this.contactManager.getConversationAnalytics(timeframe);
    
    return {
      timeframe,
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: metrics.totalSessions,
        totalConversations: conversationAnalytics?.totalConversations || 0,
        avgSessionDuration: Math.round(metrics.avgSessionDuration),
        escalationRate: Math.round(metrics.escalationRate * 100) / 100,
        userSatisfaction: this.calculateAvgSatisfaction(metrics)
      },
      insights: {
        topConcerns: this.getTopConcerns(metrics.commonTopics),
        sentimentTrends: metrics.sentimentDistribution,
        peakUsageTimes: this.getPeakUsageTimes(metrics),
        devicePreferences: metrics.deviceDistribution
      },
      recommendations: this.generateRecommendations(metrics, conversationAnalytics)
    };
  }
  
  private getTimeframeDate(timeframe: string): string {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        now.setMonth(now.getMonth() - 3);
        break;
    }
    return now.toISOString();
  }
  
  private processResearchMetrics(sessions: any[]): ResearchMetrics {
    const metrics: ResearchMetrics = {
      totalSessions: sessions.length,
      avgSessionDuration: 0,
      commonTopics: {},
      sentimentDistribution: {},
      escalationRate: 0,
      adminAccessRate: 0,
      deviceDistribution: {},
      timeBasedPatterns: {}
    };
    
    if (sessions.length === 0) return metrics;
    
    let totalDuration = 0;
    let escalatedCount = 0;
    let adminAccessCount = 0;
    
    sessions.forEach(session => {
      // Calculate average duration
      totalDuration += session.properties.conversation_duration || 0;
      
      // Count escalations
      if (session.properties.escalated_to_human) escalatedCount++;
      
      // Count admin access
      if (session.properties.admin_access) adminAccessCount++;
      
      // Process topics
      const topics = (session.properties.primary_topics || '').split(',').filter(t => t.trim());
      topics.forEach(topic => {
        metrics.commonTopics[topic] = (metrics.commonTopics[topic] || 0) + 1;
      });
      
      // Process sentiment
      const sentiment = session.properties.sentiment || 'neutral';
      metrics.sentimentDistribution[sentiment] = (metrics.sentimentDistribution[sentiment] || 0) + 1;
      
      // Process device type
      const deviceType = session.properties.device_type || 'unknown';
      metrics.deviceDistribution[deviceType] = (metrics.deviceDistribution[deviceType] || 0) + 1;
    });
    
    metrics.avgSessionDuration = totalDuration / sessions.length;
    metrics.escalationRate = escalatedCount / sessions.length;
    metrics.adminAccessRate = adminAccessCount / sessions.length;
    
    return metrics;
  }
  
  private getEmptyMetrics(): ResearchMetrics {
    return {
      totalSessions: 0,
      avgSessionDuration: 0,
      commonTopics: {},
      sentimentDistribution: {},
      escalationRate: 0,
      adminAccessRate: 0,
      deviceDistribution: {},
      timeBasedPatterns: {}
    };
  }
  
  private calculateAvgSatisfaction(metrics: ResearchMetrics): number {
    // This would need to be calculated from actual satisfaction data
    return 4.2; // Placeholder
  }
  
  private getTopConcerns(topics: { [key: string]: number }): Array<{ topic: string; count: number }> {
    return Object.entries(topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));
  }
  
  private getPeakUsageTimes(metrics: ResearchMetrics): Array<{ hour: string; sessions: number }> {
    // This would need to be calculated from timestamp data
    return [
      { hour: '9 AM', sessions: 15 },
      { hour: '2 PM', sessions: 12 },
      { hour: '7 PM', sessions: 18 }
    ];
  }
  
  private generateRecommendations(metrics: ResearchMetrics, conversationAnalytics: any): string[] {
    const recommendations = [];
    
    if (metrics.escalationRate > 0.3) {
      recommendations.push('High escalation rate detected. Consider enhancing the knowledge base with more comprehensive answers.');
    }
    
    if (metrics.avgSessionDuration < 60) {
      recommendations.push('Short session durations suggest users may not be finding what they need quickly enough.');
    }
    
    const topTopic = Object.keys(metrics.commonTopics)[0];
    if (topTopic) {
      recommendations.push(`Most common concern is "${topTopic}". Consider creating a dedicated resource or FAQ section.`);
    }
    
    if (metrics.deviceDistribution.mobile > 0.7) {
      recommendations.push('High mobile usage detected. Ensure all resources are mobile-optimized.');
    }
    
    return recommendations;
  }
}

export default HubSpotAnalytics;
