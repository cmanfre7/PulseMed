export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  const envCheck = {
    USE_VENDOR_LLM: process.env.USE_VENDOR_LLM,
    VENDOR_API_KEY_EXISTS: !!process.env.VENDOR_API_KEY,
    VENDOR_API_KEY_LENGTH: process.env.VENDOR_API_KEY ? process.env.VENDOR_API_KEY.length : 0,
    VENDOR_API_KEY_PREFIX: process.env.VENDOR_API_KEY ? process.env.VENDOR_API_KEY.substring(0, 10) + '...' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV
  };

  return res.status(200).json({ 
    message: 'Environment check',
    env: envCheck,
    timestamp: new Date().toISOString()
  });
}
