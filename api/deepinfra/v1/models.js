import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Fetch available DeepInfra models
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
    // DeepInfra models endpoint - fetches ALL available models
    // According to https://deepinfra.com/models, this should return all models across all categories
    const deepinfraUrl = `https://api.deepinfra.com/v1/openai/models`;
    
    let response;
    const apiKey = process.env.DEEPINFRA_API_KEY;
    
    // Try with API key first (if available, may return more models)
    if (apiKey) {
      try {
        response = await fetch(deepinfraUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'az.ai/1.0',
          },
          // No timeout - let it fetch all models
        });
      } catch (error) {
        console.warn('DeepInfra API fetch with key failed:', error.message);
        response = null;
      }
    }
    
    // If no API key or request failed, try without auth
    // DeepInfra API may work without auth for public models
    if (!response || !response.ok) {
      try {
        response = await fetch(deepinfraUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; az.ai/1.0)',
          },
        });
      } catch (error) {
        console.warn('DeepInfra API fetch without auth failed:', error.message);
      }
    }

    if (!response || !response.ok) {
      // Return an expanded default list if API fails
      // This should rarely happen - the API should return all models
      console.warn('DeepInfra API returned non-OK status, using default models. Status:', response?.status);
      
      // Import the static list as fallback
      const { DEEPINFRA_MODELS } = await import('@/lib/deepinfra-models');
      
      return NextResponse.json({
        object: 'list',
        data: DEEPINFRA_MODELS.map((modelId, index) => ({
          id: modelId,
          object: 'model',
          created: 1677610602 + index, // Unique timestamps
          owned_by: modelId.split('/')[0] || 'deepinfra',
        })),
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    
    // Ensure we return the data in the correct format
    // DeepInfra API returns { object: 'list', data: [...] } format
    let modelsArray = [];
    if (Array.isArray(data)) {
      modelsArray = data;
    } else if (data && data.data && Array.isArray(data.data)) {
      modelsArray = data.data;
    } else if (data && typeof data === 'object') {
      // If it's an object with models, try to extract
      modelsArray = Object.values(data).find(Array.isArray) || [];
    }
    
    // Return all models - DeepInfra API should return the complete list
    return NextResponse.json({
      object: 'list',
      data: modelsArray.length > 0 ? modelsArray : (data.data || data || []),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DeepInfra Models Error:', error);
    // Return expanded default list on error
    try {
      const { DEEPINFRA_MODELS } = await import('@/lib/deepinfra-models');
      return NextResponse.json({
        object: 'list',
        data: DEEPINFRA_MODELS.map((modelId, index) => ({
          id: modelId,
          object: 'model',
          created: 1677610602 + index,
          owned_by: modelId.split('/')[0] || 'deepinfra',
        })),
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    } catch (importError) {
      // Final fallback
      return NextResponse.json({
        object: 'list',
        data: [
          { id: 'meta-llama/Llama-2-70b-chat-hf', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', object: 'model', created: 1677610602, owned_by: 'mistral' },
        ],
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }
  }
}

