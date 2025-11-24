// Pollinations API wrapper for image generation
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
    const { prompt, model = 'flux', width = 1024, height = 1024, seed, n = 1 } = body;
    
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    const images = [];
    for (let i = 0; i < Math.min(n, 4); i++) {
      const seedParam = seed ? `&seed=${seed + i}` : '';
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=${model}&width=${width}&height=${height}${seedParam}`;
      
      const response = await fetch(pollinationsUrl);
      
      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.statusText}`);
      }

      const imageBlob = await response.blob();
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      
      images.push({
        b64_json: base64,
        url: `data:image/png;base64,${base64}`,
        revised_prompt: prompt,
      });
    }
    
    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data: images,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}

