import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified image generation - all models accessible via /v1/images/generations with model parameter
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
        message: 'az.ai unified image generation API',
        endpoint: '/v1/images/generations',
        method: 'Use POST to generate images',
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
    const { model, prompt, n = 1, size = "1024x1024" } = body;
    const url = new URL(req.url);
    
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }
    
    const m = model?.toLowerCase() || '';
    
    // Route to appropriate handler based on model
    let targetUrl;
    
    if (m.includes('stabilityai') || m.includes('stable-diffusion') || m.includes('deepinfra')) {
      targetUrl = new URL('/api/deepinfra/v1/images/generations', url.origin);
    } else if (m.includes('dreamina')) {
      targetUrl = new URL('/api/python/dreamina/v1/images/generations', url.origin);
    } else if (m.includes('jimeng') || m.includes('jimeng-api')) {
      targetUrl = new URL('/api/jimeng-api/v1/images/generations', url.origin);
    } else if (m.includes('pollinations') || m.includes('flux') || m.includes('turbo')) {
      targetUrl = new URL('/api/pollinations/v1/images/generations', url.origin);
    } else if (m.includes('imagefx') || m.includes('imagen')) {
      targetUrl = new URL('/api/services/imagefx/v1/images/generations', url.origin);
    } else if (m.includes('imageai')) {
      targetUrl = new URL('/api/python/imageai/v1/images/generations', url.origin);
    } else {
      // Default to pollinations
      targetUrl = new URL('/api/pollinations/v1/images/generations', url.origin);
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({ ...body, prompt, n, size }),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
