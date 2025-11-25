import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// DeepInfra wrapper proxy - routes to DeepInfra via public proxies
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
    const { model, messages, stream = false } = body;
    
    if (!model || !messages) {
      return NextResponse.json({ error: 'Missing model or messages' }, { status: 400 });
    }

    // DeepInfra OpenAI-compatible endpoint
    const deepinfraUrl = `https://api.deepinfra.com/v1/openai/chat/completions`;
    
    // Try direct request first, then fallback to proxy if needed
    let response;
    try {
      response = await fetch(deepinfraUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model,
          messages,
          stream,
          ...(body.temperature !== undefined && { temperature: body.temperature }),
          ...(body.max_tokens !== undefined && { max_tokens: body.max_tokens }),
        }),
      });
    } catch (error) {
      // If direct fails, could implement proxy rotation here
      throw new Error(`DeepInfra API error: ${error.message}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'DeepInfra API error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DeepInfra Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
    }, { status: 500 });
  }
}

