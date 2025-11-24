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
    const { model, messages, use_memory = true, use_reasoning = true } = body; // Both enabled by default, opt-out
    const url = new URL(req.url);
    
    // Auto-generate session ID from request (IP + User-Agent hash, or use existing if provided)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'anonymous';
    const userAgent = req.headers.get('user-agent') || '';
    const sessionKey = `${clientIP}-${userAgent}`;
    // Simple hash for session ID
    const sessionId = body.session_id || `session_${Buffer.from(sessionKey).toString('base64').substring(0, 16).replace(/[^a-zA-Z0-9]/g, '')}`;
    
    const targetEndpoint = findModelRoute(model);
    const targetUrl = new URL(targetEndpoint, url.origin);

    // Session-based memory: store conversation context per session (auto-enabled)
    let memoryContext = [];
    if (use_memory !== false) {
      try {
        // Get all previous messages from this session for context
        const conversationHistory = messages?.filter(m => m.role !== 'system').slice(0, -1) || [];
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        
        if (lastUserMessage) {
          // Query memory for relevant context from this session
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
              memoryContext = memoryData.matches.map((m: any) => ({
                role: 'system' as const,
                content: `[Previous Context] ${m.content}`,
              }));
            }
          }
        }
        
        // Also use recent conversation history as context (memory transfer across models)
        if (conversationHistory.length > 0) {
          const recentContext = conversationHistory.slice(-6).map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          }));
          memoryContext = [...memoryContext, ...recentContext];
        }
      } catch (memError) {
        console.warn('Memory query failed:', memError);
      }
    }

    // Get the base response from the model with memory context
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: req.headers,
      body: JSON.stringify({
        ...body,
        messages: [...memoryContext, ...messages],
      }),
    });

    const responseData = await response.json();

    // Store in session memory if enabled (auto-storage, transfers across models)
    if (use_memory !== false && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        const assistantResponse = responseData.choices[0].message.content;
        
        // Store conversation in session memory (transfers across models)
        await fetch(new URL('/api/openmemory/memory/add', url.origin), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `User: ${lastUserMessage}\nAssistant: ${assistantResponse}`,
            tags: ['session', 'chat', model], // Include model tag for filtering
            metadata: { 
              model, 
              session_id: sessionId,
              timestamp: Date.now(),
              temporary: true, // Mark as session-based
            },
            user_id: sessionId,
          }),
        });
      } catch (memError) {
        console.warn('Memory storage failed:', memError);
      }
    }
    
    // Return session_id in response for client tracking (optional)
    if (use_memory !== false) {
      responseData.session_id = sessionId;
    }

    // Enhance with OpenReason if enabled and we have a response
    if (use_reasoning !== false && responseData.choices && responseData.choices[0]?.message?.content) {
      try {
        const lastUserMessage = messages?.findLast(m => m.role === 'user')?.content || '';
        
        // Use OpenReason to enhance the reasoning
        const reasonUrl = new URL('/api/openreason/reason', url.origin);
        const reasonResponse = await fetch(reasonUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: lastUserMessage,
            config: {
              provider: 'openai',
              memory: { enabled: use_memory !== false && session_id ? true : false },
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
