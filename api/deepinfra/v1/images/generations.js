import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// DeepInfra image generation (Stable Diffusion models)
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
    const { model = 'stabilityai/stable-diffusion-xl-base-1.0', prompt, n = 1 } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // DeepInfra image generation endpoint
    const deepinfraUrl = `https://api.deepinfra.com/v1/inference/${model}`;
    
    const response = await fetch(deepinfraUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY || ''}`,
      },
      body: JSON.stringify({
        prompt,
        num_images: Math.min(n, 4),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'DeepInfra API error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Convert DeepInfra format to OpenAI format
    const images = Array.isArray(data.images) ? data.images : [data.image || data];
    const formattedImages = images.map((img) => ({
      url: img.startsWith('http') ? img : `data:image/png;base64,${img}`,
      revised_prompt: prompt,
    }));
    
    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: formattedImages,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('DeepInfra Image Error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message,
    }, { status: 500 });
  }
}

