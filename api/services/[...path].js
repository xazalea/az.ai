import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified service router - handles all remaining JS-based API routes
// Routes: /api/services/{service}/{version}/{endpoint}
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Extract service from path: /api/services/{service}/{version}/{endpoint}
    const pathParts = pathname.split('/').filter(Boolean);
    const serviceIndex = pathParts.indexOf('services');
    
    if (serviceIndex === -1 || serviceIndex >= pathParts.length - 1) {
      return NextResponse.json({ error: 'Invalid service path' }, { status: 400 });
    }
    
    const service = pathParts[serviceIndex + 1]; // e.g., 'gpt4freejs', 'imagefx', 'viggle'
    const version = pathParts[serviceIndex + 2] || 'v1';
    const endpoint = pathParts.slice(serviceIndex + 3).join('/'); // e.g., 'chat/completions'
    
    // Route to appropriate handler based on service
    let targetUrl;
    
    if (service === 'gpt4freejs' && endpoint === 'chat/completions') {
      // gpt4freejs chat
      targetUrl = new URL('/api/gpt4freejs/v1/chat/completions', url.origin);
    } else if (service === 'imagefx' && endpoint === 'images/generations') {
      // ImageFX
      targetUrl = new URL('/api/imagefx/v1/images/generations', url.origin);
    } else if (service === 'viggle' && endpoint === 'videos/generations') {
      // Viggle
      targetUrl = new URL('/api/viggle/v1/videos/generations', url.origin);
    } else {
      return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
    }
    
    const body = await req.json();
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.text();
    
    return new NextResponse(data, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Service router error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

