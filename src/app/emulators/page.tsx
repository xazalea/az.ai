"use client";

import { motion } from 'framer-motion';
import { Gamepad2, Monitor, Cpu, Smartphone } from 'lucide-react';

const emulators = [
  { name: 'GBA', description: 'Game Boy Advance', icon: <Gamepad2 className="w-8 h-8" />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'NES', description: 'Nintendo Entertainment System', icon: <Monitor className="w-8 h-8" />, color: 'text-red-400', bg: 'bg-red-400/10' },
  { name: 'SNES', description: 'Super Nintendo', icon: <Gamepad2 className="w-8 h-8" />, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
  { name: 'N64', description: 'Nintendo 64', icon: <Cpu className="w-8 h-8" />, color: 'text-green-400', bg: 'bg-green-400/10' },
  { name: 'PS1', description: 'PlayStation 1', icon: <Monitor className="w-8 h-8" />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'DS', description: 'Nintendo DS', icon: <Smartphone className="w-8 h-8" />, color: 'text-pink-400', bg: 'bg-pink-400/10' },
];

export default function EmulatorsPage() {
  return (
    <div className="min-h-screen pt-8 px-6 pb-20 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">Emulators</h1>
        <p className="text-neutral-500">Web-based emulators for your favorite systems.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {emulators.map((emu, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            key={emu.name}
            className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 hover:border-white/10 transition-all cursor-pointer group"
          >
            <div className={`w-16 h-16 rounded-xl ${emu.bg} ${emu.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
              {emu.icon}
            </div>
            <h3 className="text-xl font-bold mb-2">{emu.name}</h3>
            <p className="text-neutral-500 text-sm mb-4">{emu.description}</p>
            <div className="flex items-center text-sm font-medium text-white/50 group-hover:text-white transition-colors">
              Launch Emulator →
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

