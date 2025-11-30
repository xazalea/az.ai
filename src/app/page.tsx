"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Box, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-neutral-400 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            v3.0 Stable Release
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[0.9]">
            The Universal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">Game OS.</span>
          </h1>
          
          <p className="text-xl text-neutral-400 max-w-2xl leading-relaxed mb-12">
            VAPŌR is a web-based operating system for retro gaming and file management. 
            Zero installation. Unlimited local storage. Instant play.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-colors"
            >
              Launch App <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="https://github.com/xazalea/az.ai" 
              target="_blank"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/5 text-white font-semibold text-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              View Source
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 border-t border-white/5 bg-[#0a0a0a]/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Browser Native</h3>
              <p className="text-neutral-400 leading-relaxed">
                Running entirely in your browser using WebAssembly. No downloads, no installations, no configuration required.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Local Storage</h3>
              <p className="text-neutral-400 leading-relaxed">
                Your files never leave your device. We use the Origin Private File System to store gigabytes of data securely.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">High Performance</h3>
              <p className="text-neutral-400 leading-relaxed">
                Optimized emulation cores deliver native-like performance for GBA, NES, SNES, and N64 titles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold tracking-tighter">VAPŌR</div>
          <div className="text-sm text-neutral-500">
            © 2025 VAPŌR. Built for the web.
          </div>
        </div>
      </footer>
    </div>
  );
}
