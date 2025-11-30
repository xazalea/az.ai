import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// v2 API - Optimized for speed, routes to fastest models only
// All models specified via model parameter in request body
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
    
    // Route to fastest available model handler
    const m = model?.toLowerCase() || '';
    let targetUrl;
    
    // Fast models - route to appropriate handler
    if (m.includes('groq')) {
      targetUrl = new URL('/api/groq/v1/chat/completions', url.origin);
    } else if (m.includes('qwen')) {
      targetUrl = new URL('/api/unified/v1/chat/completions', url.origin);
    } else if (m.includes('deepseek')) {
      targetUrl = new URL('/api/unified/v1/chat/completions', url.origin);
    } else if (m.includes('gpt-3.5') || m.includes('gpt3.5') || m.includes('chatgpt')) {
      targetUrl = new URL('/api/services/gpt4freejs/v1/chat/completions', url.origin);
    } else if (m.includes('gemini') && m.includes('flash')) {
      targetUrl = new URL('/api/webai/v1/chat/completions', url.origin);
    } else if (m.includes('pollinations')) {
      targetUrl = new URL('/api/pollinations/v1/chat/completions', url.origin);
    } else {
      targetUrl = new URL('/api/unified/v1/chat/completions', url.origin);
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body),
    });

    return response;
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      note: 'v2 API is optimized for speed. Use /v1/chat/completions for all models.'
    }, { status: 500 });
  }
}
