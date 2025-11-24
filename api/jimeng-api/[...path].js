import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Consolidated Jimeng API handler for images and videos
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
  
  // Extract the operation from path: /api/jimeng-api/v1/images/generations or /api/jimeng-api/v1/videos/generations
  const pathParts = pathname.split('/').filter(Boolean);
  const operation = pathParts[pathParts.length - 2]; // 'images' or 'videos'
  
  try {
    const body = await req.json();
    const { prompt, model, n = 1, size = "1024x1024", duration = 8.0, aspect_ratio = "16:9" } = body;
    
    if (operation === 'images') {
      // Image generation
      // Forward to jimeng-api package
      const jimengApiUrl = new URL('/packages/jimeng-api/src/api/routes/images', url.origin);
      
      const response = await fetch(jimengApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          model,
          prompt,
          ratio: size === "1024x1024" ? "1:1" : "16:9",
          resolution: "2k",
          n,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ error: 'Jimeng API error', details: errorData }, { status: response.status });
      }
      
      const data = await response.json();
      return NextResponse.json({
        created: data.created || Date.now(),
        data: data.data || data,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else if (operation === 'videos') {
      // Video generation
      const jimengApiUrl = new URL('/packages/jimeng-api/src/api/routes/videos', url.origin);
      
      const response = await fetch(jimengApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          model,
          prompt,
          duration,
          aspect_ratio,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json({ error: 'Jimeng API error', details: errorData }, { status: response.status });
      }
      
      const data = await response.json();
      return NextResponse.json({
        created: data.created || Date.now(),
        data: data.data || data,
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 404 });
    }
  } catch (error) {
    console.error('Jimeng API Error:', error);
    return NextResponse.json({
      error: 'Jimeng API operation failed',
      details: error.message,
    }, { status: 500 });
  }
}

