// OpenMemory integration - Ingest document endpoint
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
    const { content_type, data, metadata, config: ingestConfig, user_id } = body;

    if (!content_type || !data) {
      return NextResponse.json({ error: 'Missing content_type or data' }, { status: 400 });
    }

    const openMemoryUrl = process.env.OPENMEMORY_URL || null;
    
    if (!openMemoryUrl) {
      return NextResponse.json({
        error: 'OpenMemory is not configured',
        note: 'To enable OpenMemory, set OPENMEMORY_URL environment variable',
        enabled: false,
      }, { status: 503 });
    }

    const response = await fetch(`${openMemoryUrl}/memory/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        content_type,
        data,
        metadata,
        config: ingestConfig,
        user_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenMemory API error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OpenMemory Error:', error);
    return NextResponse.json({
      error: 'Memory ingestion failed',
      details: error.message,
    }, { status: 500 });
  }
}

