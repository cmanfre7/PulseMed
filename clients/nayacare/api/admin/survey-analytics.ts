import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const SURVEY_OBJECT_TYPE_ID = '2-174856652';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('Missing HUBSPOT_ACCESS_TOKEN');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    // Fetch all survey responses from HubSpot
    const hubspotResponse = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/${SURVEY_OBJECT_TYPE_ID}?limit=100&properties=survey_id,user_email,ease_of_use,response_quality,felt_supported,trust_guidance,likelihood_recommend,improvement_suggestions,session_duration_seconds,message_count,platform,survey_skipped,submitted_at,used_chat,used_feeding_log,used_sleep_log,used_diaper_log,used_growth_charts,downloaded_resource,visited_youtube,resources_viewed_list`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.json();
      console.error('HubSpot API error:', errorData);
      throw new Error(`HubSpot API error: ${errorData.message || hubspotResponse.statusText}`);
    }

    const data = await hubspotResponse.json();
    const surveys = data.results || [];

    // Extract unique user emails to fetch consent data
    const uniqueEmails = [...new Set(surveys.map((s: any) => s.properties.user_email))].filter(email => email && email !== 'anonymous');

    // Fetch consent data for all users
    const consentDataMap = new Map<string, any>();

    if (uniqueEmails.length > 0) {
      try {
        // Search for contacts by email to get consent data
        for (const email of uniqueEmails) {
          const contactSearchResponse = await fetch(
            `${HUBSPOT_API_BASE}/crm/v3/objects/contacts/search`,
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
                    value: email.toLowerCase()
                  }]
                }],
                properties: ['consent_accepted', 'consent_accepted_date', 'consent_version_accepted'],
                limit: 1
              })
            }
          );

          if (contactSearchResponse.ok) {
            const contactData = await contactSearchResponse.json();
            if (contactData.results && contactData.results.length > 0) {
              const contact = contactData.results[0];
              consentDataMap.set(email.toLowerCase(), {
                hasConsented: contact.properties.consent_accepted === 'true',
                consentDate: contact.properties.consent_accepted_date || null,
                consentVersion: contact.properties.consent_version_accepted || null
              });
            }
          }

          // Rate limiting: wait 100ms between requests to avoid HubSpot rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (consentError) {
        console.error('Error fetching consent data (non-critical):', consentError);
        // Continue without consent data if there's an error
      }
    }

    // Calculate analytics
    const analytics = {
      totalResponses: surveys.length,
      completedSurveys: surveys.filter((s: any) => s.properties.survey_skipped === 'false').length,
      skippedSurveys: surveys.filter((s: any) => s.properties.survey_skipped === 'true').length,

      // Average ratings
      averageRatings: {
        ease_of_use: calculateAverage(surveys, 'ease_of_use'),
        response_quality: calculateAverage(surveys, 'response_quality'),
        felt_supported: calculateAverage(surveys, 'felt_supported'),
        trust_guidance: calculateAverage(surveys, 'trust_guidance'),
        likelihood_recommend: calculateAverage(surveys, 'likelihood_recommend')
      },

      // Overall satisfaction (average of all ratings)
      overallSatisfaction: 0,

      // Recent feedback (last 10)
      recentFeedback: surveys
        .filter((s: any) => s.properties.improvement_suggestions && s.properties.improvement_suggestions.length > 0)
        .slice(0, 10)
        .map((s: any) => ({
          feedback: s.properties.improvement_suggestions,
          submittedAt: s.properties.submitted_at,
          userEmail: s.properties.user_email === 'anonymous' ? 'Anonymous User' : maskEmail(s.properties.user_email)
        })),

      // Session metrics
      sessionMetrics: {
        averageDuration: calculateAverage(surveys, 'session_duration_seconds'),
        averageMessages: calculateAverage(surveys, 'message_count')
      },

      // Platform breakdown
      platformBreakdown: {
        web: surveys.filter((s: any) => s.properties.platform === 'web').length,
        embed: surveys.filter((s: any) => s.properties.platform === 'embed').length
      },

      // All surveys (for export)
      allSurveys: surveys.map((s: any) => {
        const userEmail = s.properties.user_email;
        const consentData = consentDataMap.get(userEmail?.toLowerCase()) || { hasConsented: false, consentDate: null, consentVersion: null };

        return {
          id: s.id,
          surveyId: s.properties.survey_id,
          userEmail: userEmail,
          easeOfUse: parseFloat(s.properties.ease_of_use) || 0,
          responseQuality: parseFloat(s.properties.response_quality) || 0,
          feltSupported: parseFloat(s.properties.felt_supported) || 0,
          trustGuidance: parseFloat(s.properties.trust_guidance) || 0,
          likelihoodRecommend: parseFloat(s.properties.likelihood_recommend) || 0,
          improvementSuggestions: s.properties.improvement_suggestions || '',
          sessionDuration: parseInt(s.properties.session_duration_seconds) || 0,
          messageCount: parseInt(s.properties.message_count) || 0,
          platform: s.properties.platform || 'web',
          surveySkipped: s.properties.survey_skipped === 'true',
          submittedAt: s.properties.submitted_at,
          // Feature usage
          usedChat: s.properties.used_chat === 'true' || s.properties.used_chat === true,
          usedFeedingLog: s.properties.used_feeding_log === 'true' || s.properties.used_feeding_log === true,
          usedSleepLog: s.properties.used_sleep_log === 'true' || s.properties.used_sleep_log === true,
          usedDiaperLog: s.properties.used_diaper_log === 'true' || s.properties.used_diaper_log === true,
          usedGrowthCharts: s.properties.used_growth_charts === 'true' || s.properties.used_growth_charts === true,
          downloadedResource: s.properties.downloaded_resource === 'true' || s.properties.downloaded_resource === true,
          visitedYoutube: s.properties.visited_youtube === 'true' || s.properties.visited_youtube === true,
          resourcesViewedList: s.properties.resources_viewed_list || '',
          // Consent data (NAY-9)
          hasConsented: consentData.hasConsented,
          consentDate: consentData.consentDate,
          consentVersion: consentData.consentVersion
        };
      })
    };

    // Calculate overall satisfaction
    const allRatings = Object.values(analytics.averageRatings) as number[];
    analytics.overallSatisfaction = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;

    // Calculate completion rate
    const completionRate = analytics.totalResponses > 0
      ? (analytics.completedSurveys / analytics.totalResponses) * 100
      : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        ...analytics,
        completionRate: Math.round(completionRate * 10) / 10 // Round to 1 decimal
      }
    });

  } catch (error: any) {
    console.error('Error fetching survey analytics:', error);
    return res.status(500).json({
      error: 'Failed to fetch survey analytics',
      message: error.message
    });
  }
}

function calculateAverage(surveys: any[], propertyName: string): number {
  const validSurveys = surveys.filter((s: any) => {
    const value = s.properties[propertyName];
    return value && !isNaN(parseFloat(value)) && s.properties.survey_skipped !== 'true';
  });

  if (validSurveys.length === 0) return 0;

  const sum = validSurveys.reduce((acc: number, s: any) => {
    return acc + parseFloat(s.properties[propertyName]);
  }, 0);

  return Math.round((sum / validSurveys.length) * 10) / 10; // Round to 1 decimal
}

function maskEmail(email: string): string {
  if (!email || email === 'anonymous') return 'Anonymous User';

  const [localPart, domain] = email.split('@');
  if (!domain) return 'Anonymous User';

  const maskedLocal = localPart.length > 2
    ? localPart[0] + '***' + localPart[localPart.length - 1]
    : '***';

  return `${maskedLocal}@${domain}`;
}
