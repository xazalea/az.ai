import { NextResponse } from 'next/server';

export const config = {
  runtime: 'nodejs',
};

// Generic model proxy - handles all package-based models
// Routes: /api/models/{package-name}/v1/chat/completions
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
    const url = new URL(req.url);
    const pathname = url.pathname;
    
    // Extract package name from path: /api/models/qwen-free-api/v1/chat/completions
    const pathParts = pathname.split('/').filter(Boolean);
    const packageIndex = pathParts.indexOf('models');
    
    if (packageIndex === -1 || packageIndex >= pathParts.length - 1) {
      return NextResponse.json({ error: 'Invalid model path' }, { status: 400 });
    }
    
    const packageName = pathParts[packageIndex + 1]; // e.g., 'qwen-free-api'
    const remainingPath = '/' + pathParts.slice(packageIndex + 2).join('/'); // e.g., '/v1/chat/completions'
    
    // Import the package
    const packagePath = `../../packages/${packageName}/dist/index.mjs`;
    const pkg = await import(packagePath);
    const app = pkg.default || pkg;
    
    // Create a Koa-compatible context
    const body = await req.json();
    const ctx = {
      request: {
        body: body,
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
        url: remainingPath,
        path: remainingPath,
        query: {},
      },
      response: {
        body: null,
        status: 200,
        headers: {},
        set: function(key, value) { this.headers[key] = value; },
      },
      set: function(key, value) { this.response.headers[key] = value; },
      status: 200,
    };
    
    // Call the Koa app with timeout
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000); // 30 second timeout
      });
      
      // Race between the app call and timeout
      await Promise.race([
        app(ctx, async () => {}),
        timeoutPromise
      ]);
      
      // Check if response body exists
      if (!ctx.response.body) {
        throw new Error('No response from model package');
      }
      
      return NextResponse.json(ctx.response.body, {
        status: ctx.response.status || 200,
        headers: {
          ...ctx.response.headers,
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      // If package fails, try fallback to webai
      if (packageName.includes('qwen') || packageName.includes('deepseek') || packageName.includes('glm')) {
        console.log(`[API] Package ${packageName} failed, falling back to webai`);
        try {
          const fallbackUrl = new URL('/api/webai/v1/chat/completions', url.origin);
          const fallbackResponse = await fetch(fallbackUrl.toString(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          
          const fallbackData = await fallbackResponse.json();
          return NextResponse.json(fallbackData, {
            status: fallbackResponse.status,
            headers: { 'Access-Control-Allow-Origin': '*' },
          });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Model proxy error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}

