import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

interface SurveyData {
  // Ratings (1-5)
  ease_of_use: number;
  response_quality: number;
  felt_supported: number;
  trust_guidance: number;
  likelihood_recommend: number;

  // Open feedback
  improvement_suggestions?: string | null;

  // Session context
  session_duration_seconds: number;
  message_count: number;
  user_email: string;
  baby_profile_id?: string | null;

  // Metadata
  platform: 'web' | 'embed';
  chatbot_version: string;
  survey_version: string;

  // Feature usage tracking
  used_chat?: boolean;
  used_feeding_log?: boolean;
  used_sleep_log?: boolean;
  used_diaper_log?: boolean;
  used_growth_charts?: boolean;
  downloaded_resource?: boolean;
  visited_youtube?: boolean;
  resources_viewed_list?: string; // Comma-separated list
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check HubSpot token
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('Missing HUBSPOT_ACCESS_TOKEN');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const surveyData: SurveyData = req.body;

    // Validate required fields
    if (!surveyData || typeof surveyData !== 'object') {
      return res.status(400).json({ error: 'Invalid survey data' });
    }

    // Generate unique survey ID
    const surveyId = `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submittedAt = new Date().toISOString();
    const sessionDate = new Date(Date.now() - (surveyData.session_duration_seconds * 1000)).toISOString();

    // Prepare HubSpot custom object properties
    const properties: Record<string, any> = {
      survey_id: surveyId,
      user_email: surveyData.user_email || 'anonymous',
      baby_profile_id: surveyData.baby_profile_id || '',
      session_duration_seconds: surveyData.session_duration_seconds,
      message_count: surveyData.message_count,
      session_date: sessionDate,
      submitted_at: submittedAt,
      platform: surveyData.platform || 'web',
      chatbot_version: surveyData.chatbot_version || '1.7.2',
      survey_version: surveyData.survey_version || 'v1.0',
      survey_skipped: false
    };

    // Add ratings (only if provided)
    if (surveyData.ease_of_use > 0) properties.ease_of_use = surveyData.ease_of_use;
    if (surveyData.response_quality > 0) properties.response_quality = surveyData.response_quality;
    if (surveyData.felt_supported > 0) properties.felt_supported = surveyData.felt_supported;
    if (surveyData.trust_guidance > 0) properties.trust_guidance = surveyData.trust_guidance;
    if (surveyData.likelihood_recommend > 0) properties.likelihood_recommend = surveyData.likelihood_recommend;

    // Add open feedback if provided
    if (surveyData.improvement_suggestions) {
      properties.improvement_suggestions = surveyData.improvement_suggestions;
    }

    // Add feature usage tracking (HubSpot needs string "true"/"false" for booleans)
    properties.used_chat = surveyData.used_chat ? 'true' : 'false';
    properties.used_feeding_log = surveyData.used_feeding_log ? 'true' : 'false';
    properties.used_sleep_log = surveyData.used_sleep_log ? 'true' : 'false';
    properties.used_diaper_log = surveyData.used_diaper_log ? 'true' : 'false';
    properties.used_growth_charts = surveyData.used_growth_charts ? 'true' : 'false';
    properties.downloaded_resource = surveyData.downloaded_resource ? 'true' : 'false';
    properties.visited_youtube = surveyData.visited_youtube ? 'true' : 'false';
    if (surveyData.resources_viewed_list) {
      properties.resources_viewed_list = surveyData.resources_viewed_list;
    }

    console.log('📊 Feature usage being submitted:', {
      used_chat: properties.used_chat,
      used_feeding_log: properties.used_feeding_log,
      used_sleep_log: properties.used_sleep_log,
      used_diaper_log: properties.used_diaper_log,
      used_growth_charts: properties.used_growth_charts,
      downloaded_resource: properties.downloaded_resource,
      visited_youtube: properties.visited_youtube
    });

    console.log('📊 Submitting survey to HubSpot:', {
      survey_id: surveyId,
      user_email: properties.user_email,
      ratings_count: Object.keys(properties).filter(k => k.includes('rating') || k.match(/ease_of_use|response_quality|felt_supported|trust_guidance|likelihood_recommend/)).length
    });

    // Create record in HubSpot Custom Object
    // Use the fully qualified name for custom objects
    const hubspotResponse = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/2-174856652`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      }
    );

    if (!hubspotResponse.ok) {
      const errorData = await hubspotResponse.json();
      console.error('HubSpot API error:', errorData);
      throw new Error(`HubSpot API error: ${errorData.message || hubspotResponse.statusText}`);
    }

    const hubspotData = await hubspotResponse.json();

    console.log('✅ Survey saved to HubSpot:', hubspotData.id);

    // Return success response
    return res.status(200).json({
      success: true,
      survey_id: surveyId,
      hubspot_id: hubspotData.id,
      message: 'Survey submitted successfully'
    });

  } catch (error: any) {
    console.error('Error submitting survey:', error);
    return res.status(500).json({
      error: 'Failed to submit survey',
      message: error.message
    });
  }
}
