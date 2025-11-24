import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

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
    
    let targetEndpoint = '/api/groq/v1/chat/completions'; // Default to Groq
    const m = model ? model.toLowerCase() : '';

    if (m.includes('qwen')) {
        targetEndpoint = '/api/qwen/v1/chat/completions';
    } else if (m.includes('doubao')) {
        targetEndpoint = '/api/doubao/v1/chat/completions';
    } else if (m.includes('glm')) {
        targetEndpoint = '/api/glm/v1/chat/completions';
    } else if (m.includes('deepseek') && !m.includes('free')) {
        targetEndpoint = '/api/deepseek/v1/chat/completions';
    } else if (m.includes('deepseek') && m.includes('free')) {
        targetEndpoint = '/api/deepseekfree/v1/chat/completions';
    } else if (m.includes('kimi')) {
        targetEndpoint = '/api/kimi/v1/chat/completions';
    } else if (m.includes('minimax') || m.includes('hailuo')) {
        targetEndpoint = '/api/minimax/v1/chat/completions';
    } else if (m.includes('step') || m.includes('yuewen')) {
        targetEndpoint = '/api/step/v1/chat/completions';
    } else if (m.includes('gpt-4') || m.includes('gpt4')) {
        // Route GPT-4 models to gpt4free-ts
        targetEndpoint = '/api/gpt4free/v1/chat/completions';
    } else if (m.includes('gpt-3.5') || m.includes('gpt3.5') || m.includes('gpt-3')) {
        // Route GPT-3.5 to free-gpt3.5-2api or chatgptfree
        targetEndpoint = '/api/freegpt/v1/chat/completions';
    } else if (m.includes('chatgpt') || m.includes('chat-gpt')) {
        targetEndpoint = '/api/chatgptfree/v1/chat/completions';
    } else if (m.includes('gemini') && m.includes('multimodal')) {
        targetEndpoint = '/api/gemini-multimodal/v1/chat/completions';
    }

    // Jimeng is image gen, so it's likely handled by the image endpoint, but if they have chat...
    // The repo description says "Image generation top stream", so likely not chat.

    // Construct absolute URL for internal fetch
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
