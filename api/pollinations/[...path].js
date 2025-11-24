import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Consolidated Pollinations handler for chat and images
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

  const url = new URL(req.url);
  const pathname = url.pathname;
  
  // Extract the operation from path: /api/pollinations/v1/chat/completions or /api/pollinations/v1/images/generations
  const pathParts = pathname.split('/').filter(Boolean);
  const operation = pathParts[pathParts.length - 1]; // 'completions' or 'generations'
  
  try {
    const body = await req.json();
    
    if (operation === 'completions') {
      // Chat completions
      const { messages, model = 'pollinations' } = body;
      
      // Pollinations chat API
      const pollinationsUrl = 'https://api.pollinations.ai/chat';
      const response = await fetch(pollinationsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          model,
        }),
      });
      
      const data = await response.json();
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else if (operation === 'generations') {
      // Image generations
      const { prompt, n = 1, size = "1024x1024" } = body;
      
      // Pollinations image API
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?n=${n}&width=${size.split('x')[0]}&height=${size.split('x')[1]}`;
      const response = await fetch(pollinationsUrl);
      
      if (!response.ok) {
        throw new Error('Pollinations API error');
      }
      
      // Return image URL
      return NextResponse.json({
        created: Date.now(),
        data: [{
          url: pollinationsUrl,
        }],
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 404 });
    }
  } catch (error) {
    console.error('Pollinations Error:', error);
    return NextResponse.json({
      error: 'Pollinations operation failed',
      details: error.message,
    }, { status: 500 });
  }
}

