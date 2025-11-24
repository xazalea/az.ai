// OpenMemory integration - Memory query endpoint
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
    const { query, k = 8, filters } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // OpenMemory requires a backend server
    // For Vercel, we'll need to call the OpenMemory backend if available
    // Or return a note that OpenMemory needs to be enabled
    
    // Check if OpenMemory is enabled via environment variable
    const openMemoryUrl = process.env.OPENMEMORY_URL || null;
    
    if (!openMemoryUrl) {
      return NextResponse.json({
        error: 'OpenMemory is not configured',
        note: 'To enable OpenMemory, set OPENMEMORY_URL environment variable',
        enabled: false,
      }, { status: 503 });
    }

    // Call OpenMemory backend
    const response = await fetch(`${openMemoryUrl}/memory/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        query,
        k,
        filters,
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
      error: 'Memory query failed',
      details: error.message,
    }, { status: 500 });
  }
}

