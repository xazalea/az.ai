import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified video generation routing
const VIDEO_MODEL_ROUTES = {
  'jimeng-api': '/api/jimeng-api/v1/videos/generations',
  'jimeng-enhanced': '/api/jimeng-api/v1/videos/generations',
  'veo-3': '/api/video/v1/videos/generations.py',
  'veo-3-fast': '/api/video/v1/videos/generations.py',
  'veo-2': '/api/video/v1/videos/generations.py',
  'viggle': '/api/viggle/v1/videos/generations',
  'viggle-ai': '/api/viggle/v1/videos/generations',
  'ai-video': '/api/ai-video/v1/videos/generations',
  'tongyi': '/api/ai-video/v1/videos/generations',
  'vidu': '/api/ai-video/v1/videos/generations',
  'pixverse': '/api/ai-video/v1/videos/generations',
  'stability-video': '/api/ai-video/v1/videos/generations',
  'runway': '/api/ai-video/v1/videos/generations',
  'zhipu': '/api/ai-video/v1/videos/generations',
  'luma': '/api/ai-video/v1/videos/generations',
};

function findVideoModelRoute(model) {
  if (!model) return '/api/video/v1/videos/generations.py'; // Default to Veo
  
  const m = model.toLowerCase();
  
  for (const [key, route] of Object.entries(VIDEO_MODEL_ROUTES)) {
    if (m === key || m.includes(key)) {
      return route;
    }
  }
  
  return '/api/video/v1/videos/generations.py';
}

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
    const { model } = body;
    const url = new URL(req.url);
    
    const targetEndpoint = findVideoModelRoute(model);
    const targetUrl = new URL(targetEndpoint, url.origin);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

