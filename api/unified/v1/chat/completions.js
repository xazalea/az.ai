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
  // gpt4free.js models
  'blackbox': '/api/gpt4freejs/v1/chat/completions',
  'ollama': '/api/gpt4freejs/v1/chat/completions',
  // WebAI-to-API (g4f) models - supports all g4f models
  'g4f': '/api/webai/v1/chat/completions',
  'webai': '/api/webai/v1/chat/completions',
  // Common g4f model names
  'claude-opus-4.5': '/api/webai/v1/chat/completions',
  'claude-sonnet-4.5': '/api/webai/v1/chat/completions',
  'gemini-3-pro': '/api/webai/v1/chat/completions',
  'gpt-5.1-high': '/api/webai/v1/chat/completions',
  'gpt-5-chat': '/api/webai/v1/chat/completions',
  'gpt-oss-120b': '/api/webai/v1/chat/completions',
  'deepseek-v3.1': '/api/webai/v1/chat/completions',
  'mistral-large': '/api/webai/v1/chat/completions',
  'grok-4': '/api/webai/v1/chat/completions',
  'llama-4-scout': '/api/webai/v1/chat/completions',
  'llama-4-maverick': '/api/webai/v1/chat/completions',
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
    const { model, messages, use_reasoning = true } = body; // OpenReason enabled by default
    const url = new URL(req.url);
    
    const targetEndpoint = findModelRoute(model);
    const targetUrl = new URL(targetEndpoint, url.origin);

    // Get the base response from the model
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify(body),
    });

    const responseData = await response.json();

    // Enhance with OpenReason if enabled and we have a response
    if (use_reasoning && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        const assistantResponse = responseData.choices[0].message.content;
        
        // Use OpenReason to enhance the reasoning (non-blocking)
        // This adds reasoning capabilities to all responses
        const reasonUrl = new URL('/api/openreason/reason', url.origin);
        fetch(reasonUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: lastUserMessage,
            config: {
              provider: 'openai',
              memory: { enabled: false }, // Can be enabled via OpenMemory
            },
          }),
        }).then(reasonRes => reasonRes.json())
          .then(reasonData => {
            // Add reasoning metadata to response (async, won't block)
            if (reasonData.verdict) {
              responseData.reasoning = {
                engine: 'OpenReason',
                confidence: reasonData.confidence,
                mode: reasonData.mode,
                domain: reasonData.domain,
              };
            }
          })
          .catch(err => {
            // Silently fail - reasoning is enhancement, not required
            console.warn('OpenReason enhancement failed:', err);
          });
      } catch (reasonError) {
        // Silently fail - reasoning is enhancement
        console.warn('OpenReason integration error:', reasonError);
      }
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
