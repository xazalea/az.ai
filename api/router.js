import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Consolidated router for all model-specific API routes
export default async function handler(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Extract the model/service from the path
  // e.g., /api/qwen/v1/chat/completions -> qwen
  const pathParts = pathname.split('/').filter(Boolean);
  
  if (pathParts.length < 2) {
    return NextResponse.json({ error: 'Invalid API path' }, { status: 400 });
  }
  
  const service = pathParts[1]; // e.g., 'qwen', 'deepseek', etc.
  const remainingPath = '/' + pathParts.slice(2).join('/'); // e.g., '/v1/chat/completions'
  
  // Route to the appropriate handler based on service
  const serviceRoutes = {
    'qwen': '/api/qwen',
    'deepseek': '/api/deepseek',
    'glm': '/api/glm',
    'doubao': '/api/doubao',
    'kimi': '/api/kimi',
    'minimax': '/api/minimax',
    'step': '/api/step',
    'jimeng': '/api/jimeng',
    'gpt4free': '/api/gpt4free',
    'chatgptfree': '/api/chatgptfree',
    'freegpt': '/api/freegpt',
    'deepseekfree': '/api/deepseekfree',
    'gemini-multimodal': '/api/gemini-multimodal',
    'imagefx': '/api/imagefx',
    'imageai': '/api/imageai',
    'video': '/api/video',
    'webai': '/api/webai',
    'gpt4freejs': '/api/gpt4freejs',
    'jimeng-api': '/api/jimeng-api',
    'pollinations': '/api/pollinations',
    'viggle': '/api/viggle',
    'ai-video': '/api/ai-video',
  };
  
  const targetRoute = serviceRoutes[service];
  
  if (!targetRoute) {
    return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 404 });
  }
  
  // Forward the request to the appropriate service handler
  const targetUrl = new URL(targetRoute + remainingPath, url.origin);
  
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: req.headers,
      body: req.body ? await req.text() : undefined,
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
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

