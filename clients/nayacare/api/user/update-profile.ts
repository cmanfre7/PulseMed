import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

/**
 * Update user profile data (baby profiles, chat history, etc.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { userId, babyProfiles, chatHistory, feedingLogs, sleepLogs, diaperLogs, weightLogs, lengthLogs, headCircLogs } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    console.log('Updating user profile:', userId);
    console.log('Request body:', { babyProfiles, chatHistory, feedingLogs, sleepLogs });

    const properties: any = {};

    if (babyProfiles !== undefined) {
      properties.baby_profiles = JSON.stringify(babyProfiles);
      console.log('Setting baby_profiles to:', properties.baby_profiles);
    }

    if (chatHistory !== undefined) {
      properties.chat_history = JSON.stringify(chatHistory);
      console.log('Setting chat_history to:', properties.chat_history);
    }

    if (feedingLogs !== undefined) {
      properties.feeding_logs = JSON.stringify(feedingLogs);
      console.log('Setting feeding_logs to:', properties.feeding_logs);
    }

    if (sleepLogs !== undefined) {
      properties.sleep_logs = JSON.stringify(sleepLogs);
      console.log('Setting sleep_logs to:', properties.sleep_logs);
    }

    if (diaperLogs !== undefined) {
      properties.diaper_logs = JSON.stringify(diaperLogs);
      console.log('Setting diaper_logs to:', properties.diaper_logs);
    }

    if (weightLogs !== undefined) {
      properties.weight_logs = JSON.stringify(weightLogs);
      console.log('Setting weight_logs to:', properties.weight_logs);
    }

    if (lengthLogs !== undefined) {
      properties.length_logs = JSON.stringify(lengthLogs);
      console.log('Setting length_logs to:', properties.length_logs);
    }

    if (headCircLogs !== undefined) {
      properties.head_circ_logs = JSON.stringify(headCircLogs);
      console.log('Setting head_circ_logs to:', properties.head_circ_logs);
    }

    if (Object.keys(properties).length === 0) {
      return res.status(400).json({ error: 'No data to update' });
    }

    console.log('Final properties object being sent to HubSpot:', properties);

    // Update user in HubSpot
    const updateUrl = `https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/${userId}`;

    const response = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot update error:', response.status, errorText);
      throw new Error(`HubSpot update failed: ${response.status}`);
    }

    const data = await response.json();

    console.log('User profile updated successfully');
    console.log('HubSpot response:', JSON.stringify(data.properties));

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}
