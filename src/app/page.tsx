import React from 'react';

// Color Palette: Lavender Sapphire Mist
// #D9A69F - Pale Pink/Lavender (Text/Accents)
// #6C739C - Muted Purple (Primary Elements)
// #F0DAD5 - Very Pale Pink (Backgrounds/Text)
// #BABBB1 - Grey (Borders/Secondary Text)
// #C56B62 - Deep Pink (Hover/Active)
// #424658 - Dark Grey/Navy (Main Background)
// #DEA785 - Peach (Accents/Highlights)

export default function Home() {
  return (
    <main className="min-h-screen bg-[#424658] text-[#F0DAD5] selection:bg-[#6C739C] selection:text-white font-sans">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-24">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#6C739C] bg-[#6C739C]/20 text-xs font-medium text-[#D9A69F] mb-4 shadow-[0_0_10px_rgba(217,166,159,0.2)]">
            <span className="flex h-2 w-2 rounded-full bg-[#DEA785] mr-2 animate-pulse"></span>
            Systems Operational
          </div>
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#D9A69F] via-[#F0DAD5] to-[#6C739C] drop-shadow-lg">
            az.ai
          </h1>
          <p className="text-xl md:text-2xl text-[#BABBB1] max-w-2xl font-light leading-relaxed">
            The Unified AI Infrastructure.
            <br />
            <span className="text-[#D9A69F] text-lg font-normal">All your favorite models. One API. Zero friction.</span>
          </p>
          
          <div className="flex gap-4 mt-8">
            <a href="#docs" className="px-8 py-3 rounded-lg bg-[#D9A69F] text-[#424658] font-bold hover:bg-[#DEA785] transition-all transform hover:scale-105 shadow-lg">
              Get Started
            </a>
            <a href="#models" className="px-8 py-3 rounded-lg border border-[#BABBB1] text-[#F0DAD5] hover:border-[#D9A69F] hover:text-[#D9A69F] transition-all backdrop-blur-sm bg-white/5">
              View Models
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24" id="models">
          <FeatureCard 
            title="Unified Chat" 
            description="Access Qwen, GLM, DeepSeek, Kimi, Doubao, MiniMax, and more via a single endpoint."
            endpoint="/v1/chat/completions"
            tag="Text Gen"
            highlight
          />
           <FeatureCard 
            title="ImageFX" 
            description="High-fidelity image generation powered by Google's Imagen models."
            endpoint="/v1/images/generations"
            tag="Image Gen"
          />
          <FeatureCard 
            title="DeepSeek R1" 
            description="Deep reasoning model with advanced logic capabilities."
            endpoint="model: deepseek-r1"
            tag="Reasoning"
          />
          <FeatureCard 
            title="GLM-4" 
            description="ChatGLM-4 Plus model with strong agent and tool capabilities."
            endpoint="model: glm-4"
            tag="Agentic"
          />
          <FeatureCard 
            title="Doubao Pro" 
            description="ByteDance's flagship model with excellent Chinese understanding."
            endpoint="model: doubao-pro"
            tag="General"
          />
          <FeatureCard 
            title="Kimi" 
            description="Long-context specialist for analyzing massive documents."
            endpoint="model: kimi"
            tag="Long Context"
          />
          <FeatureCard 
            title="MiniMax" 
            description="Known for natural conversation and high intelligence."
            endpoint="model: minimax"
            tag="Chat"
          />
          <FeatureCard 
            title="Jimeng" 
            description="State-of-the-art image generation capabilities."
            endpoint="/v1/images/generations"
            tag="Visual"
          />
        </div>

        {/* Documentation Section */}
        <div className="border-t border-[#6C739C]/30 pt-16" id="docs">
          <h2 className="text-3xl font-bold mb-8 text-[#F0DAD5]">Integration Guide</h2>
          
          <div className="space-y-12">
            <CodeBlock 
              title="Unified Text Generation" 
              lang="bash"
              code={`curl https://az.ai/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_TOKEN>" \\
  -d '{
    "model": "deepseek-chat", // or qwen, glm-4, doubao, etc.
    "messages": [{"role": "user", "content": "Hello world"}]
  }'`}
            />

            <CodeBlock 
              title="Image Generation" 
              lang="bash"
              code={`curl https://az.ai/v1/images/generations \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer <YOUR_COOKIE>" \\
  -d '{
    "prompt": "A futuristic city in lavender mist style",
    "n": 1,
    "size": "1024x1024"
  }'`}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-[#6C739C]/30 pt-8 text-center text-[#BABBB1] text-sm">
          <p>© 2025 az.ai Inc. All rights reserved.</p>
        </footer>

      </div>
    </main>
  );
}

function FeatureCard({ title, description, endpoint, tag, highlight = false }) {
  return (
    <div className={`p-6 rounded-xl border transition-all group h-full flex flex-col justify-between
      ${highlight 
        ? 'bg-[#6C739C]/20 border-[#D9A69F] shadow-[0_0_20px_rgba(217,166,159,0.15)]' 
        : 'bg-[#424658] border-[#6C739C]/40 hover:border-[#D9A69F]/50 hover:bg-[#6C739C]/10'
      }`}>
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-xl font-bold ${highlight ? 'text-[#D9A69F]' : 'text-[#F0DAD5]'}`}>{title}</h3>
          <span className={`px-2 py-1 rounded text-xs font-mono ${highlight ? 'bg-[#D9A69F] text-[#424658]' : 'bg-[#6C739C]/30 text-[#BABBB1]'}`}>{tag}</span>
        </div>
        <p className="text-[#BABBB1] mb-6 text-sm leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center text-xs text-[#6C739C] font-mono bg-[#303340] p-2 rounded break-all">
        <span className="mr-2 text-[#DEA785]">$</span>
        {endpoint}
      </div>
    </div>
  );
}

function CodeBlock({ title, code, lang }) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 flex items-center text-[#D9A69F]">
        {title}
      </h3>
      <div className="relative rounded-lg overflow-hidden bg-[#303340] border border-[#6C739C]/30 shadow-xl">
        <div className="flex items-center px-4 py-2 bg-[#252830] border-b border-[#6C739C]/20">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#C56B62]"></div>
            <div className="w-3 h-3 rounded-full bg-[#DEA785]"></div>
            <div className="w-3 h-3 rounded-full bg-[#D9A69F]"></div>
          </div>
          <div className="ml-4 text-xs text-[#BABBB1] font-mono uppercase">{lang}</div>
        </div>
        <div className="p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-[#F0DAD5] whitespace-pre">
            {code}
          </pre>
        </div>
      </div>
    </div>
  );
}
