import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Unified model routing - all models accessible via /v1/chat/completions with model parameter
// Models are specified in the request body: { "model": "qwen", ... }

// Map models to their package handlers or API routes
const MODEL_HANDLERS = {
  // Direct package imports (will be handled via dynamic imports)
  'qwen': 'qwen-free-api',
  'deepseek': 'deepseek-free-api',
  'deepseek-free': 'deepseek-free-api',
  'glm': 'glm-free-api',
  'doubao': 'doubao-free-api',
  'kimi': 'kimi-free-api',
  'minimax': 'minimax-free-api',
  'hailuo': 'minimax-free-api',
  'step': 'step-free-api',
  'yuewen': 'step-free-api',
  'jimeng': 'jimeng-free-api',
  
  // External API routes (Python/Go or external services)
  'groq': '/api/groq/v1/chat/completions',
  'gpt-4': '/api/gpt4freejs/v1/chat/completions',
  'gpt4': '/api/gpt4freejs/v1/chat/completions',
  'gpt-3.5': '/api/gpt4freejs/v1/chat/completions',
  'gpt3.5': '/api/gpt4freejs/v1/chat/completions',
  'gpt-3': '/api/gpt4freejs/v1/chat/completions',
  'chatgpt': '/api/gpt4freejs/v1/chat/completions',
  'gemini-multimodal': '/api/gemini-multimodal/v1/chat/completions',
  'gemini-2.5-pro': '/api/gpt4freejs/v1/chat/completions',
  'pollinations': '/api/pollinations/v1/chat/completions',
  'blackbox': '/api/gpt4freejs/v1/chat/completions',
  'ollama': '/api/gpt4freejs/v1/chat/completions',
  'webai': '/api/webai/v1/chat/completions',
  'g4f': '/api/webai/v1/chat/completions',
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

function findModelHandler(model) {
  if (!model) return '/api/gpt4freejs/v1/chat/completions'; // Default
  
  const m = model.toLowerCase();
  
  for (const [key, handler] of Object.entries(MODEL_HANDLERS)) {
    if (m === key || m.includes(key)) {
      return handler;
    }
  }
  
  return '/api/gpt4freejs/v1/chat/completions'; // Fallback
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
    const { model, messages, use_memory = true, use_reasoning = true } = body;
    const url = new URL(req.url);
    
    // Auto-generate session ID
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'anonymous';
    const userAgent = req.headers.get('user-agent') || '';
    const sessionKey = `${clientIP}-${userAgent}`;
    const sessionId = body.session_id || `session_${Buffer.from(sessionKey).toString('base64').substring(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
    
    const modelHandler = findModelHandler(model);
    
    // Session-based memory
    let memoryContext = [];
    if (use_memory !== false) {
      try {
        const conversationHistory = messages?.filter(m => m.role !== 'system').slice(0, -1) || [];
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        
        if (lastUserMessage) {
          const memoryRes = await fetch(new URL('/api/openmemory/memory/query', url.origin), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: lastUserMessage,
              k: 5,
              filters: { user_id: sessionId },
            }),
          });
          if (memoryRes.ok) {
            const memoryData = await memoryRes.json();
            if (memoryData.matches && memoryData.matches.length > 0) {
              memoryContext = memoryData.matches.map((m) => ({
                role: 'system',
                content: `[Previous Context] ${m.content}`,
              }));
            }
          }
        }
        
        if (conversationHistory.length > 0) {
          const recentContext = conversationHistory.slice(-6).map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));
          memoryContext = [...memoryContext, ...recentContext];
        }
      } catch (memError) {
        console.warn('Memory query failed:', memError);
      }
    }

    let responseData;
    let targetUrl;
    
    // If handler is a package name, we'll need to call it via a proxy route
    // For now, route all package-based models through a single proxy
    if (typeof modelHandler === 'string' && !modelHandler.startsWith('/')) {
      // Package-based model - use a proxy route
      // Since we removed individual routes, we'll create a generic proxy
      targetUrl = new URL(`/api/models/${modelHandler}/v1/chat/completions`, url.origin);
    } else {
      // API route
      targetUrl = new URL(modelHandler, url.origin);
    }
    
    // For package models, we'll need a fallback since we removed individual routes
    // Create a minimal proxy handler on-the-fly or use fetch to packages directly
    if (typeof modelHandler === 'string' && !modelHandler.startsWith('/')) {
      // Try to import and use the package directly
      try {
        const packagePath = `../../packages/${modelHandler}/dist/index.mjs`;
        const pkg = await import(packagePath);
        const handler = pkg.default || pkg;
        
        // Create a mock Koa context
        const ctx = {
          request: {
            body: { ...body, messages: [...memoryContext, ...messages] },
            headers: Object.fromEntries(req.headers.entries()),
          },
          response: {
            body: null,
            status: 200,
            set: function(key, value) { this.headers = this.headers || {}; this.headers[key] = value; },
            headers: {},
          },
          set: function(key, value) { this.response.headers[key] = value; },
          status: 200,
        };
        
        await handler(ctx, async () => {});
        responseData = ctx.response.body;
      } catch (importError) {
        // Fallback to gpt4freejs if package import fails
        targetUrl = new URL('/api/gpt4freejs/v1/chat/completions', url.origin);
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: req.headers,
          body: JSON.stringify({ ...body, messages: [...memoryContext, ...messages] }),
        });
        responseData = await response.json();
      }
    } else {
      // Use fetch for API routes
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify({ ...body, messages: [...memoryContext, ...messages] }),
      });
      responseData = await response.json();
    }

    // Store in session memory
    if (use_memory !== false && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        const assistantResponse = responseData.choices[0].message.content;
        
        await fetch(new URL('/api/openmemory/memory/add', url.origin), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `User: ${lastUserMessage}\nAssistant: ${assistantResponse}`,
            tags: ['session', 'chat', model],
            metadata: { 
              model, 
              session_id: sessionId,
              timestamp: Date.now(),
              temporary: true,
            },
            user_id: sessionId,
          }),
        });
      } catch (memError) {
        console.warn('Memory storage failed:', memError);
      }
    }
    
    if (use_memory !== false) {
      responseData.session_id = sessionId;
    }

    // Enhance with OpenReason
    if (use_reasoning !== false && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        
        const reasonUrl = new URL('/api/openreason/reason', url.origin);
        const reasonResponse = await fetch(reasonUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: lastUserMessage,
            config: {
              provider: 'openai',
              memory: { enabled: use_memory !== false },
            },
          }),
        });

        if (reasonResponse.ok) {
          const reasonData = await reasonResponse.json();
          if (reasonData.verdict) {
            responseData.reasoning = {
              engine: 'OpenReason',
              confidence: reasonData.confidence,
              mode: reasonData.mode,
              domain: reasonData.domain,
              complexity: reasonData.complexity,
            };
          }
        }
      } catch (reasonError) {
        console.warn('OpenReason enhancement failed:', reasonError);
      }
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
