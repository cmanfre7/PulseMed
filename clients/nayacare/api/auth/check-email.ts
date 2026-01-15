import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

/**
 * Check if email exists in chatbot users database
 * Returns: { exists: boolean, userId?: string }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    console.log('Checking if email exists:', normalizedEmail);

    // Search for user by email
    const searchUrl = `https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/search`;

    const response = await fetch(searchUrl, {
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
            value: normalizedEmail
          }]
        }],
        properties: ['email'],
        limit: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot search error:', response.status, errorText);
      throw new Error(`HubSpot search failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return res.status(200).json({
        exists: true,
        userId: data.results[0].id
      });
    } else {
      return res.status(200).json({
        exists: false
      });
    }

  } catch (err: any) {
    console.error('Check email error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}
