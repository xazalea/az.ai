import { NextResponse } from 'next/server';

// Helper functions to check model types
function isG4FModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  const m = modelId.toLowerCase();
  if (isDeepInfraModel(modelId)) return false;
  
  const g4fPatterns = [
    'claude', 'gemini', 'gpt', 'llama', 'mistral', 'qwen', 'deepseek', 
    'glm', 'kimi', 'grok', 'imagen', 'dall-e', 'flux', 'sdxl', 'openchat',
    'nano-banana', 'sonar', 'pixtral', 'seed', 'meowgpt', 'recraft',
    'anondrop', 'azure', 'tts', 'audio'
  ];
  
  return g4fPatterns.some(pattern => m.includes(pattern));
}

function isDeepInfraModel(modelId) {
  if (!modelId || typeof modelId !== 'string') return false;
  const m = modelId.toLowerCase();
  
  const deepInfraPatterns = [
    'meta-llama/', 'mistralai/', 'qwen/', 'deepseek-ai/', 'anthropic/',
    'google/', 'openai/', 'microsoft/', 'nvidia/', 'stabilityai/',
    'black-forest-labs/', 'runway/', 'pika/', 'kling/', 'luma/',
    'bria/', 'seedream/', 'sentence-transformers/', 'thenlper/',
    'paddlepaddle/', 'nousresearch/'
  ];
  
  return deepInfraPatterns.some(pattern => m.includes(pattern)) || 
         m.startsWith('deepinfra/') ||
         (m.includes('/') && m.split('/').length === 2);
}

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed', details: 'Only POST requests are supported' },
      { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json();
    
    if (!body || !body.model) {
      return NextResponse.json(
        { error: 'Bad request', details: 'Model is required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const model = body.model.toLowerCase();
    const url = new URL(req.url);

    // Determine target route
    let targetRoute = '/api/python/webai/v1/chat/completions'; // Default to webai
    
    // Package-based models
    if (model.includes('qwen') && !isDeepInfraModel(model)) {
      targetRoute = `/api/models/qwen-free-api/v1/chat/completions`;
    } else if (model.includes('deepseek') && !model.includes('free') && !isDeepInfraModel(model)) {
      targetRoute = `/api/models/deepseek-free-api/v1/chat/completions`;
    } else if (model.includes('glm')) {
      targetRoute = `/api/models/glm-free-api/v1/chat/completions`;
    } else if (model.includes('doubao')) {
      targetRoute = `/api/models/doubao-free-api/v1/chat/completions`;
    } else if (model.includes('kimi') && !isDeepInfraModel(model)) {
      targetRoute = `/api/models/kimi-free-api/v1/chat/completions`;
    } else if (model.includes('minimax') || model.includes('hailuo')) {
      targetRoute = `/api/models/minimax-free-api/v1/chat/completions`;
    } else if (model.includes('step') || model.includes('yuewen')) {
      targetRoute = `/api/models/step-free-api/v1/chat/completions`;
    } else if (model.includes('jimeng') && !model.includes('api')) {
      targetRoute = `/api/models/jimeng-free-api/v1/chat/completions`;
    }
    // DeepInfra models
    else if (isDeepInfraModel(model)) {
      targetRoute = '/api/deepinfra/v1/chat/completions';
    }
    // G4F models
    else if (isG4FModel(model)) {
      targetRoute = '/api/python/webai/v1/chat/completions';
    }
    // Special routes
    else {
      const specialRoutes = {
        'groq': '/api/groq/v1/chat/completions',
        'gpt-4': '/api/services/gpt4freejs/v1/chat/completions',
        'gpt4': '/api/services/gpt4freejs/v1/chat/completions',
        'gpt-3.5': '/api/services/gpt4freejs/v1/chat/completions',
        'gpt3.5': '/api/services/gpt4freejs/v1/chat/completions',
        'chatgpt': '/api/services/gpt4freejs/v1/chat/completions',
        'gemini-multimodal': '/api/python/gemini-multimodal/v1/chat/completions',
        'pollinations': '/api/pollinations/v1/chat/completions',
        'webai': '/api/python/webai/v1/chat/completions',
        'g4f': '/api/python/webai/v1/chat/completions',
        'deepseek-free': '/api/python/deepseekfree/v1/chat/completions',
      };
      targetRoute = specialRoutes[model] || '/api/python/webai/v1/chat/completions';
    }

    // Create timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout

    try {
      // Forward request to target route
      const targetUrl = new URL(targetRoute, url.origin);
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Get response text
      const responseText = await response.text();
      
      // Parse JSON or return error
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        return NextResponse.json(
          { 
            error: 'Invalid response', 
            details: 'The API returned invalid JSON',
            status: response.status,
            responseText: responseText.substring(0, 500)
          },
          { 
            status: response.status || 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Return response with same status
      return NextResponse.json(responseData, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { 
            error: 'Request timeout', 
            details: 'The request took too long to complete. Please try again.',
            model: model
          },
          { 
            status: 504,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      console.error('[API] Fetch error:', fetchError);
      return NextResponse.json(
        { 
          error: 'Request failed', 
          details: fetchError.message || 'Failed to connect to the API',
          model: model
        },
        { 
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }

  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: error.message || 'An unexpected error occurred'
      }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
