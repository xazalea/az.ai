import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// DeepInfra video generation (for models like veo-3)
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
    const { model, prompt, duration, aspect_ratio, resolution } = body;
    
    if (!model || !prompt) {
      return NextResponse.json({ error: 'Missing model or prompt' }, { status: 400 });
    }

    // DeepInfra video generation endpoint
    // Note: DeepInfra may proxy video models through their API
    const deepinfraUrl = `https://api.deepinfra.com/v1/inference/${model}`;
    
    const apiKey = process.env.DEEPINFRA_API_KEY;
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    const requestBody = {
      prompt,
      ...(duration && { duration }),
      ...(aspect_ratio && { aspect_ratio }),
      ...(resolution && { resolution }),
    };
    
    const response = await fetch(deepinfraUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

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
    console.error('DeepInfra Video Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

