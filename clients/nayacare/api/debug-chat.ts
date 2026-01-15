export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // For GET requests, use a default test message
    const message = req.method === 'GET' ? 'test' : (req.body?.message || 'test');
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    const USE_VENDOR_LLM = process.env.USE_VENDOR_LLM === 'true';
    const VENDOR_API_KEY = process.env.VENDOR_API_KEY;

    console.log('=== DEBUG CHAT TEST ===');
    console.log('USE_VENDOR_LLM:', USE_VENDOR_LLM);
    console.log('VENDOR_API_KEY exists:', !!VENDOR_API_KEY);
    console.log('VENDOR_API_KEY length:', VENDOR_API_KEY ? VENDOR_API_KEY.length : 0);
    console.log('VENDOR_API_KEY first 10 chars:', VENDOR_API_KEY ? VENDOR_API_KEY.substring(0, 10) + '...' : 'N/A');

    if (!USE_VENDOR_LLM || !VENDOR_API_KEY) {
      return res.status(200).json({
        error: 'AI not configured',
        USE_VENDOR_LLM,
        VENDOR_API_KEY_exists: !!VENDOR_API_KEY,
        VENDOR_API_KEY_length: VENDOR_API_KEY ? VENDOR_API_KEY.length : 0
      });
    }

    // Test the actual API call
    console.log('Making test Anthropic API call...');
    
    const testResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': VENDOR_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 100,
        temperature: 0.7,
        system: 'You are a helpful assistant. Respond briefly.',
        messages: [
          { role: 'user', content: 'Say hello' }
        ]
      })
    });

    console.log('Test API response status:', testResponse.status);
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.log('Test API error response:', errorText);
      return res.status(200).json({
        error: 'API call failed',
        status: testResponse.status,
        errorText: errorText
      });
    }

    const testData = await testResponse.json();
    console.log('Test API success response:', JSON.stringify(testData, null, 2));

    return res.status(200).json({
      success: true,
      response: testData,
      message: 'API call successful'
    });

  } catch (err) {
    console.error('Debug chat error:', err);
    return res.status(200).json({
      error: 'Exception occurred',
      message: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
  }
}
