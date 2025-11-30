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
  // Wrap everything in try-catch to ensure we always return a response
  try {
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

    let body;
    let model;
    
    try {
      // Parse request body
      body = await req.json();
      
      if (!body || !body.model) {
        return NextResponse.json(
          { error: 'Bad request', details: 'Model is required in request body' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
      }

      // Strip "openrouter:" prefix for routing decisions, but keep original for API calls
      let modelId = body.model;
      const originalModelId = modelId; // Keep original for downstream API
      if (typeof modelId === 'string' && modelId.startsWith('openrouter:')) {
        modelId = modelId.replace('openrouter:', '');
      }
      model = modelId.toLowerCase();
      
      // Keep original model ID in body for downstream APIs (they may need the prefix)
      // But use cleaned version for routing decisions
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Bad request', details: 'Invalid JSON in request body', message: parseError.message },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const url = new URL(req.url);
    let targetRoute = '/api/webai/v1/chat/completions'; // Default to webai (TypeScript)
    
    // Determine target route based on model
    try {
      // Package-based models (check first)
      if (model.includes('qwen') && !isDeepInfraModel(model)) {
        targetRoute = '/api/models/qwen-free-api/v1/chat/completions';
      } else if (model.includes('deepseek') && !model.includes('free') && !isDeepInfraModel(model)) {
        targetRoute = '/api/models/deepseek-free-api/v1/chat/completions';
      } else if (model.includes('glm')) {
        targetRoute = '/api/models/glm-free-api/v1/chat/completions';
      } else if (model.includes('doubao')) {
        targetRoute = '/api/models/doubao-free-api/v1/chat/completions';
      } else if (model.includes('kimi') && !isDeepInfraModel(model)) {
        targetRoute = '/api/models/kimi-free-api/v1/chat/completions';
      } else if (model.includes('minimax') || model.includes('hailuo')) {
        targetRoute = '/api/models/minimax-free-api/v1/chat/completions';
      } else if (model.includes('step') || model.includes('yuewen')) {
        targetRoute = '/api/models/step-free-api/v1/chat/completions';
      } else if (model.includes('jimeng') && !model.includes('api')) {
        targetRoute = '/api/models/jimeng-free-api/v1/chat/completions';
      }
      // DeepInfra models
      else if (isDeepInfraModel(model)) {
        targetRoute = '/api/deepinfra/v1/chat/completions';
      }
      // G4F models - use TypeScript implementation
      else if (isG4FModel(model)) {
        targetRoute = '/api/webai/v1/chat/completions';
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
          'webai': '/api/webai/v1/chat/completions',
          'g4f': '/api/webai/v1/chat/completions',
        'deepseek-free': '/api/python/deepseekfree/v1/chat/completions',
      };
        targetRoute = specialRoutes[model] || '/api/webai/v1/chat/completions';
      }
    } catch (routeError) {
      console.error('[API] Route determination error:', routeError);
      // Continue with default route
    }

    // Create timeout - fast timeout for better UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout - fail fast

    try {
      // Forward request to target route with retry logic
      const targetUrl = new URL(targetRoute, url.origin);
      
      console.log(`[API] Routing model "${model}" to ${targetRoute}`);
      
      let response;
      let lastError;
      const maxRetries = 3;
      
      // Retry logic for failed requests
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          response = await fetch(targetUrl.toString(), {
          method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            signal: controller.signal,
          });
          
          // If we got a response (even if not OK), break retry loop
          break;
        } catch (fetchErr) {
          lastError = fetchErr;
          // If it's an abort error, don't retry
          if (fetchErr.name === 'AbortError') {
            throw fetchErr;
          }
          // Wait a bit before retrying (exponential backoff)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
            console.log(`[API] Retry attempt ${attempt + 1} for model: ${model}`);
          }
        }
      }
      
      // If all retries failed, throw the last error
      if (!response) {
        throw lastError || new Error('Failed to fetch after retries');
      }

      clearTimeout(timeoutId);

      // Get response text
      const responseText = await response.text();
      
      // Try to parse JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        // If parsing fails, check if it's an error response
        if (!response.ok) {
          return NextResponse.json(
            { 
              error: 'API Error', 
              details: `The API returned an error (HTTP ${response.status})`,
              status: response.status,
              responseText: responseText.substring(0, 500),
              model: model,
              route: targetRoute
            },
            { 
              status: response.status || 500,
              headers: { 'Access-Control-Allow-Origin': '*' }
            }
          );
        }
        
        // If OK but not JSON, return error
        return NextResponse.json(
          { 
            error: 'Invalid response', 
            details: 'The API returned invalid JSON',
            status: response.status,
            responseText: responseText.substring(0, 500),
            model: model,
            route: targetRoute
          },
          { 
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Check if response has error
      if (responseData.error && !response.ok) {
        return NextResponse.json(
          {
            error: responseData.error.message || responseData.error || 'API Error',
            details: responseData.error.details || responseData.error.message || 'Unknown error',
            model: model,
            route: targetRoute
          },
          {
            status: response.status || 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Return successful response
    return NextResponse.json(responseData, {
        status: response.status || 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Handle timeout
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('aborted')) {
        console.error(`[API] Request timeout for model: ${model}, route: ${targetRoute}`);
        return NextResponse.json(
          { 
            error: 'Request timeout', 
            details: 'The request took too long to complete (over 30 seconds). Please try again with a different model.',
            model: model,
            route: targetRoute
          },
          { 
            status: 504,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Handle network errors
      if (fetchError.message?.includes('fetch') || fetchError.code === 'ENOTFOUND' || fetchError.code === 'ECONNREFUSED') {
        console.error(`[API] Network error for model: ${model}, route: ${targetRoute}`, fetchError);
        return NextResponse.json(
          { 
            error: 'Connection failed', 
            details: `Failed to connect to ${targetRoute}. The service may be unavailable.`,
            model: model,
            route: targetRoute,
            suggestion: 'Try a different model or check if the service is running'
          },
          { 
            status: 503,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Generic error
      console.error(`[API] Fetch error for model: ${model}, route: ${targetRoute}`, fetchError);
      return NextResponse.json(
        { 
          error: 'Request failed', 
          details: fetchError.message || 'Failed to process the request',
          model: model,
          route: targetRoute,
          errorType: fetchError.name || 'UnknownError'
        },
        { 
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }
  } catch (topLevelError) {
    // Catch any unexpected errors and always return a response
    console.error('[API] Top-level error:', topLevelError);
    console.error('[API] Error stack:', topLevelError.stack);
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        details: topLevelError.message || 'An unexpected error occurred',
        errorType: topLevelError.name || 'UnknownError',
        note: 'Please try again or contact support if the issue persists'
      }, 
      { 
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
