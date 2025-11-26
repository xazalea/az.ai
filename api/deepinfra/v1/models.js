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
    // DeepInfra models endpoint - try with API key first, then without
    const deepinfraUrl = `https://api.deepinfra.com/v1/openai/models`;
    
    let response;
    const apiKey = process.env.DEEPINFRA_API_KEY;
    
    // Try with API key if available
    if (apiKey) {
      response = await fetch(deepinfraUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
    }
    
    // If no API key or request failed, try without auth (some endpoints work without auth)
    if (!response || !response.ok) {
      response = await fetch(deepinfraUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; az.ai/1.0)',
        },
      });
    }

    if (!response || !response.ok) {
      // Return an expanded default list including video models if API fails
      return NextResponse.json({
        object: 'list',
        data: [
          // Text models
          { id: 'meta-llama/Llama-2-70b-chat-hf', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', object: 'model', created: 1677610602, owned_by: 'mistral' },
          { id: 'meta-llama/Llama-3-70b-instruct', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'meta-llama/Llama-3-8b-instruct', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'Qwen/Qwen2.5-72B-Instruct', object: 'model', created: 1677610602, owned_by: 'qwen' },
          { id: 'deepseek-ai/DeepSeek-V2.5', object: 'model', created: 1677610602, owned_by: 'deepseek' },
          { id: 'google/gemma-7b-it', object: 'model', created: 1677610602, owned_by: 'google' },
          { id: '01-ai/Yi-34B-Chat', object: 'model', created: 1677610602, owned_by: '01-ai' },
          // Image models
          { id: 'stabilityai/stable-diffusion-xl-base-1.0', object: 'model', created: 1677610602, owned_by: 'stability-ai' },
          { id: 'black-forest-labs/FLUX-1-dev', object: 'model', created: 1677610602, owned_by: 'black-forest-labs' },
          // Video models
          { id: 'google/veo-3', object: 'model', created: 1677610602, owned_by: 'google' },
          { id: 'google/veo-3.0-generate-001', object: 'model', created: 1677610602, owned_by: 'google' },
        ],
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    
    // Ensure we return the data in the correct format
    if (Array.isArray(data)) {
      return NextResponse.json({
        object: 'list',
        data: data,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DeepInfra Models Error:', error);
    // Return expanded default list on error
    return NextResponse.json({
      object: 'list',
      data: [
        { id: 'meta-llama/Llama-2-70b-chat-hf', object: 'model', created: 1677610602, owned_by: 'meta' },
        { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', object: 'model', created: 1677610602, owned_by: 'mistral' },
        { id: 'google/veo-3', object: 'model', created: 1677610602, owned_by: 'google' },
      ],
    }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  }
}

