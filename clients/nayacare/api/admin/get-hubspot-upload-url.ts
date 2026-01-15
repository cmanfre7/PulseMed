import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

/**
 * Simple endpoint to return HubSpot upload configuration
 * Frontend will use this to upload directly to HubSpot via our backend proxy
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
    const { fileName, category } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: 'fileName is required'
      });
    }

    console.log(`🔗 Preparing upload configuration for: ${fileName} (category: ${category})`);

    const folderPath = `/nayacare-pdfs/${category || 'other'}`;

    // Return configuration for frontend to use
    // Frontend will call our upload-pdf-chunked endpoint
    return res.status(200).json({
      success: true,
      uploadEndpoint: '/api/admin/upload-pdf-chunked',
      fileName: fileName,
      folderPath: folderPath,
      category: category || 'other'
    });

  } catch (err: any) {
    console.error('Error preparing upload:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: err.message || 'Failed to prepare upload'
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
  maxDuration: 10,
};
