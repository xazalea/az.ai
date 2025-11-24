import { NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs', // Changed to nodejs to support package imports
};

// Unified model routing - all models accessible via /v1/chat/completions with model parameter
// Models are specified in the request body: { "model": "qwen", ... }

async function getModelHandler(model) {
  if (!model) return null;
  
  const m = model.toLowerCase();
  
  try {
    // Import model packages directly
    if (m === 'qwen' || m.includes('qwen')) {
      const qwen = await import('../../packages/qwen-free-api/dist/index.mjs');
      return qwen.default || qwen;
    }
    if (m === 'deepseek' || m.includes('deepseek')) {
      if (m.includes('free')) {
        const deepseek = await import('../../packages/deepseek-free-api/dist/index.mjs');
        return deepseek.default || deepseek;
      }
      const deepseek = await import('../../packages/deepseek-free-api/dist/index.mjs');
      return deepseek.default || deepseek;
    }
    if (m === 'glm' || m.includes('glm')) {
      const glm = await import('../../packages/glm-free-api/dist/index.mjs');
      return glm.default || glm;
    }
    if (m === 'doubao' || m.includes('doubao')) {
      const doubao = await import('../../packages/doubao-free-api/dist/index.mjs');
      return doubao.default || doubao;
    }
    if (m === 'kimi' || m.includes('kimi')) {
      const kimi = await import('../../packages/kimi-free-api/dist/index.mjs');
      return kimi.default || kimi;
    }
    if (m === 'minimax' || m.includes('minimax') || m.includes('hailuo')) {
      const minimax = await import('../../packages/minimax-free-api/dist/index.mjs');
      return minimax.default || minimax;
    }
    if (m === 'step' || m.includes('step') || m.includes('yuewen')) {
      const step = await import('../../packages/step-free-api/dist/index.mjs');
      return step.default || step;
    }
    if (m === 'jimeng' || m.includes('jimeng')) {
      const jimeng = await import('../../packages/jimeng-free-api/dist/index.mjs');
      return jimeng.default || jimeng;
    }
    
    // For other models, we'll need to use fetch to external services or keep minimal routes
    // For now, return null to use fallback
    return null;
  } catch (error) {
    console.error(`Failed to load model handler for ${model}:`, error);
    return null;
  }
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
    const { model, messages, use_memory = true, use_reasoning = true } = body;
    const url = new URL(req.url);
    
    // Auto-generate session ID
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'anonymous';
    const userAgent = req.headers.get('user-agent') || '';
    const sessionKey = `${clientIP}-${userAgent}`;
    const sessionId = body.session_id || `session_${Buffer.from(sessionKey).toString('base64').substring(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
    
    // Try to get model handler
    const modelHandler = await getModelHandler(model);
    
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
    
    // If we have a direct handler, use it
    if (modelHandler) {
      // Create a Koa-like request/response for the handler
      // Most of these packages expect Koa middleware
      const ctx = {
        request: {
          body: { ...body, messages: [...memoryContext, ...messages] },
          headers: Object.fromEntries(req.headers.entries()),
        },
        response: {
          body: null,
          status: 200,
          headers: {},
        },
        set: function(key, value) { this.response.headers[key] = value; },
        status: 200,
      };
      
      try {
        await modelHandler(ctx, async () => {});
        responseData = ctx.response.body;
      } catch (error) {
        // Fallback to fetch if handler fails
        const fallbackUrl = new URL(`/api/${model}/v1/chat/completions`, url.origin);
        const response = await fetch(fallbackUrl, {
          method: 'POST',
          headers: req.headers,
          body: JSON.stringify({ ...body, messages: [...memoryContext, ...messages] }),
        });
        responseData = await response.json();
      }
    } else {
      // Fallback: use external API routes for models we can't import directly
      // This includes Python/Go models and external services
      const fallbackRoutes = {
        'gpt-4': '/api/gpt4freejs/v1/chat/completions',
        'gpt4': '/api/gpt4freejs/v1/chat/completions',
        'gpt-3.5': '/api/gpt4freejs/v1/chat/completions',
        'gpt3.5': '/api/gpt4freejs/v1/chat/completions',
        'chatgpt': '/api/gpt4freejs/v1/chat/completions',
        'pollinations': '/api/pollinations/v1/chat/completions',
        'webai': '/api/webai/v1/chat/completions',
        'g4f': '/api/webai/v1/chat/completions',
        'gemini-multimodal': '/api/gemini-multimodal/v1/chat/completions',
        'groq': '/api/groq/v1/chat/completions',
      };
      
      const fallbackRoute = fallbackRoutes[model?.toLowerCase()] || '/api/gpt4freejs/v1/chat/completions';
      const fallbackUrl = new URL(fallbackRoute, url.origin);
      
      const response = await fetch(fallbackUrl, {
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
