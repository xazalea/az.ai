"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Gamepad2, HardDrive, Activity, Clock } from 'lucide-react';

export default function Dashboard() {
  return (
    <main className="min-h-screen pt-12 px-6 pb-20 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Dashboard
        </h1>
        <p className="text-neutral-500">
          Welcome back. Your digital workspace is ready.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500 mb-1">Storage Used</div>
            <div className="text-2xl font-bold">Local</div>
          </div>
          <HardDrive className="w-8 h-8 text-blue-500/20" />
        </div>
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500 mb-1">Games Installed</div>
            <div className="text-2xl font-bold">0</div>
          </div>
          <Gamepad2 className="w-8 h-8 text-green-500/20" />
        </div>
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-sm text-neutral-500 mb-1">Play Time</div>
            <div className="text-2xl font-bold">0h</div>
          </div>
          <Clock className="w-8 h-8 text-purple-500/20" />
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        
        {/* Emulators Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between min-h-[300px]"
        >
          <div>
            <div className="flex items-center gap-2 mb-6 text-green-400">
              <Gamepad2 className="w-6 h-6" />
              <span className="text-xs font-medium uppercase tracking-wider">System</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">Emulators</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Launch web-based emulators. GBA, NES, SNES, N64, and more available instantly.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/emulators" className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
              Launch System <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Games Library Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between min-h-[300px]"
        >
          <div>
            <div className="flex items-center gap-2 mb-6 text-yellow-400">
              <Activity className="w-6 h-6" />
              <span className="text-xs font-medium uppercase tracking-wider">Library</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">My Games</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Access your personal game collection. Upload ROMs to Storage to populate your library.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/games" className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
              Browse Library <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Storage Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="group p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all flex flex-col justify-between min-h-[300px]"
        >
          <div>
            <div className="flex items-center gap-2 mb-6 text-blue-400">
              <HardDrive className="w-6 h-6" />
              <span className="text-xs font-medium uppercase tracking-wider">Data</span>
            </div>
            <h2 className="text-3xl font-bold mb-3">File Storage</h2>
            <p className="text-neutral-400 text-sm leading-relaxed">
              Manage your local files and ROMs. Uses advanced browser storage (OPFS) for persistent access.
            </p>
          </div>
          <div className="mt-8">
            <Link href="/storage" className="inline-flex items-center gap-2 text-white font-medium group-hover:gap-3 transition-all">
              Manage Files <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

