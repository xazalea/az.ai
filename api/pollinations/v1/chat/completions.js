// Pollinations API wrapper for text generation
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

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
    const { messages, model = 'gemini-2.0-flash-exp' } = body;
    
    // Pollinations text API endpoint
    const prompt = messages?.map(m => `${m.role}: ${m.content}`).join('\n') || messages?.[messages.length - 1]?.content || '';
    
    const pollinationsUrl = `https://text.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}`;
    
    const response = await fetch(pollinationsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Transform to OpenAI format
    return NextResponse.json({
      id: `pollinations-${Date.now()}`,
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: text,
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: prompt.length / 4,
        completion_tokens: text.length / 4,
        total_tokens: (prompt.length + text.length) / 4,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

