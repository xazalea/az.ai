import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// v2 API - Optimized for speed, routes to fastest models only
// Recommended for small projects that need low latency
const FAST_MODEL_ROUTES = {
  // Ultra-fast models
  'groq': '/api/groq/v1/chat/completions',
  'qwen': '/api/qwen/v1/chat/completions',
  'deepseek-chat': '/api/deepseek/v1/chat/completions',
  'deepseek-free': '/api/deepseekfree/v1/chat/completions',
  'gemini-2.5-flash': '/api/webai/v1/chat/completions',
  'gpt-3.5-turbo': '/api/freegpt/v1/chat/completions',
  'gpt-3.5': '/api/freegpt/v1/chat/completions',
  'gpt3.5': '/api/freegpt/v1/chat/completions',
  'chatgpt': '/api/chatgptfree/v1/chat/completions',
  'pollinations': '/api/pollinations/v1/chat/completions',
  'mistral-large': '/api/webai/v1/chat/completions',
  'gpt-5.1-high': '/api/webai/v1/chat/completions',
  'gpt-5-chat': '/api/webai/v1/chat/completions',
  'claude-sonnet-4.5': '/api/webai/v1/chat/completions',
  'deepseek-v3.1': '/api/webai/v1/chat/completions',
};

function findFastModelRoute(model) {
  if (!model) return '/api/groq/v1/chat/completions'; // Default to Groq (fastest)
  
  const m = model.toLowerCase();
  
  // Check exact matches first
  for (const [key, route] of Object.entries(FAST_MODEL_ROUTES)) {
    if (m === key || m.includes(key)) {
      return route;
    }
  }
  
  // Fallback to Groq (fastest available)
  return '/api/groq/v1/chat/completions';
}

export default async function handler(req) {
  // Handle CORS preflight
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
    
    const targetEndpoint = findFastModelRoute(model);
    const targetUrl = new URL(targetEndpoint, url.origin);

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

