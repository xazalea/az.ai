// jimeng-api wrapper for enhanced video generation
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
    const { prompt, model, width = 1024, height = 1024, resolution = '720p', file_paths = [], response_format = 'url' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // Import jimeng-api video generation
    const { generateVideo, DEFAULT_MODEL } = await import('../../../packages/jimeng-api/src/api/controllers/videos.js');
    const util = await import('../../../packages/jimeng-api/src/lib/util.js');
    
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;
    
    if (!token) {
      return NextResponse.json({ 
        error: 'Missing Authorization token. jimeng-api requires a refresh token.' 
      }, { status: 401 });
    }

    const videoUrl = await generateVideo(
      model || DEFAULT_MODEL,
      prompt,
      {
        width,
        height,
        resolution,
        filePaths: file_paths,
      },
      token
    );

    let data;
    if (response_format === 'b64_json') {
      const videoBase64 = await util.default.fetchFileBASE64(videoUrl);
      data = [{
        b64_json: videoBase64,
        revised_prompt: prompt,
      }];
    } else {
      data = [{
        url: videoUrl,
        revised_prompt: prompt,
      }];
    }

    return NextResponse.json({
      created: Math.floor(Date.now() / 1000),
      data,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('jimeng-api Video Error:', error);
    return NextResponse.json({
      error: 'Video generation failed',
      details: error.message,
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

