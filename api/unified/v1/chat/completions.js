import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified model routing - all models accessible via /v1/chat/completions with model parameter
const MODEL_ROUTES = {
  // Text generation models
  'qwen': '/api/qwen/v1/chat/completions',
  'deepseek': '/api/deepseek/v1/chat/completions',
  'deepseek-free': '/api/deepseekfree/v1/chat/completions',
  'glm': '/api/glm/v1/chat/completions',
  'doubao': '/api/doubao/v1/chat/completions',
  'kimi': '/api/kimi/v1/chat/completions',
  'minimax': '/api/minimax/v1/chat/completions',
  'hailuo': '/api/minimax/v1/chat/completions',
  'step': '/api/step/v1/chat/completions',
  'yuewen': '/api/step/v1/chat/completions',
  'groq': '/api/groq/v1/chat/completions',
  'gpt-4': '/api/gpt4free/v1/chat/completions',
  'gpt4': '/api/gpt4free/v1/chat/completions',
  'gpt-3.5': '/api/freegpt/v1/chat/completions',
  'gpt3.5': '/api/freegpt/v1/chat/completions',
  'gpt-3': '/api/freegpt/v1/chat/completions',
  'chatgpt': '/api/chatgptfree/v1/chat/completions',
  'gemini-multimodal': '/api/gemini-multimodal/v1/chat/completions',
  'gemini-2.5-pro': '/api/cliproxy/v1/chat/completions',
  'claude-code': '/api/cliproxy/v1/chat/completions',
  'qwen-code': '/api/cliproxy/v1/chat/completions',
  'pollinations': '/api/pollinations/v1/chat/completions',
};

function findModelRoute(model) {
  if (!model) return '/api/groq/v1/chat/completions'; // Default
  
  const m = model.toLowerCase();
  
  // Check exact matches first
  for (const [key, route] of Object.entries(MODEL_ROUTES)) {
    if (m === key || m.includes(key)) {
      return route;
    }
  }
  
  // Fallback to default
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
    
    const targetEndpoint = findModelRoute(model);
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
