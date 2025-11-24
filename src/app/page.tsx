"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Zap, Image as ImageIcon, Box, Lock, Globe, Cpu, CheckCircle2, Brain, Database, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Professional Matte Color Palette
// #1a1a1a - Near Black (Background)
// #2a2a2a - Dark Grey (Cards)
// #3a3a3a - Medium Grey (Borders)
// #ffffff - White (Text)
// #888888 - Light Grey (Secondary Text)
// #4a9eff - Blue (Accents)

export default function Home() {
  return (
    <main className="min-h-screen bg-[#1a1a1a] text-white font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center border-b border-[#3a3a3a]">
        <div className="text-2xl font-semibold text-white">
          az<span className="text-[#4a9eff]">.ai</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/playground" className="text-[#888888] hover:text-white transition-colors text-sm font-medium hidden md:block">
            Playground
          </Link>
          <Link href="https://github.com/xazalea/az.ai" target="_blank" className="text-[#888888] hover:text-white transition-colors text-sm font-medium hidden md:block">
            GitHub
          </Link>
          <Link href="/playground" className="px-5 py-2 bg-[#2a2a2a] border border-[#3a3a3a] rounded text-sm font-medium text-white hover:bg-[#3a3a3a] transition-colors">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 md:pt-32 md:pb-48 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded border border-[#3a3a3a] bg-[#2a2a2a] text-xs font-medium text-[#888888] mb-8">
            Unified AI Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-white">
            One API for <br className="hidden md:block" />
            <span className="text-[#4a9eff]">Everything AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#888888] max-w-2xl mx-auto mb-12 leading-relaxed">
            Access 50+ models through a single OpenAI-compatible endpoint with reasoning and memory.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/playground" className="w-full md:w-auto px-8 py-4 rounded bg-[#4a9eff] text-white font-medium text-lg hover:bg-[#3a8eef] transition-colors flex items-center justify-center gap-2">
              Start Building <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full md:w-auto px-8 py-4 rounded border border-[#3a3a3a] text-white font-medium text-lg hover:bg-[#2a2a2a] transition-colors">
              Documentation
            </button>
          </div>
        </motion.div>

        {/* Code Snippet */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-24 mx-auto max-w-3xl text-left rounded overflow-hidden border border-[#3a3a3a] bg-[#2a2a2a]"
        >
          <div className="flex items-center px-4 py-3 bg-[#1a1a1a] border-b border-[#3a3a3a]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
              <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
              <div className="w-3 h-3 rounded-full bg-[#3a3a3a]"></div>
            </div>
            <div className="ml-4 text-xs text-[#888888] font-mono">curl</div>
          </div>
          <div className="p-6 overflow-x-auto bg-[#1a1a1a]">
            <pre className="text-sm font-mono text-white whitespace-pre leading-relaxed">
              <span className="text-[#4a9eff]">curl</span> https://az.ai/v1/chat/completions \<br/>
              {"  "}-H <span className="text-[#888888]">"Content-Type: application/json"</span> \<br/>
              {"  "}-d <span className="text-white">{'{'}</span><br/>
              {"    "}<span className="text-[#888888]">"model"</span>: <span className="text-[#4a9eff]">"qwen"</span>,<br/>
              {"    "}<span className="text-[#888888]">"messages"</span>: [<span className="text-white">{'{'}</span><span className="text-[#888888]">"role"</span>: <span className="text-[#4a9eff]">"user"</span>, <span className="text-[#888888]">"content"</span>: <span className="text-[#4a9eff]">"Hello!"</span><span className="text-white">{'}'}</span>]<br/>
              {"  "}<span className="text-white">{'}'}</span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-y border-[#3a3a3a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Everything you need</h2>
            <p className="text-[#888888] max-w-2xl mx-auto">Unified AI infrastructure for modern applications.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Zap className="w-5 h-5 text-[#4a9eff]" />}
              title="Low Latency"
              description="Optimized routing to fastest available providers."
            />
            <FeatureCard 
              icon={<Box className="w-5 h-5 text-[#4a9eff]" />}
              title="Unified API"
              description="Switch models by changing one parameter."
            />
            <FeatureCard 
              icon={<Lock className="w-5 h-5 text-[#4a9eff]" />}
              title="Secure"
              description="Privacy-first data handling."
            />
            <FeatureCard 
              icon={<Image className="w-5 h-5 text-[#4a9eff]" />}
              title="Image & Video"
              description="Generate images and videos via API."
            />
            <FeatureCard 
              icon={<Brain className="w-5 h-5 text-[#4a9eff]" />}
              title="Reasoning"
              description="Advanced reasoning engine included."
            />
            <FeatureCard 
              icon={<Database className="w-5 h-5 text-[#4a9eff]" />}
              title="Memory"
              description="Session-based memory system."
            />
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-24 border-y border-[#3a3a3a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Advanced Features</h2>
            <p className="text-[#888888] max-w-2xl mx-auto">
              Reasoning and memory systems included.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded bg-[#1a1a1a]">
                  <Brain className="w-5 h-5 text-[#4a9eff]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Reasoning</h3>
                  <p className="text-xs text-[#888888]">Always enabled</p>
                </div>
              </div>
              <p className="text-[#888888] text-sm">
                Advanced reasoning engine enhances all responses with multi-domain capabilities.
              </p>
            </div>

            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded bg-[#1a1a1a]">
                  <Database className="w-5 h-5 text-[#4a9eff]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Memory</h3>
                  <p className="text-xs text-[#888888]">Auto-enabled</p>
                </div>
              </div>
              <p className="text-[#888888] text-sm">
                Session-based memory for context-aware conversations across models.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Models */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">50+ Models</h2>
          <p className="text-[#888888] max-w-2xl mx-auto">
            Access leading AI providers through a single API.
          </p>
          
          {/* Model Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 text-left">
            {/* OpenAI */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">OpenAI</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['GPT-5.1 High', 'GPT-5 Chat', 'GPT-4', 'GPT-3.5 Turbo', 'GPT-OSS 120B', 'ChatGPT'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Anthropic */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">Anthropic</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Code'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Google */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">Google</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['Gemini 3 Pro', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Imagen 3', 'Veo 3'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* DeepSeek */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">DeepSeek</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['DeepSeek V3', 'DeepSeek R1', 'DeepSeek V3.1', 'DeepSeek Free'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Chinese Providers */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">Chinese</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['Qwen 2.5', 'GLM-4', 'Doubao Pro', 'Kimi', 'MiniMax', 'Step-1', 'Jimeng'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Providers */}
            <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-3">More</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['Mistral Large', 'Grok-4', 'Llama 4', 'Groq LPU™', 'Pollinations'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-[#3a3a3a]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-semibold mb-6 text-white">Get Started</h2>
          <p className="text-[#888888] mb-10 max-w-xl mx-auto">Start building with az.ai today.</p>
          <Link href="/playground" className="px-10 py-4 rounded bg-[#4a9eff] text-white font-medium text-lg hover:bg-[#3a8eef] transition-colors inline-flex items-center gap-2">
            Open Playground <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#3a3a3a]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-semibold text-white">
            az<span className="text-[#4a9eff]">.ai</span>
          </div>
          <div className="text-sm text-[#888888]">
            © 2025 az.ai
          </div>
      </div>
      </footer>

    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-6 rounded border border-[#3a3a3a] bg-[#2a2a2a] hover:border-[#4a9eff] transition-colors">
      <div className="mb-4 p-2 rounded bg-[#1a1a1a] w-fit">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
      <p className="text-[#888888] leading-relaxed text-sm">{description}</p>
    </div>
  );
}

// Helper for Image icon
function Image({ className }: { className?: string }) {
    return <ImageIcon className={className} />;
}
