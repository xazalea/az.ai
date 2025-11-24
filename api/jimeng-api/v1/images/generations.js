// jimeng-api wrapper for enhanced image generation
// Note: jimeng-api requires a refresh token, so we'll proxy requests
import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
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
    const { prompt, model, ratio = '1:1', resolution = '2k', negative_prompt, sample_strength, response_format = 'url' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 });
    }

    // jimeng-api requires a refresh token in Authorization header
    // For now, we'll return instructions on how to use it
    // In production, you'd want to handle token management
    
    // Map OpenAI format to jimeng-api format
    const jimengBody = {
      model,
      prompt,
      ratio,
      resolution,
      negative_prompt,
      sample_strength,
      response_format,
    };

    // Note: jimeng-api needs to be running separately or we need to call it differently
    // For Vercel, we'll create a note that this requires the jimeng-api server
    return NextResponse.json({
      error: 'jimeng-api integration requires a refresh token. Please provide it in the Authorization header as Bearer <refresh_token>',
      note: 'jimeng-api provides enhanced image generation with composition features. See documentation for setup.',
    }, { status: 501 });
  } catch (error) {
    console.error('jimeng-api Error:', error);
    return NextResponse.json({
      error: 'Image generation failed',
      details: error.message,
    }, { status: 500 });
  }
}
