import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const CHATBOT_USERS_OBJECT_ID = '2-174718108';
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const MAX_FAILED_ATTEMPTS = 3;

/**
 * Login user with email and PIN
 * Verifies PIN and returns user data
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

    const normalizedEmail = email.toLowerCase().trim();
    const pinHash = crypto.createHash('sha256').update(pin).digest('hex');

    console.log('Login attempt for:', normalizedEmail);

    // Search for user
    const searchUrl = `https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/search`;

    const searchResponse = await fetch(searchUrl, {
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
        properties: [
          'email',
          'pin_hash',
          'baby_profiles',
          'chat_history',
          'feeding_logs',
          'sleep_logs',
          'diaper_logs',
          'failed_login_attempts',
          'lockout_until',
          'created_at',
          'last_login'
        ],
        limit: 1
      })
    });

    if (!searchResponse.ok) {
      throw new Error(`HubSpot search failed: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or PIN' });
    }

    const user = searchData.results[0];
    const userId = user.id;

    // Fetch fresh data directly (bypass search cache)
    const getUserUrl = `https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/${userId}?properties=email,pin_hash,baby_profiles,chat_history,feeding_logs,sleep_logs,diaper_logs,weight_logs,length_logs,head_circ_logs,failed_login_attempts,lockout_until,created_at,last_login`;

    const getUserResponse = await fetch(getUserUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getUserResponse.ok) {
      throw new Error(`HubSpot GET failed: ${getUserResponse.status}`);
    }

    const userData = await getUserResponse.json();
    const userProps = userData.properties;

    console.log('Fetched fresh user data for:', userId);

    // Check if account is locked
    const lockoutUntil = parseInt(userProps.lockout_until) || 0;
    const now = Date.now();

    if (lockoutUntil > now) {
      const minutesLeft = Math.ceil((lockoutUntil - now) / 60000);
      return res.status(423).json({
        error: 'Account temporarily locked',
        message: `Too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        lockoutUntil
      });
    }

    // Verify PIN
    if (userProps.pin_hash !== pinHash) {
      // Increment failed attempts
      const failedAttempts = (parseInt(userProps.failed_login_attempts) || 0) + 1;

      const updateProps: any = {
        failed_login_attempts: failedAttempts
      };

      // Lock account if max attempts reached
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        updateProps.lockout_until = now + LOCKOUT_DURATION;
      }

      // Update failed attempts
      await fetch(`https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties: updateProps })
      });

      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        return res.status(423).json({
          error: 'Account locked',
          message: 'Too many failed attempts. Account locked for 15 minutes.'
        });
      }

      return res.status(401).json({
        error: 'Invalid email or PIN',
        attemptsLeft: MAX_FAILED_ATTEMPTS - failedAttempts
      });
    }

    // PIN is correct - Reset failed attempts and update last login
    await fetch(`https://api.hubapi.com/crm/v3/objects/${CHATBOT_USERS_OBJECT_ID}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          last_login: now,
          failed_login_attempts: 0,
          lockout_until: 0
        }
      })
    });

    console.log('Login successful for user:', userId, 'email:', userProps.email);

    // Parse JSON properties
    let babyProfiles = [];
    let chatHistory = [];
    let feedingLogs = [];
    let sleepLogs = [];
    let diaperLogs = [];
    let weightLogs = [];
    let lengthLogs = [];
    let headCircLogs = [];

    console.log('Raw properties from HubSpot:', {
      baby_profiles: userProps.baby_profiles,
      chat_history: userProps.chat_history,
      feeding_logs: userProps.feeding_logs,
      sleep_logs: userProps.sleep_logs,
      diaper_logs: userProps.diaper_logs,
      weight_logs: userProps.weight_logs,
      length_logs: userProps.length_logs,
      head_circ_logs: userProps.head_circ_logs
    });

    // Debug: Log ALL property names to find the correct ones
    console.log('All property keys:', Object.keys(userProps));

    try {
      babyProfiles = JSON.parse(userProps.baby_profiles || '[]');
    } catch (e) {
      console.warn('Failed to parse baby_profiles');
    }

    try {
      chatHistory = JSON.parse(userProps.chat_history || '[]');
    } catch (e) {
      console.warn('Failed to parse chat_history');
    }

    try {
      feedingLogs = JSON.parse(userProps.feeding_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse feeding_logs');
    }

    try {
      sleepLogs = JSON.parse(userProps.sleep_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse sleep_logs');
    }

    try {
      diaperLogs = JSON.parse(userProps.diaper_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse diaper_logs');
    }

    try {
      weightLogs = JSON.parse(userProps.weight_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse weight_logs');
    }

    try {
      lengthLogs = JSON.parse(userProps.length_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse length_logs');
    }

    try {
      headCircLogs = JSON.parse(userProps.head_circ_logs || '[]');
    } catch (e) {
      console.warn('Failed to parse head_circ_logs');
    }

    return res.status(200).json({
      success: true,
      userId,
      email: userProps.email,
      babyProfiles,
      chatHistory,
      feedingLogs,
      sleepLogs,
      diaperLogs,
      weightLogs,
      lengthLogs,
      headCircLogs,
      createdAt: parseInt(userProps.created_at),
      lastLogin: now
    });

  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}
