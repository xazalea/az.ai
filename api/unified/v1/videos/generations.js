import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified video generation - all models accessible via /v1/videos/generations with model parameter
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
      targetUrl = new URL('/api/viggle/v1/videos/generations', url.origin);
    } else if (m.includes('veo')) {
      targetUrl = new URL('/api/video/v1/videos/generations.py', url.origin);
    } else if (m.includes('ai-video') || m.includes('tongyi') || m.includes('vidu') || m.includes('pixverse') || m.includes('runway') || m.includes('luma') || m.includes('zhipu') || m.includes('stability')) {
      targetUrl = new URL('/api/ai-video/v1/videos/generations.py', url.origin);
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
