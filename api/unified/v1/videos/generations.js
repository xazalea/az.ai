import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified video generation - all models accessible via /v1/videos/generations with model parameter
export default async function handler(req) {
  // Get method from request - handle both Request object and custom handler format
  const method = req.method || (req instanceof Request ? req.method : null) || 'POST';
  const normalizedMethod = method.toUpperCase();

  if (normalizedMethod === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Handle GET requests (health checks)
  if (normalizedMethod === 'GET') {
    return NextResponse.json(
      { 
        message: 'az.ai unified video generation API',
        endpoint: '/v1/videos/generations',
        method: 'Use POST to generate videos',
        status: 'operational'
      },
      { 
        status: 200,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }

  // Only reject if method is explicitly set and is not POST
  if (method && normalizedMethod !== 'POST') {
    return NextResponse.json(
      { 
        error: 'Method not allowed', 
        details: `Method ${method} is not supported. Use POST.`,
        receivedMethod: method,
        supportedMethods: ['POST', 'GET', 'OPTIONS'],
      },
      { 
        status: 405, 
        headers: { 
          'Access-Control-Allow-Origin': '*',
          'Allow': 'POST, OPTIONS, GET'
        } 
      }
    );
  }

  try {
    const body = await req.json();
    const { model, prompt, duration = 8.0, aspect_ratio = "16:9" } = body;
    const url = new URL(req.url);
    
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    
    const m = model?.toLowerCase() || '';
    
    // Route to appropriate handler based on model
    let targetUrl;
    
    if (m.includes('jimeng') || m.includes('jimeng-api')) {
      targetUrl = new URL('/api/jimeng-api/v1/videos/generations', url.origin);
    } else if (m.includes('viggle')) {
      targetUrl = new URL('/api/services/viggle/v1/videos/generations', url.origin);
    } else if (m.includes('veo')) {
      targetUrl = new URL('/api/python/video/v1/videos/generations', url.origin);
    } else if (m.includes('ai-video') || m.includes('tongyi') || m.includes('vidu') || m.includes('pixverse') || m.includes('runway') || m.includes('luma') || m.includes('zhipu') || m.includes('stability')) {
      targetUrl = new URL('/api/python/ai-video/v1/videos/generations', url.origin);
    } else {
      // Default to jimeng-api
      targetUrl = new URL('/api/jimeng-api/v1/videos/generations', url.origin);
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({ ...body, prompt, duration, aspect_ratio }),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
