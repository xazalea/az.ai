import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// Consolidated OpenMemory handler for all memory operations
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
  
  // Extract the operation from the path
  // e.g., /api/openmemory/memory/query -> query
  const pathParts = pathname.split('/').filter(Boolean);
  const operation = pathParts[pathParts.length - 1]; // Last part: query, add, or ingest
  
  try {
    const body = await req.json();
    
    if (operation === 'query') {
      const { query, k = 8, filters } = body;

      if (!query) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 });
      }

      const openMemoryUrl = process.env.OPENMEMORY_URL || null;
      
      if (!openMemoryUrl) {
        return NextResponse.json({
          error: 'OpenMemory is not configured',
          note: 'To enable OpenMemory, set OPENMEMORY_URL environment variable',
          enabled: false,
        }, { status: 503 });
      }

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
    } else if (operation === 'add') {
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
    } else if (operation === 'ingest') {
      const { content_type, data: ingestData, metadata, config: ingestConfig, user_id } = body;

      if (!content_type || !ingestData) {
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
          data: ingestData,
          metadata,
          config: ingestConfig,
          user_id,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenMemory API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return NextResponse.json(responseData, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    } else {
      return NextResponse.json({ error: `Unknown operation: ${operation}` }, { status: 404 });
    }
  } catch (error) {
    console.error('OpenMemory Error:', error);
    return NextResponse.json({
      error: 'Memory operation failed',
      details: error.message,
    }, { status: 500 });
  }
}

