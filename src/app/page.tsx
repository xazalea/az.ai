"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, Database, Sparkles, Stars, Rocket, CheckCircle2, TrendingUp, Shield, Globe2, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden relative">
      {/* Subtle animated background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#4a9eff]/5 rounded-full blur-[140px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#6bb6ff]/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">az</span><span className="text-white">.ai</span>
          </motion.div>
          <div className="flex items-center gap-8">
            <Link href="/playground" className="text-[#999] hover:text-white transition-colors text-sm font-medium hidden md:block">
              Playground
            </Link>
            <Link href="https://github.com/xazalea/az.ai" target="_blank" className="text-[#999] hover:text-white transition-colors text-sm font-medium hidden md:block">
              GitHub
            </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/playground" className="px-6 py-2.5 bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] rounded-full text-sm font-semibold text-white shadow-lg shadow-[#4a9eff]/20 hover:shadow-[#4a9eff]/40 transition-all">
                Launch App <Rocket className="w-4 h-4 inline ml-1.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-40 md:pt-40 md:pb-56 container mx-auto px-6 text-center max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#4a9eff] mb-8 backdrop-blur-sm"
          >
            <Stars className="w-3.5 h-3.5 mr-2" />
            Unified AI Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-9xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            <span className="text-white">The Unified</span>
            <br />
            <span className="bg-gradient-to-r from-[#4a9eff] via-[#6bb6ff] to-[#4a9eff] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_8s_ease_infinite]">Interface For AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-[#999] max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Better prices, better uptime, no subscription. Access <span className="text-white font-semibold">50+ models</span> through a single OpenAI-compatible endpoint.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/playground" className="group px-10 py-4 rounded-full bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] text-white font-semibold text-lg shadow-2xl shadow-[#4a9eff]/30 hover:shadow-[#4a9eff]/50 transition-all flex items-center justify-center gap-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button className="px-10 py-4 rounded-full bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                View Docs
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-24 grid grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">50+</div>
            <div className="text-sm text-[#999]">Active Models</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">300+</div>
            <div className="text-sm text-[#999]">Providers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">∞</div>
            <div className="text-sm text-[#999]">Free Tier</div>
          </div>
        </motion.div>
      </section>

      {/* Code Snippet */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="container mx-auto px-6 max-w-4xl mb-32"
      >
        <div className="rounded-3xl overflow-hidden bg-[#111] border border-white/10 shadow-2xl">
          <div className="flex items-center px-6 py-4 bg-[#0a0a0a] border-b border-white/5">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-4 text-xs text-[#666] font-mono">terminal</div>
          </div>
          <div className="p-8 bg-gradient-to-br from-[#0f0f0f] to-[#111]">
            <pre className="text-sm md:text-base font-mono text-white whitespace-pre leading-relaxed overflow-x-auto">
              <span className="text-[#4a9eff]">curl</span> https://az.ai/v1/chat/completions \<br/>
              {"  "}-H <span className="text-[#ffd700]">"Content-Type: application/json"</span> \<br/>
              {"  "}-d <span className="text-white">{'{'}</span><br/>
              {"    "}<span className="text-[#ffd700]">"model"</span>: <span className="text-[#4a9eff]">"qwen"</span>,<br/>
              {"    "}<span className="text-[#ffd700]">"messages"</span>: [<span className="text-white">{'{'}</span><span className="text-[#ffd700]">"role"</span>: <span className="text-[#4a9eff]">"user"</span>, <span className="text-[#ffd700]">"content"</span>: <span className="text-[#6bb6ff]">"Hello!"</span><span className="text-white">{'}'}</span>]<br/>
              {"  "}<span className="text-white">{'}'}</span>
            </pre>
          </div>
        </div>
      </motion.div>

      {/* Features Grid */}
      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            One API for <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">Any Model</span>
          </h2>
          <p className="text-xl text-[#999] max-w-2xl mx-auto">
            Access all major models through a single, unified interface. OpenAI SDK works out of the box.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-[#4a9eff]" />}
            title="Higher Availability"
            description="Reliable AI models via our distributed infrastructure. Fall back to other providers when one goes down."
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-[#4a9eff]" />}
            title="Price & Performance"
            description="Keep costs in check without sacrificing speed. OpenRouter runs at the edge, adding just ~15ms latency."
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-[#4a9eff]" />}
            title="Custom Data Policies"
            description="Protect your organization with fine-grained data policies. Ensure prompts only go to trusted models."
          />
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            Powered by <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">Advanced AI</span>
          </h2>
          <p className="text-xl text-[#999] max-w-2xl mx-auto">
            Beyond just API access—az.ai includes cutting-edge reasoning and memory systems.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-[#4a9eff]/30 transition-all backdrop-blur-sm hover:bg-white/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-[#4a9eff]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#4a9eff] transition-colors">OpenReason</h3>
                <p className="text-sm text-[#999]">Always enabled</p>
              </div>
            </div>
            <p className="text-[#999] leading-relaxed group-hover:text-white transition-colors">
              Advanced reasoning engine enhances all responses with multi-domain capabilities. Includes specialized solvers for Math, Logic, and Ethics.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-[#4a9eff]/30 transition-all backdrop-blur-sm hover:bg-white/10"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7 text-[#4a9eff]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-[#4a9eff] transition-colors">OpenMemory</h3>
                <p className="text-sm text-[#999]">Auto-enabled</p>
              </div>
            </div>
            <p className="text-[#999] leading-relaxed group-hover:text-white transition-colors">
              Session-based memory for context-aware conversations across models. Remember user preferences and conversation history.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Supported Models */}
      <section className="py-32 container mx-auto px-6 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">50+ Models</span>
          </h2>
          <p className="text-xl text-[#999] max-w-2xl mx-auto">
            Access leading AI providers through a single API.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'OpenAI', models: ['GPT-5.1 High', 'GPT-5 Chat', 'GPT-4', 'GPT-3.5 Turbo', 'GPT-OSS 120B', 'ChatGPT'] },
            { name: 'Anthropic', models: ['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Code'] },
            { name: 'Google', models: ['Gemini 3 Pro', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Imagen 3', 'Veo 3'] },
            { name: 'DeepSeek', models: ['DeepSeek V3', 'DeepSeek R1', 'DeepSeek V3.1', 'DeepSeek Free'] },
            { name: 'Chinese Providers', models: ['Qwen 2.5', 'GLM-4', 'Doubao Pro', 'Kimi', 'MiniMax', 'Step-1', 'Jimeng'] },
            { name: 'More Providers', models: ['Mistral Large', 'Grok-4', 'Llama 4', 'Groq LPU™', 'Pollinations'] },
          ].map((provider, idx) => (
            <motion.div 
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-[#4a9eff]/30 transition-all backdrop-blur-sm"
            >
              <h3 className="text-xl font-bold text-white mb-6 group-hover:text-[#4a9eff] transition-colors">{provider.name}</h3>
              <div className="space-y-3">
                {provider.models.map((model) => (
                  <div key={model} className="flex items-center gap-3 text-sm text-[#999] group-hover:text-white transition-colors">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff] flex-shrink-0" />
                    {model}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 container mx-auto px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-8 text-white">
            Ready to <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">get started?</span>
          </h2>
          <p className="text-xl text-[#999] mb-12 max-w-xl mx-auto">Start building with az.ai today.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/playground" className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] text-white font-bold text-lg shadow-2xl shadow-[#4a9eff]/30 hover:shadow-[#4a9eff]/50 transition-all">
              Open Playground
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/5 bg-[#0a0a0a]">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold">
            <span className="bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] bg-clip-text text-transparent">az</span><span className="text-white">.ai</span>
          </div>
          <div className="text-sm text-[#666]">
            © 2025 az.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="group p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-[#4a9eff]/30 transition-all backdrop-blur-sm hover:bg-white/10"
    >
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-[#4a9eff] transition-colors">{title}</h3>
      <p className="text-[#999] leading-relaxed group-hover:text-white transition-colors">{description}</p>
    </motion.div>
  );
}
