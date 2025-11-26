"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, Database, CheckCircle2, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  useEffect(() => {
    // Add light mode class to body for homepage
    document.body.classList.add('light-mode');
    
    // Initialize liquidGL after scripts are loaded
    const initLiquidGL = () => {
      if (typeof window !== 'undefined' && (window as any).liquidGL && typeof (window as any).liquidGL === 'function') {
        try {
          (window as any).liquidGL({
            snapshot: 'body',
            target: '.liquid-glass',
            resolution: 2.0,
            refraction: 0.03,
            bevelDepth: 0.08,
            bevelWidth: 0.15,
            frost: 1,
            shadow: true,
            specular: true,
            reveal: 'fade',
            tilt: false,
            magnify: 1,
            on: {
              init: () => {
                console.log('liquidGL initialized');
              }
            }
          });
        } catch (error) {
          console.warn('liquidGL initialization failed:', error);
        }
      }
    };

    // Wait for scripts to load
    const checkScripts = setInterval(() => {
      if (typeof window !== 'undefined' && 
          (window as any).html2canvas && 
          (window as any).liquidGL) {
        clearInterval(checkScripts);
        // Wait a bit for DOM to be ready
        setTimeout(initLiquidGL, 500);
      }
    }, 100);

    // Cleanup after 10 seconds if scripts don't load
    setTimeout(() => clearInterval(checkScripts), 10000);

    return () => {
      document.body.classList.remove('light-mode');
      clearInterval(checkScripts);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#faf9f7] text-[#2d2d2d] font-sans overflow-x-hidden scroll-smooth">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-[#faf9f7] border-b border-[#e8e5e0]">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Image 
              src="/az.png" 
              alt="az.ai logo" 
              width={40} 
              height={40}
              className="rounded-lg"
              priority
              loading="eager"
            />
            <span className="text-2xl font-bold text-[#2d2d2d]">az.ai</span>
          </motion.div>
              <div className="flex items-center gap-8">
                <Link href="/models" className="text-[#6b6b6b] hover:text-[#2d2d2d] transition-colors text-sm font-medium hidden md:block focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2 rounded">
                  Models
                </Link>
                <Link href="/playground" className="text-[#6b6b6b] hover:text-[#2d2d2d] transition-colors text-sm font-medium hidden md:block focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2 rounded">
                  Playground
                </Link>
                <Link href="https://github.com/xazalea/az.ai" target="_blank" rel="noopener noreferrer" className="text-[#6b6b6b] hover:text-[#2d2d2d] transition-colors text-sm font-medium hidden md:block focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2 rounded">
                  GitHub
                </Link>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/playground" className="px-6 py-2.5 bg-[#ffb3d1] text-[#2d2d2d] rounded-full text-sm font-semibold hover:bg-[#ffa0c7] transition-colors focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2">
                Launch App
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
            className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#ffe0ed] border border-[#ffb3d1] text-xs font-semibold text-[#d94d7a] mb-8"
          >
            Unified AI Platform
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-7xl md:text-9xl font-extrabold tracking-tight mb-8 leading-[1.1]"
          >
            <span className="text-[#2d2d2d]">The Unified</span>
            <br />
            <span className="text-[#d94d7a]">Interface For AI</span>
          </motion.h1>
          
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl md:text-2xl text-[#6b6b6b] max-w-3xl mx-auto mb-12 leading-relaxed text-balance"
              >
                Better prices, better uptime, no subscription. Access <Link href="/models" className="text-[#2d2d2d] font-semibold hover:text-[#d94d7a] transition-colors underline focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2 rounded">1300+ models</Link> through a single OpenAI-compatible endpoint.
              </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/playground" className="group px-10 py-4 rounded-full bg-[#ffb3d1] text-[#2d2d2d] font-semibold text-lg hover:bg-[#ffa0c7] transition-colors flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/models" className="px-10 py-4 rounded-full bg-[#e8e5e0] border border-[#d4c5b8] text-[#2d2d2d] font-semibold text-lg hover:bg-[#ddd8d0] transition-colors inline-block focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2">
                Browse Models
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-24 grid grid-cols-3 gap-8 max-w-4xl mx-auto"
          role="region"
          aria-label="Platform statistics"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-[#d94d7a] mb-2" aria-label="1300 plus">1300+</div>
            <div className="text-sm text-[#6b6b6b]">Active Models</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#d94d7a] mb-2" aria-label="50 plus">50+</div>
            <div className="text-sm text-[#6b6b6b]">Providers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-[#d94d7a] mb-2" aria-label="Unlimited">∞</div>
            <div className="text-sm text-[#6b6b6b]">Free Tier</div>
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
        <div className="liquid-glass rounded-3xl overflow-hidden bg-[#ffffff] border-2 border-[#e8e5e0] relative z-10">
          <div className="flex items-center px-6 py-4 bg-[#f5f3f0] border-b border-[#e8e5e0]">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-[#ff9faa]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffd6a5]"></div>
              <div className="w-3 h-3 rounded-full bg-[#caffbf]"></div>
            </div>
            <div className="ml-4 text-xs text-[#6b6b6b] font-mono">terminal</div>
          </div>
          <div className="p-8 bg-[#ffffff] relative z-20">
            <pre className="text-sm md:text-base font-mono text-[#2d2d2d] whitespace-pre leading-relaxed overflow-x-auto" role="code" aria-label="Example API request">
              <code>
                <span className="text-[#d94d7a]">curl</span> https://az.ai/v1/chat/completions \<br/>
                {"  "}-H <span className="text-[#8b7d6b]">"Content-Type: application/json"</span> \<br/>
                {"  "}-d <span className="text-[#2d2d2d]">{'{'}</span><br/>
                {"    "}<span className="text-[#8b7d6b]">"model"</span>: <span className="text-[#d94d7a]">"qwen"</span>,<br/>
                {"    "}<span className="text-[#8b7d6b]">"messages"</span>: [<span className="text-[#2d2d2d]">{'{'}</span><span className="text-[#8b7d6b]">"role"</span>: <span className="text-[#d94d7a]">"user"</span>, <span className="text-[#8b7d6b]">"content"</span>: <span className="text-[#ff9faa]">"Hello!"</span><span className="text-[#2d2d2d]">{'}'}</span>]<br/>
                {"  "}<span className="text-[#2d2d2d]">{'}'}</span>
              </code>
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
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#2d2d2d] text-balance">
            One API for <span className="text-[#d94d7a]">Any Model</span>
          </h2>
          <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto text-balance">
            Access all major models through a single, unified interface. OpenAI SDK works out of the box.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-[#d94d7a]" />}
            title="Higher Availability"
            description="Reliable AI models via our distributed infrastructure. Fall back to other providers when one goes down."
            color="pink"
          />
          <FeatureCard 
            icon={<TrendingUp className="w-6 h-6 text-[#a8d5ba]" />}
            title="Price & Performance"
            description="Keep costs in check without sacrificing speed. Optimized routing adds just ~15ms latency."
            color="green"
          />
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-[#b8c5ff]" />}
            title="Custom Data Policies"
            description="Protect your organization with fine-grained data policies. Ensure prompts only go to trusted models."
            color="blue"
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
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-[#2d2d2d] text-balance">
            Powered by <span className="text-[#d94d7a]">Advanced AI</span>
          </h2>
          <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto text-balance">
            Beyond just API access—az.ai includes cutting-edge reasoning and memory systems.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="liquid-glass group p-10 rounded-3xl bg-[#ffe0ed] border-2 border-[#ffb3d1] hover:border-[#ff9faa] transition-colors relative z-10"
          >
            <div className="flex items-center gap-4 mb-6 relative z-20">
              <div className="p-4 rounded-2xl bg-[#ffb3d1]">
                <Brain className="w-7 h-7 text-[#d94d7a]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2d2d2d]">OpenReason</h3>
                <p className="text-sm text-[#6b6b6b]">Always enabled</p>
              </div>
            </div>
            <p className="text-[#6b6b6b] leading-relaxed relative z-20">
              Advanced reasoning engine enhances all responses with multi-domain capabilities. Includes specialized solvers for Math, Logic, and Ethics.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="liquid-glass group p-10 rounded-3xl bg-[#e0f5e8] border-2 border-[#a8d5ba] hover:border-[#95c9a8] transition-colors relative z-10"
          >
            <div className="flex items-center gap-4 mb-6 relative z-20">
              <div className="p-4 rounded-2xl bg-[#a8d5ba]">
                <Database className="w-7 h-7 text-[#5a9d6f]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2d2d2d]">OpenMemory</h3>
                <p className="text-sm text-[#6b6b6b]">Auto-enabled</p>
              </div>
            </div>
            <p className="text-[#6b6b6b] leading-relaxed relative z-20">
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
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            <span className="text-[#d94d7a]">1300+ Models</span>
          </h2>
          <p className="text-xl text-[#6b6b6b] max-w-2xl mx-auto text-balance">
            Access leading AI providers through a single API. From GPT-5 to Claude Opus, Gemini to DeepSeek, and everything in between.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'OpenAI', models: ['GPT-5.1 High', 'GPT-5 Chat', 'GPT-4', 'GPT-3.5 Turbo', 'GPT-OSS 120B', 'ChatGPT'], color: 'pink' },
            { name: 'Anthropic', models: ['Claude Opus 4.5', 'Claude Sonnet 4.5', 'Claude Code'], color: 'purple' },
            { name: 'Google', models: ['Gemini 3 Pro', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash', 'Imagen 3', 'Veo 3'], color: 'blue' },
            { name: 'DeepSeek', models: ['DeepSeek V3', 'DeepSeek R1', 'DeepSeek V3.1', 'DeepSeek Free'], color: 'green' },
            { name: 'Chinese Providers', models: ['Qwen 2.5', 'GLM-4', 'Doubao Pro', 'Kimi', 'MiniMax', 'Step-1', 'Jimeng'], color: 'orange' },
            { name: 'More Providers', models: ['Mistral Large', 'Grok-4', 'Llama 4', 'Groq LPU™', 'Pollinations'], color: 'yellow' },
          ].map((provider, idx) => (
            <motion.div 
              key={provider.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className={`group p-8 rounded-3xl border-2 transition-colors ${
                provider.color === 'pink' ? 'bg-[#ffe0ed] border-[#ffb3d1] hover:border-[#ff9faa]' :
                provider.color === 'purple' ? 'bg-[#f0e8ff] border-[#d4b8ff] hover:border-[#c5a0ff]' :
                provider.color === 'blue' ? 'bg-[#e0f0ff] border-[#b8d5ff] hover:border-[#a0c5ff]' :
                provider.color === 'green' ? 'bg-[#e0f5e8] border-[#a8d5ba] hover:border-[#95c9a8]' :
                provider.color === 'orange' ? 'bg-[#fff0e0] border-[#ffd4b8] hover:border-[#ffc5a0]' :
                'bg-[#fff8e0] border-[#ffebb8] hover:border-[#ffe0a0]'
              }`}
            >
              <h3 className="text-xl font-bold text-[#2d2d2d] mb-6">{provider.name}</h3>
              <div className="space-y-3">
                {provider.models.map((model) => (
                  <div key={model} className="flex items-center gap-3 text-sm text-[#6b6b6b]">
                    <CheckCircle2 className="w-4 h-4 text-[#d94d7a] flex-shrink-0" />
                    {model}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/models" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#ffb3d1] text-[#2d2d2d] font-semibold text-lg hover:bg-[#ffa0c7] transition-colors">
            View All 1300+ Models
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="py-40 container mx-auto px-6 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-6xl md:text-7xl font-bold mb-8 text-[#2d2d2d] text-balance">
            Ready to <span className="text-[#d94d7a]">get started?</span>
          </h2>
          <p className="text-xl text-[#6b6b6b] mb-12 max-w-xl mx-auto text-balance">Start building with az.ai today.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/playground" className="inline-flex items-center gap-3 px-12 py-5 rounded-full bg-[#ffb3d1] text-[#2d2d2d] font-bold text-lg hover:bg-[#ffa0c7] transition-colors focus-visible:outline-2 focus-visible:outline-[#ffb3d1] focus-visible:outline-offset-2">
              Open Playground
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[#e8e5e0] bg-[#f5f3f0]">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/az.png" 
              alt="az.ai logo" 
              width={32} 
              height={32}
              className="rounded-lg"
              loading="lazy"
            />
            <span className="text-xl font-bold text-[#2d2d2d]">az.ai</span>
          </div>
          <div className="text-sm text-[#6b6b6b]">
            © 2025 az.ai. All rights reserved.
          </div>
      </div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, description, icon, color }: { title: string, description: string, icon: React.ReactNode, color: string }) {
  const colorClasses = {
    pink: 'bg-[#ffe0ed] border-[#ffb3d1] hover:border-[#ff9faa]',
    green: 'bg-[#e0f5e8] border-[#a8d5ba] hover:border-[#95c9a8]',
    blue: 'bg-[#e0f0ff] border-[#b8c5ff] hover:border-[#a0b5ff]',
  };
  
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`liquid-glass group p-10 rounded-3xl border-2 transition-colors relative z-10 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.pink}`}
    >
      <div className={`mb-6 p-4 rounded-2xl relative z-20 ${
        color === 'pink' ? 'bg-[#ffb3d1]' :
        color === 'green' ? 'bg-[#a8d5ba]' :
        'bg-[#b8c5ff]'
      } w-fit`}>
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-[#2d2d2d] relative z-20">{title}</h3>
      <p className="text-[#6b6b6b] leading-relaxed relative z-20">{description}</p>
    </motion.div>
  );
}
