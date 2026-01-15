import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Debug endpoint to check Vercel configuration limits
 * Access at: /api/admin/check-limits
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Return configuration information
  return res.status(200).json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_REGION: process.env.VERCEL_REGION,
    },
    config: {
      // These values come from vercel.json
      expectedMaxDuration: 60,
      expectedMemory: 3008,
      expectedMaxRequestBodySize: '100mb',
      note: 'maxRequestBodySize only works on Pro plan or higher'
    },
    limits: {
      // Vercel Pro limits
      pro_max_duration: '300 seconds (5 minutes)',
      pro_max_memory: '3008 MB',
      pro_max_body_size: '4.5 GB (configurable)',
      hobby_max_body_size: '4.5 MB (NOT configurable)',
    },
    hubspot: {
      hasAccessToken: !!process.env.HUBSPOT_ACCESS_TOKEN,
      hasPortalId: !!process.env.HUBSPOT_PORTAL_ID,
    },
    timestamp: new Date().toISOString()
  });
}

// Vercel config
export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 10,
};
