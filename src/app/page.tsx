"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Zap, Image as ImageIcon, Box, Lock, Globe, Cpu, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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
    <main className="min-h-screen bg-[#424658] text-[#F0DAD5] selection:bg-[#6C739C] selection:text-white font-sans overflow-x-hidden">
      
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative z-20">
        <div className="text-2xl font-bold tracking-tighter text-[#F0DAD5]">
          az<span className="text-[#D9A69F]">.ai</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/playground" className="text-[#BABBB1] hover:text-[#D9A69F] transition-colors text-sm font-medium hidden md:block">
            Playground
          </Link>
          <Link href="https://github.com/xazalea/az.ai" target="_blank" className="text-[#BABBB1] hover:text-[#D9A69F] transition-colors text-sm font-medium hidden md:block">
            GitHub
          </Link>
          <Link href="/playground" className="px-5 py-2 bg-[#6C739C]/20 border border-[#6C739C]/50 rounded-full text-sm font-medium text-[#D9A69F] hover:bg-[#6C739C]/40 transition-all">
            Launch App
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 container mx-auto px-6 text-center z-10">
        
        {/* Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#6C739C]/10 rounded-full blur-[120px] -z-10"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#D9A69F]/30 bg-[#D9A69F]/10 text-xs font-medium text-[#D9A69F] mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#DEA785] mr-2 animate-pulse"></span>
            Unified Intelligence Layer
          </div>
          
          <h1 className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-[#F0DAD5] via-[#F0DAD5] to-[#6C739C]">
            One API for <br className="hidden md:block" />
            <span className="text-[#D9A69F]">Everything AI</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[#BABBB1] max-w-2xl mx-auto mb-12 leading-relaxed">
            Access the world's best models—Qwen, DeepSeek, GLM, Doubao, and more—through a single, high-performance, OpenAI-compatible endpoint.
          </p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Link href="/playground" className="w-full md:w-auto px-8 py-4 rounded-xl bg-[#D9A69F] text-[#424658] font-bold text-lg hover:bg-[#DEA785] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#D9A69F]/20 flex items-center justify-center gap-2">
              Start Building <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full md:w-auto px-8 py-4 rounded-xl border border-[#6C739C]/50 text-[#F0DAD5] font-medium text-lg hover:bg-[#6C739C]/10 transition-all backdrop-blur-sm">
              View Documentation
            </button>
          </div>
        </motion.div>

        {/* Code Snippet */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-24 mx-auto max-w-3xl text-left rounded-xl overflow-hidden border border-[#6C739C]/30 bg-[#303340]/80 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex items-center px-4 py-3 bg-[#252830] border-b border-[#6C739C]/20">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#C56B62]"></div>
              <div className="w-3 h-3 rounded-full bg-[#DEA785]"></div>
              <div className="w-3 h-3 rounded-full bg-[#D9A69F]"></div>
            </div>
            <div className="ml-4 text-xs text-[#BABBB1] font-mono">curl-request.sh</div>
          </div>
          <div className="p-6 overflow-x-auto">
            <pre className="text-sm font-mono text-[#F0DAD5] whitespace-pre leading-relaxed">
              <span className="text-[#D9A69F]">curl</span> https://az.ai/v1/chat/completions \<br/>
              {"  "}-H <span className="text-[#DEA785]">"Content-Type: application/json"</span> \<br/>
              {"  "}-H <span className="text-[#DEA785]">"Authorization: Bearer az-..."</span> \<br/>
              {"  "}-d <span className="text-[#6C739C]">{'{'}</span><br/>
              {"    "}<span className="text-[#DEA785]">"model"</span>: <span className="text-[#D9A69F]">"deepseek-chat"</span>,<br/>
              {"    "}<span className="text-[#DEA785]">"messages"</span>: [<span className="text-[#6C739C]">{'{'}</span><span className="text-[#DEA785]">"role"</span>: <span className="text-[#D9A69F]">"user"</span>, <span className="text-[#DEA785]">"content"</span>: <span className="text-[#D9A69F]">"Hello!"</span><span className="text-[#6C739C]">{'}'}</span>]<br/>
              {"  "}<span className="text-[#6C739C]">{'}'}</span>
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#303340]/30 border-y border-[#6C739C]/10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F0DAD5]">Everything you need to build</h2>
            <p className="text-[#BABBB1] max-w-2xl mx-auto">Enterprise-grade infrastructure for the next generation of AI applications.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Zap className="w-6 h-6 text-[#DEA785]" />}
              title="Ultra Low Latency"
              description="Optimized edge routing ensures your requests hit the fastest available provider instantly."
            />
            <FeatureCard 
              icon={<Box className="w-6 h-6 text-[#D9A69F]" />}
              title="Unified Interface"
              description="Switch between Qwen, DeepSeek, and others by changing just one line of code."
            />
            <FeatureCard 
              icon={<Lock className="w-6 h-6 text-[#C56B62]" />}
              title="Enterprise Security"
              description="Bank-grade encryption and privacy-first data handling for all your interactions."
            />
            <FeatureCard 
              icon={<Image className="w-6 h-6 text-[#6C739C]" />}
              title="Image Generation"
              description="Create stunning visuals with ImageFX and Jimeng models via standard APIs."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6 text-[#F0DAD5]" />}
              title="Global Edge Network"
              description="Deployed on Vercel's global edge network for maximum reliability and speed."
            />
            <FeatureCard 
              icon={<Code className="w-6 h-6 text-[#BABBB1]" />}
              title="Developer First"
              description="Comprehensive documentation, SDKs, and a community of builders."
            />
          </div>
        </div>
      </section>

      {/* Supported Models */}
      <section className="py-24 container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-[#F0DAD5]">Powering the best models</h2>
          <p className="text-[#BABBB1] max-w-2xl mx-auto mb-12">
            Access 50+ models from leading AI providers through a single, unified API.
          </p>
          
          {/* Model Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 text-left">
            {/* OpenAI */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">OpenAI</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['GPT-5.1 High', 'GPT-5 Chat', 'GPT-4', 'GPT-3.5 Turbo', 'GPT-OSS 120B', 'ChatGPT'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Anthropic */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">Anthropic</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Code'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Google */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">Google</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['Gemini 3 Pro', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Imagen 3', 'Veo 3'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* DeepSeek */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">DeepSeek</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['DeepSeek V3', 'DeepSeek R1', 'DeepSeek V3.1', 'DeepSeek Free'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Chinese Providers */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">Chinese Providers</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['Qwen 2.5', 'GLM-4', 'Doubao Pro', 'Kimi', 'MiniMax', 'Step-1', 'Jimeng'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Providers */}
            <div className="p-6 rounded-xl bg-[#6C739C]/10 border border-[#6C739C]/20">
              <h3 className="text-lg font-bold text-[#D9A69F] mb-3">More Providers</h3>
              <div className="space-y-2 text-sm text-[#BABBB1]">
                {['Mistral Large', 'Grok-4', 'Llama 4 Scout', 'Llama 4 Maverick', 'Groq LPU™', 'BlackBox', 'Ollama', 'Pollinations'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DEA785]" />
                    {model}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* v2 API Notice */}
          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-[#6C739C]/20 to-[#D9A69F]/10 border border-[#6C739C]/30 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <Zap className="w-6 h-6 text-[#DEA785] flex-shrink-0 mt-1" />
              <div className="text-left">
                <h3 className="text-lg font-bold text-[#F0DAD5] mb-2">⚡ v2 API - Optimized for Speed</h3>
                <p className="text-sm text-[#BABBB1] mb-3">
                  Use <code className="px-2 py-1 rounded bg-[#424658] text-[#D9A69F]">/v2/chat/completions</code> for ultra-fast models. 
                  Perfect for small projects that need low latency!
                </p>
                <p className="text-xs text-[#BABBB1]/70">
                  Routes to fastest models: Groq, Qwen, DeepSeek, Gemini Flash, GPT-3.5, and more.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#6C739C]/20 to-[#424658] border-t border-[#6C739C]/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6 text-[#F0DAD5]">Ready to get started?</h2>
          <p className="text-[#BABBB1] mb-10 max-w-xl mx-auto">Join thousands of developers building the future of AI with az.ai.</p>
          <Link href="/playground" className="px-10 py-4 rounded-xl bg-[#D9A69F] text-[#424658] font-bold text-lg hover:bg-[#DEA785] transition-all shadow-lg shadow-[#D9A69F]/20 inline-flex items-center gap-2">
            Open Playground <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#6C739C]/10 bg-[#303340]/50">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tighter text-[#BABBB1]">
            az<span className="text-[#D9A69F]">.ai</span>
          </div>
          <div className="text-sm text-[#6C739C]">
            © 2025 az.ai Inc. All rights reserved.
          </div>
      </div>
      </footer>

    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="p-8 rounded-2xl border border-[#6C739C]/20 bg-[#424658]/50 hover:bg-[#6C739C]/10 transition-all hover:border-[#D9A69F]/30 group">
      <div className="mb-4 p-3 rounded-lg bg-[#303340] w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-[#F0DAD5] group-hover:text-[#D9A69F] transition-colors">{title}</h3>
      <p className="text-[#BABBB1] leading-relaxed text-sm">{description}</p>
    </div>
  );
}

// Helper for Image icon
function Image({ className }: { className?: string }) {
    return <ImageIcon className={className} />;
}
