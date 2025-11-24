import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified image generation - all models accessible via /v1/images/generations with model parameter
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
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
    
    if (m.includes('jimeng') || m.includes('jimeng-api')) {
      targetUrl = new URL('/api/jimeng-api/v1/images/generations', url.origin);
    } else if (m.includes('pollinations') || m.includes('flux') || m.includes('turbo')) {
      targetUrl = new URL('/api/pollinations/v1/images/generations', url.origin);
    } else if (m.includes('imagefx') || m.includes('imagen')) {
      targetUrl = new URL('/api/imagefx/v1/images/generations', url.origin);
    } else if (m.includes('imageai')) {
      targetUrl = new URL('/api/imageai/v1/images/generations', url.origin);
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
