import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';

interface SkipData {
  survey_skipped: true;
  session_duration_seconds: number;
  message_count: number;
  user_email: string;
  platform: 'web' | 'embed';
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
    const skipData: SkipData = req.body;

    // Generate unique survey ID
    const surveyId = `survey_skipped_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const submittedAt = new Date().toISOString();
    const sessionDate = new Date(Date.now() - (skipData.session_duration_seconds * 1000)).toISOString();

    // Prepare HubSpot custom object properties
    const properties = {
      survey_id: surveyId,
      user_email: skipData.user_email || 'anonymous',
      session_duration_seconds: skipData.session_duration_seconds,
      message_count: skipData.message_count,
      session_date: sessionDate,
      submitted_at: submittedAt,
      platform: skipData.platform || 'web',
      chatbot_version: '1.7.2',
      survey_version: 'v1.0',
      survey_skipped: true
    };

    console.log('⏭️  Logging survey skip:', {
      survey_id: surveyId,
      user_email: properties.user_email
    });

    // Create record in HubSpot Custom Object
    // Use the object type ID for custom objects
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
      // Don't throw - skip tracking is not critical
      return res.status(200).json({ success: true, logged: false });
    }

    const hubspotData = await hubspotResponse.json();

    console.log('✅ Survey skip logged to HubSpot:', hubspotData.id);

    // Return success response
    return res.status(200).json({
      success: true,
      logged: true,
      survey_id: surveyId
    });

  } catch (error: any) {
    console.error('Error logging survey skip:', error);
    // Don't fail - skip tracking is not critical
    return res.status(200).json({ success: true, logged: false });
  }
}
