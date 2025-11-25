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
    // DeepInfra models endpoint
    const deepinfraUrl = `https://api.deepinfra.com/v1/openai/models`;
    
    const response = await fetch(deepinfraUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY || ''}`,
      },
    });

    if (!response.ok) {
      // Return a default list of common DeepInfra models if API fails
      return NextResponse.json({
        object: 'list',
        data: [
          { id: 'meta-llama/Llama-2-70b-chat-hf', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'mistralai/Mixtral-8x7B-Instruct-v0.1', object: 'model', created: 1677610602, owned_by: 'mistral' },
          { id: 'meta-llama/Llama-3-70b-instruct', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'meta-llama/Llama-3-8b-instruct', object: 'model', created: 1677610602, owned_by: 'meta' },
          { id: 'Qwen/Qwen2.5-72B-Instruct', object: 'model', created: 1677610602, owned_by: 'qwen' },
          { id: 'deepseek-ai/DeepSeek-V2.5', object: 'model', created: 1677610602, owned_by: 'deepseek' },
          { id: 'google/gemma-7b-it', object: 'model', created: 1677610602, owned_by: 'google' },
          { id: '01-ai/Yi-34B-Chat', object: 'model', created: 1677610602, owned_by: '01-ai' },
        ],
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' },
      });
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DeepInfra Models Error:', error);
    // Return default list on error
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

