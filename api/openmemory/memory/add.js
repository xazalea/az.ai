// OpenMemory integration - Add memory endpoint
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
    const { content, tags, metadata, user_id } = body;

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 });
    }

    const openMemoryUrl = process.env.OPENMEMORY_URL || null;
    
    if (!openMemoryUrl) {
      return NextResponse.json({
        error: 'OpenMemory is not configured',
        note: 'To enable OpenMemory, set OPENMEMORY_URL environment variable',
        enabled: false,
      }, { status: 503 });
    }

    const response = await fetch(`${openMemoryUrl}/memory/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        content,
        tags,
        metadata,
        user_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenMemory API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OpenMemory Error:', error);
    return NextResponse.json({
      error: 'Memory storage failed',
      details: error.message,
    }, { status: 500 });
  }
}

