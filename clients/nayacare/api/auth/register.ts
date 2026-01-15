import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';

/**
 * Register new user with email and PIN
 * Creates new chatbot user record in HubSpot
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
    const { email, pin } = req.body;

    // Validation
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return res.status(400).json({ error: 'PIN must be exactly 4 digits' });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    console.log('Registering new user:', normalizedEmail);

    // Hash PIN using SHA-256
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');

    const now = Date.now();

    // Create user in HubSpot
    const createUrl = `https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}`;

    const response = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          email: normalizedEmail,
          pin_hash: pinHash,
          created_at: now,
          last_login: now,
          baby_profiles: JSON.stringify([]), // Empty array initially
          chat_history: JSON.stringify([]),
          feeding_logs: JSON.stringify([]),
          sleep_logs: JSON.stringify([]),
          diaper_logs: JSON.stringify([]),
          weight_logs: JSON.stringify([]),
          length_logs: JSON.stringify([]),
          head_circ_logs: JSON.stringify([]),
          failed_login_attempts: 0,
          lockout_until: 0
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HubSpot create error:', response.status, errorText);

      // Check if email already exists
      if (response.status === 409 || errorText.includes('already exists')) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      throw new Error(`HubSpot create failed: ${response.status}`);
    }

    const data = await response.json();

    console.log('User created successfully:', data.id);

    // Return same structure as login endpoint for consistency
    // This ensures the frontend can access email and other user data immediately
    return res.status(201).json({
      success: true,
      userId: data.id,
      email: normalizedEmail,
      babyProfiles: [],
      chatHistory: [],
      feedingLogs: [],
      sleepLogs: [],
      diaperLogs: [],
      weightLogs: [],
      lengthLogs: [],
      headCircLogs: [],
      message: 'Account created successfully'
    });

  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}
