import { NextResponse } from 'next/server';

export const config = {
  runtime: 'edge',
};

// DeepInfra catch-all route
export default async function handler(req) {
  const url = new URL(req.url);
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  // Route to appropriate handler
  if (pathSegments[pathSegments.length - 1] === 'models') {
    const modelsHandler = await import('./v1/models.js');
    return modelsHandler.default(req);
  } else if (pathSegments.includes('chat') && pathSegments.includes('completions')) {
    const chatHandler = await import('./v1/chat/completions.js');
    return chatHandler.default(req);
  } else if (pathSegments.includes('images') && pathSegments.includes('generations')) {
    const imageHandler = await import('./v1/images/generations.js');
    return imageHandler.default(req);
  } else if (pathSegments.includes('videos') && pathSegments.includes('generations')) {
    const videoHandler = await import('./v1/videos/generations.js');
    return videoHandler.default(req);
  }
  
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

