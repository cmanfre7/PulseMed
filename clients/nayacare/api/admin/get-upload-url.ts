import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Generate a pre-signed URL for direct browser-to-HubSpot uploads
 * This bypasses Vercel's 4.5MB limit
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
    const { fileName, category, fileSize } = req.body;

    if (!fileName || !category) {
      return res.status(400).json({ error: 'fileName and category are required' });
    }

    // Return HubSpot credentials for direct upload
    // In production, you might want to generate a temporary token
    return res.status(200).json({
      success: true,
      uploadUrl: 'https://api.hubapi.com/files/v3/files',
      accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
      fileName,
      category,
      fileSize
    });

  } catch (err: any) {
    console.error('Get upload URL error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message || 'Failed to generate upload URL'
    });
  }
}
