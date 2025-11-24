import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified image generation routing
const IMAGE_MODEL_ROUTES = {
  'jimeng-api': '/api/jimeng-api/v1/images/generations',
  'jimeng-enhanced': '/api/jimeng-api/v1/images/generations',
  'imagen-3': '/api/imagefx/v1/images/generations',
  'imagefx': '/api/imagefx/v1/images/generations',
  'jimeng': '/api/jimeng/v1/images/generations',
  'imageai-google': '/api/imageai/v1/images/generations',
  'imageai-openai': '/api/imageai/v1/images/generations',
  'imageai-stability': '/api/imageai/v1/images/generations',
  'pollinations': '/api/pollinations/v1/images/generations',
  'flux': '/api/pollinations/v1/images/generations',
  'turbo': '/api/pollinations/v1/images/generations',
};

function findImageModelRoute(model) {
  if (!model) return '/api/imagefx/v1/images/generations'; // Default
  
  const m = model.toLowerCase();
  
  for (const [key, route] of Object.entries(IMAGE_MODEL_ROUTES)) {
    if (m === key || m.includes(key)) {
      return route;
    }
  }
  
  return '/api/imagefx/v1/images/generations';
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
    
    const targetEndpoint = findImageModelRoute(model);
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

