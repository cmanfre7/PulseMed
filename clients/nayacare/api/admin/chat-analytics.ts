import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const HUBSPOT_API_BASE = 'https://api.hubapi.com';
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('Missing HUBSPOT_ACCESS_TOKEN');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    console.log('🔍 Fetching chat users from HubSpot...');
    console.log('Object ID:', CHATBOT_USERS_OBJECT_ID);

    // Fetch all chatbot users from HubSpot
    const hubspotResponse = await fetch(
      `${HUBSPOT_API_BASE}/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}?limit=100&properties=email,chat_history,baby_profiles,created_at`,
      {
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`
        }
      }
    );

    console.log('HubSpot response status:', hubspotResponse.status);

    if (!hubspotResponse.ok) {
      const errorText = await hubspotResponse.text();
      console.error('HubSpot API error:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { message: errorText };
      }
      throw new Error(`HubSpot API error: ${errorData.message || hubspotResponse.statusText}`);
    }

    const data = await hubspotResponse.json();
    console.log('HubSpot raw response:', JSON.stringify(data, null, 2));

    const users = data.results || [];
    console.log(`Found ${users.length} users`);

    // Transform user data
    const chatUsers = users.map((user: any) => {
      let chatHistory = [];
      try {
        chatHistory = user.properties.chat_history
          ? JSON.parse(user.properties.chat_history)
          : [];
      } catch (e) {
        console.error(`Failed to parse chat_history for user ${user.id}:`, e);
      }

      let babyProfiles = [];
      try {
        babyProfiles = user.properties.baby_profiles
          ? JSON.parse(user.properties.baby_profiles)
          : [];
      } catch (e) {
        console.error(`Failed to parse baby_profiles for user ${user.id}:`, e);
      }

      return {
        id: user.id,
        email: user.properties.email || 'Unknown',
        chatHistory,
        babyProfiles,
        messageCount: chatHistory.length,
        createdAt: user.properties.created_at || user.createdAt,
        lastMessageDate: chatHistory.length > 0
          ? chatHistory[chatHistory.length - 1].timestamp
          : null
      };
    });

    // Sort by most recent activity
    chatUsers.sort((a: any, b: any) => {
      const dateA = a.lastMessageDate ? new Date(a.lastMessageDate).getTime() : 0;
      const dateB = b.lastMessageDate ? new Date(b.lastMessageDate).getTime() : 0;
      return dateB - dateA;
    });

    console.log(`Returning ${chatUsers.length} transformed users`);
    console.log('Sample user:', chatUsers[0] ? JSON.stringify(chatUsers[0], null, 2) : 'none');

    return res.status(200).json({
      success: true,
      users: chatUsers
    });

  } catch (error: any) {
    console.error('Error fetching chat analytics:', error);
    return res.status(500).json({
      error: 'Failed to fetch chat analytics',
      message: error.message
    });
  }
}
