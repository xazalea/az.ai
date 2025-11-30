"use client";

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellumSystem } from '@/engine/core';
import { Cpu, Zap, FileCode, Terminal, Play, AlertCircle, Smartphone, Monitor } from 'lucide-react';

export default function CompilerPage() {
  const [system, setSystem] = useState<BellumSystem | null>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'compiling' | 'running' | 'error'>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [deviceProfile, setDeviceProfile] = useState<'desktop' | 'mobile'>('desktop');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Boot System
  useEffect(() => {
    const sys = new BellumSystem();
    
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, `[INFO] ${args.join(' ')}`]);
    };
    
    console.warn = (...args) => {
        originalWarn(...args);
        setLogs(prev => [...prev, `[WARN] ${args.join(' ')}`]);
    };
    
    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
    };

    sys.boot().then(() => {
      setSystem(sys);
      setIsBooting(false);
    }).catch(() => {
      setIsBooting(false);
      setStatus('error');
    });

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (ext !== 'exe' && ext !== 'apk') {
        alert("Only .exe (Windows) and .apk (Android) files are supported.");
        return;
      }
      
      // Auto-switch profile
      if (ext === 'apk') setDeviceProfile('mobile');
      if (ext === 'exe') setDeviceProfile('desktop');

      setFile(selectedFile);
      setStatus('analyzing');
      
      if (system) {
        try {
          await system.launchExecutable(selectedFile);
          setStatus('running');
        } catch (err) {
          setStatus('error');
        }
      }
    }
  };

  return (
    <div className="min-h-screen pt-8 px-6 pb-20 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Control Panel */}
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Cpu className="w-8 h-8 text-blue-500" />
            Bellum Compiler
          </h1>
          <p className="text-neutral-500 text-balance">
            Dynamic Binary Translation Engine. Converts x86_64/ARM64 binaries to WebAssembly/WebGPU IR in real-time.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-400">Engine Status</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isBooting ? 'bg-yellow-500 animate-pulse' : system ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-white">{isBooting ? 'Booting Kernel...' : system ? 'Ready' : 'Failed'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
             <div className="flex items-center gap-2">
                {deviceProfile === 'desktop' ? <Monitor className="w-4 h-4 text-blue-400" /> : <Smartphone className="w-4 h-4 text-green-400" />}
                <span className="text-sm text-white">Target Profile</span>
             </div>
             <select 
                value={deviceProfile}
                onChange={(e) => setDeviceProfile(e.target.value as any)}
                className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
             >
                <option value="desktop">Desktop (x86_64/Windows)</option>
                <option value="mobile">Mobile (ARM64/Android)</option>
             </select>
          </div>

          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="border-2 border-dashed border-white/10 rounded-xl p-12 text-center hover:border-white/20 transition-colors cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} className="hidden" accept=".exe,.apk" onChange={handleFile} />
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 group-hover:bg-white/10 transition-colors">
                <FileCode className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Load Executable</h3>
              <p className="text-sm text-neutral-500">Drop .exe or .apk file here</p>
            </motion.div>
          )}

          {status === 'analyzing' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-yellow-400">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-medium">Analyzing Binary Structure...</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-yellow-400"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2 }}
                />
              </div>
            </div>
          )}

          {status === 'running' && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400">
              <Play className="w-5 h-5" />
              <span className="font-medium">Process Running (PID: {Math.floor(Math.random() * 9000) + 1000})</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Runtime Exception</span>
            </div>
          )}
        </div>
      </div>

      {/* Right: Terminal Output */}
      <div className="bg-[#050505] rounded-2xl border border-white/10 flex flex-col h-[600px] overflow-hidden font-mono text-xs">
        <div className="px-4 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-neutral-400">
            <Terminal className="w-4 h-4" />
            <span>Output Stream</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
          </div>
        </div>
        
        <div ref={terminalRef} className="flex-1 p-4 overflow-y-auto space-y-1 text-neutral-300 scrollbar-thin font-mono">
          {logs.length === 0 && <span className="text-neutral-600 opacity-50">System waiting...</span>}
          {logs.map((log, i) => (
            <div key={i} className="break-all leading-relaxed">
              <span className="opacity-30 mr-2 select-none text-[10px]">{new Date().toLocaleTimeString()}</span>
              <span className={
                  log.includes('[ERROR]') ? 'text-red-400 font-bold' : 
                  log.includes('[WARN]') ? 'text-yellow-400' :
                  log.includes('[INFO]') ? 'text-blue-400' : 
                  log.includes('[BellumAndroid]') ? 'text-green-400' :
                  log.includes('[BellumDX]') ? 'text-purple-400' :
                  'text-neutral-300'
              }>
                {log}
              </span>
            </div>
          ))}
          {status === 'running' && (
            <div className="animate-pulse text-green-500">_</div>
          )}
        </div>
      </div>
    </div>
  );
}
