// gpt4free.js wrapper for Vercel
// Using Node.js runtime for ES module support
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return NextResponse.json(null, {
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
    const { model, messages, provider = 'BlackBox' } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid messages' }, { status: 400 });
    }

    // Import gpt4free.js (ES module)
    const GPT4js = (await import('../../../packages/gpt4free.js/index.js')).default;

    // Create provider instance
    const providerInstance = GPT4js.createProvider(provider);

    // Call chatCompletion
    const response = await providerInstance.chatCompletion(messages, { model });

    // Format as OpenAI-compatible response
    return NextResponse.json({
      id: `chatcmpl-gpt4freejs-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model || provider.toLowerCase(),
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: response || response.text || 'No response generated',
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('gpt4free.js API Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

