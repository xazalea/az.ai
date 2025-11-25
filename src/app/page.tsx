"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Zap, Image as ImageIcon, Box, Lock, Globe, Cpu, CheckCircle2, Brain, Database, Sparkles, Stars, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a] text-white font-sans overflow-x-hidden relative">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#4a9eff]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#6bb6ff]/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>
      
      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass border-b border-[#3a3a3a]/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tight"
          >
            <span className="gradient-text">az</span><span className="text-white">.ai</span>
          </motion.div>
          <div className="flex items-center gap-6">
            <Link href="/playground" className="text-[#888888] hover:text-white transition-colors text-sm font-medium hidden md:block relative group">
              Playground
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4a9eff] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link href="https://github.com/xazalea/az.ai" target="_blank" className="text-[#888888] hover:text-white transition-colors text-sm font-medium hidden md:block relative group">
              GitHub
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4a9eff] group-hover:w-full transition-all duration-300"></span>
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/playground" className="px-5 py-2 bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] rounded-lg text-sm font-semibold text-white shadow-lg glow-hover transition-all">
                Launch App <Rocket className="w-4 h-4 inline ml-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-48 container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-4 py-2 rounded-full glass border border-[#4a9eff]/30 text-xs font-semibold text-[#4a9eff] mb-8 glow"
          >
            <Stars className="w-3 h-3 mr-2" />
            Unified AI Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-white">One API for</span>
            <br className="hidden md:block" />
            <span className="gradient-text">Everything AI</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-[#888888] max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Access <span className="text-[#4a9eff] font-semibold">50+ models</span> through a single OpenAI-compatible endpoint with <span className="text-[#4a9eff] font-semibold">reasoning</span> and <span className="text-[#4a9eff] font-semibold">memory</span>.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/playground" className="group w-full md:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] text-white font-semibold text-lg shadow-2xl glow-hover flex items-center justify-center gap-2 relative overflow-hidden">
                <span className="relative z-10">Start Building</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6bb6ff] to-[#4a9eff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button className="w-full md:w-auto px-8 py-4 rounded-xl glass border border-[#3a3a3a] text-white font-semibold text-lg hover:border-[#4a9eff]/50 transition-all">
                Documentation
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Code Snippet */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-24 mx-auto max-w-4xl text-left rounded-2xl overflow-hidden glass border border-[#3a3a3a]/50 shadow-2xl glow-hover"
        >
          <div className="flex items-center px-6 py-4 bg-[#1a1a1a]/50 border-b border-[#3a3a3a]/50">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div className="ml-4 text-xs text-[#888888] font-mono">terminal</div>
          </div>
          <div className="p-8 overflow-x-auto bg-gradient-to-br from-[#0f0f0f] to-[#1a1a1a]">
            <pre className="text-sm md:text-base font-mono text-white whitespace-pre leading-relaxed">
              <span className="text-[#4a9eff]">curl</span> https://az.ai/v1/chat/completions \<br/>
              {"  "}-H <span className="text-[#ffd700]">"Content-Type: application/json"</span> \<br/>
              {"  "}-d <span className="text-white">{'{'}</span><br/>
              {"    "}<span className="text-[#ffd700]">"model"</span>: <span className="text-[#4a9eff]">"qwen"</span>,<br/>
              {"    "}<span className="text-[#ffd700]">"messages"</span>: [<span className="text-white">{'{'}</span><span className="text-[#ffd700]">"role"</span>: <span className="text-[#4a9eff]">"user"</span>, <span className="text-[#ffd700]">"content"</span>: <span className="text-[#6bb6ff]">"Hello!"</span><span className="text-white">{'}'}</span>]<br/>
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
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
      <section className="py-32 container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">50+ Models</span>
          </h2>
          <p className="text-xl text-[#888888] max-w-2xl mx-auto">
            Access leading AI providers through a single API.
          </p>
          
          {/* Model Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 text-left">
            {/* OpenAI */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group p-6 rounded-xl glass border border-[#3a3a3a]/50 hover:border-[#4a9eff]/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-[#4a9eff] transition-colors">OpenAI</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['GPT-5.1 High', 'GPT-5 Chat', 'GPT-4', 'GPT-3.5 Turbo', 'GPT-OSS 120B', 'ChatGPT'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Anthropic */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group p-6 rounded-xl glass border border-[#3a3a3a]/50 hover:border-[#4a9eff]/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-[#4a9eff] transition-colors">Anthropic</h3>
              <div className="space-y-2 text-sm text-[#888888]">
                {['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Code'].map((model) => (
                  <div key={model} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4a9eff]" />
                    {model}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Google */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group p-6 rounded-xl glass border border-[#3a3a3a]/50 hover:border-[#4a9eff]/50 transition-all"
            >
              <h3 className="text-lg font-bold text-white mb-4 group-hover:text-[#4a9eff] transition-colors">Google</h3>
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
      <section className="py-32 relative">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-white">Get </span>
              <span className="gradient-text">Started</span>
            </h2>
            <p className="text-xl text-[#888888] mb-12 max-w-xl mx-auto">Start building with az.ai today.</p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/playground" className="group px-12 py-5 rounded-xl bg-gradient-to-r from-[#4a9eff] to-[#6bb6ff] text-white font-bold text-lg shadow-2xl glow-hover inline-flex items-center gap-2 relative overflow-hidden">
                <span className="relative z-10">Open Playground</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6bb6ff] to-[#4a9eff] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#3a3a3a]/50 glass">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold">
            <span className="gradient-text">az</span><span className="text-white">.ai</span>
          </div>
          <div className="text-sm text-[#888888]">
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
      whileHover={{ y: -5, scale: 1.02 }}
      className="group p-8 rounded-2xl glass border border-[#3a3a3a]/50 hover:border-[#4a9eff]/50 transition-all duration-300 glow-hover relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#4a9eff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <div className="relative z-10 mb-6 p-4 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#4a9eff] transition-colors">{title}</h3>
      <p className="text-[#888888] leading-relaxed text-sm group-hover:text-[#aaaaaa] transition-colors">{description}</p>
    </motion.div>
  );
}

// Helper for Image icon
function Image({ className }: { className?: string }) {
    return <ImageIcon className={className} />;
}
