"use client";

import { motion } from 'framer-motion';
import { Activity, Server, Cpu, MemoryStick, Zap } from 'lucide-react';

export default function EnginePage() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-green-500" />
          Bellum Engine
        </h1>
        <p className="text-neutral-500">Real-time telemetry for the translation core.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Core Status', value: 'ONLINE', icon: <Server className="w-6 h-6" />, color: 'text-green-500' },
          { label: 'JIT Cache', value: '0 MB', icon: <MemoryStick className="w-6 h-6" />, color: 'text-blue-500' },
          { label: 'CPU Usage', value: '0%', icon: <Cpu className="w-6 h-6" />, color: 'text-purple-500' },
          { label: 'GPU Context', value: 'WebGPU', icon: <Zap className="w-6 h-6" />, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between"
          >
            <div>
              <div className="text-sm text-neutral-500 mb-1">{stat.label}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
            </div>
            <div className={`${stat.color} opacity-20 p-2 rounded-lg bg-white/5`}>
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 rounded-3xl bg-[#0a0a0a] border border-white/5">
          <h3 className="text-xl font-bold mb-6">Architecture Diagram</h3>
          <div className="aspect-video bg-white/5 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 gap-4 p-8 opacity-20">
              {Array.from({ length: 48 }).map((_, i) => (
                <div key={i} className="bg-white/10 rounded" />
              ))}
            </div>
            <div className="relative z-10 flex items-center gap-8">
              <div className="p-4 bg-black border border-white/20 rounded-lg text-center">
                <div className="text-xs text-neutral-500 mb-1">Input</div>
                <div className="font-mono">x86_64</div>
              </div>
              <Arrow />
              <div className="p-6 bg-blue-900/20 border border-blue-500/50 rounded-xl text-center">
                <div className="text-xs text-blue-400 mb-1">JIT Engine</div>
                <div className="font-bold">Bellum Core</div>
              </div>
              <Arrow />
              <div className="p-4 bg-black border border-white/20 rounded-lg text-center">
                <div className="text-xs text-neutral-500 mb-1">Output</div>
                <div className="font-mono">WASM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5">
          <h3 className="text-xl font-bold mb-6">Supported APIs</h3>
          <div className="space-y-4">
            {[
              { name: 'Direct3D 12', status: 'Experimental', color: 'text-yellow-500' },
              { name: 'Vulkan 1.2', status: 'Planned', color: 'text-neutral-500' },
              { name: 'OpenGL 4.6', status: 'Beta', color: 'text-blue-500' },
              { name: 'OpenAL', status: 'Stable', color: 'text-green-500' },
            ].map((api) => (
              <div key={api.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <span className="font-medium">{api.name}</span>
                <span className={`text-xs ${api.color}`}>{api.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-600">
      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

