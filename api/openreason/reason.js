// OpenReason integration - Mandatory reasoning engine
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
    const { query, config: reasonConfig } = body;

    if (!query) {
      return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    // Import OpenReason
    const { reason, init } = await import('../../../packages/OpenReason/src/index.js');
    
    // Initialize OpenReason if not already initialized
    // OpenReason will enhance all reasoning queries
    const cfg = reasonConfig || {
      provider: 'openai', // or 'anthropic', 'google', 'xai'
      memory: {
        enabled: true,
      },
    };

    // Use OpenReason to enhance the query
    const result = await reason(query, cfg);

    return NextResponse.json({
      query,
      verdict: result.verdict,
      confidence: result.confidence,
      mode: result.mode,
      domain: result.domain,
      complexity: result.complexity,
      latency: result.latency,
      metadata: result.metadata,
      reasoning_engine: 'OpenReason',
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('OpenReason Error:', error);
    return NextResponse.json({
      error: 'Reasoning failed',
      details: error.message,
    }, { status: 500 });
  }
}

