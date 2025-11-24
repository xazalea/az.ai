import { NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs', // Changed to nodejs to support package imports
};

// Unified model routing - all models accessible via /v1/chat/completions with model parameter
// Models are specified in the request body: { "model": "qwen", ... }

async function callModelPackage(packageName, body, req) {
  try {
    // Import the package
    const packagePath = `../../packages/${packageName}/dist/index.mjs`;
    const pkg = await import(packagePath);
    const app = pkg.default || pkg;
    
    // Create a Koa-compatible context
    const ctx = {
      request: {
        body: body,
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
        url: '/v1/chat/completions',
        path: '/v1/chat/completions',
        query: {},
      },
      response: {
        body: null,
        status: 200,
        headers: {},
        set: function(key, value) { this.headers[key] = value; },
      },
      set: function(key, value) { this.response.headers[key] = value; },
      status: 200,
    };
    
    // Call the Koa app
    await app(ctx, async () => {});
    
    return {
      data: ctx.response.body,
      status: ctx.response.status,
      headers: ctx.response.headers,
    };
  } catch (error) {
    console.error(`Error calling ${packageName}:`, error);
    throw error;
  }
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
    
    const m = model?.toLowerCase() || '';
    
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
    let responseStatus = 200;
    
    // Determine which handler to use based on model
    const requestBody = { ...body, messages: [...memoryContext, ...messages] };
    
    // Package-based models (use generic proxy)
    let packageName = null;
    if (m.includes('qwen')) {
      packageName = 'qwen-free-api';
    } else if (m.includes('deepseek') && !m.includes('free')) {
      packageName = 'deepseek-free-api';
    } else if (m.includes('glm')) {
      packageName = 'glm-free-api';
    } else if (m.includes('doubao')) {
      packageName = 'doubao-free-api';
    } else if (m.includes('kimi')) {
      packageName = 'kimi-free-api';
    } else if (m.includes('minimax') || m.includes('hailuo')) {
      packageName = 'minimax-free-api';
    } else if (m.includes('step') || m.includes('yuewen')) {
      packageName = 'step-free-api';
    } else if (m.includes('jimeng') && !m.includes('api')) {
      packageName = 'jimeng-free-api';
    }
    
    if (packageName) {
      // Use generic model proxy
      const proxyUrl = new URL(`/api/models/${packageName}/v1/chat/completions`, url.origin);
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(requestBody),
      });
      responseData = await response.json();
      responseStatus = response.status;
    } else {
      // External API routes (Python/Go or services that need separate routes)
      const externalRoutes = {
        'groq': '/api/groq/v1/chat/completions',
        'gpt-4': '/api/gpt4freejs/v1/chat/completions',
        'gpt4': '/api/gpt4freejs/v1/chat/completions',
        'gpt-3.5': '/api/gpt4freejs/v1/chat/completions',
        'gpt3.5': '/api/gpt4freejs/v1/chat/completions',
        'chatgpt': '/api/gpt4freejs/v1/chat/completions',
        'gemini-multimodal': '/api/gemini-multimodal/v1/chat/completions',
        'pollinations': '/api/pollinations/v1/chat/completions',
        'webai': '/api/webai/v1/chat/completions',
        'g4f': '/api/webai/v1/chat/completions',
        'deepseek-free': '/api/deepseekfree/v1/chat/completions',
      };
      
      const targetRoute = externalRoutes[m] || '/api/gpt4freejs/v1/chat/completions';
      const targetUrl = new URL(targetRoute, url.origin);
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: req.headers,
        body: JSON.stringify(requestBody),
      });
      responseData = await response.json();
      responseStatus = response.status;
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
      status: responseStatus,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
