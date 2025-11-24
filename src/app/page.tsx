import React from 'react';

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-gray-800 selection:text-white">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-24">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-gray-800 bg-gray-900/50 text-xs font-medium text-gray-400 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            Systems Operational
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            az.ai
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl font-light leading-relaxed">
            The Enterprise-Grade, Affordable AI Infrastructure.
            <br />
            <span className="text-gray-500 text-lg">Unlimited access to state-of-the-art models. Zero environment variable friction.</span>
          </p>
          
          <div className="flex gap-4 mt-8">
            <a href="#docs" className="px-8 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-all">
              Get Started
            </a>
            <a href="#models" className="px-8 py-3 rounded-lg border border-gray-800 hover:border-gray-600 transition-all">
              View Models
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24" id="models">
          <FeatureCard 
            title="Qwen Code" 
            description="Powerful coding capabilities matching GPT-4 class performance. Optimized for low latency."
            endpoint="/qwen/v1/chat/completions"
            tag="Text Generation"
          />
          <FeatureCard 
            title="Groq LPU™" 
            description="Ultra-fast inference speeds for real-time applications. Powered by LPU inference engine."
            endpoint="/groq/v1/chat/completions"
            tag="High Speed"
          />
          <FeatureCard 
            title="ImageFX" 
            description="High-fidelity image generation powered by Google's Imagen models. OpenAI-compatible format."
            endpoint="/v1/images/generations"
            tag="Image Gen"
          />
        </div>

        {/* Documentation Section */}
        <div className="border-t border-gray-900 pt-16" id="docs">
          <h2 className="text-3xl font-bold mb-8">Integration Guide</h2>
          
          <div className="space-y-12">
            <CodeBlock 
              title="Text Generation (Qwen/Groq)" 
              lang="bash"
              code={`curl https://az.ai/qwen/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -d '{
    "model": "qwen",
    "messages": [{"role": "user", "content": "Hello world"}]
  }'`}
            />

            <CodeBlock 
              title="Image Generation (ImageFX)" 
              lang="bash"
              code={`curl https://az.ai/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_GOOGLE_COOKIE>" \\
  -d '{
    "prompt": "A futuristic cyberpunk city",
    "n": 1,
    "size": "1024x1024"
  }'`}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-gray-900 pt-8 text-center text-gray-600 text-sm">
          <p>© 2025 az.ai Inc. All rights reserved. Built for developers.</p>
        </footer>

      </div>
    </main>
  );
}

function FeatureCard({ title, description, endpoint, tag }) {
  return (
    <div className="p-6 rounded-xl border border-gray-900 bg-gray-900/20 hover:border-gray-700 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="px-2 py-1 rounded text-xs font-mono bg-gray-800 text-gray-300">{tag}</span>
      </div>
      <p className="text-gray-400 mb-6 min-h-[3rem]">{description}</p>
      <div className="flex items-center text-sm text-gray-500 font-mono bg-black/50 p-2 rounded">
        <span className="mr-2 text-green-500">$</span>
        {endpoint}
      </div>
    </div>
  );
}

function CodeBlock({ title, code, lang }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        {title}
      </h3>
      <div className="relative rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
        <div className="flex items-center px-4 py-2 bg-gray-900 border-b border-gray-800">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
          </div>
          <div className="ml-4 text-xs text-gray-500 font-mono uppercase">{lang}</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-gray-300 whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
