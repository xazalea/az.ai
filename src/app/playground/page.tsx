"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Image as ImageIcon, MessageSquare, Loader2, Sparkles, Command, Terminal, Video, ChevronDown, ChevronRight, Zap, Brain, Database, Settings, Copy, Download, Share2, History, Trash2, X, Maximize2, Minimize2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PROVIDER_GROUPS, getProviderGroupsByType, type Model } from '@/lib/models';
import { ProviderIcon } from '@/lib/provider-icons';
import Image from 'next/image';
import Link from 'next/link';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { ToastContainer, useToast } from '@/components/Toast';

function PlaygroundContent() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [selectedModel, setSelectedModel] = useState('qwen');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(['openai', 'google', 'deepseek']));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, reasoning?: any, timestamp?: number, id?: string, timing?: { thoughtTime?: number, totalTime?: number } }>>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [openMemoryEnabled, setOpenMemoryEnabled] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'speed'>('name');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toasts, showError, showSuccess, removeToast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, generatedImage, generatedVideo]);

  // Handle URL parameters for model selection
  useEffect(() => {
    const modelParam = searchParams.get('model');
    const modeParam = searchParams.get('mode') as 'chat' | 'image' | 'video' | null;
    
    if (modelParam) {
      setSelectedModel(modelParam);
      setShowModelInfo(true);
    }
    
    if (modeParam && ['chat', 'image', 'video'].includes(modeParam)) {
      setMode(modeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Cmd/Ctrl + / to toggle sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      // Escape to clear input
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setInput('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleProvider = (providerId: string) => {
    setExpandedProviders(prev => {
      const next = new Set(prev);
      if (next.has(providerId)) {
        next.delete(providerId);
      } else {
        next.add(providerId);
      }
      return next;
    });
  };

  const providerGroups = getProviderGroupsByType(mode);
  
  // Sort and filter models - memoized to prevent re-calculation on every render
  const sortedProviderGroups = React.useMemo(() => {
    return providerGroups
    .map(group => {
      // Filter out models with "g4f" as provider and clean provider names
      let filteredModels = group.models.filter(model => {
        const providerLower = (model.provider || '').toLowerCase();
        return providerLower !== 'g4f' && providerLower !== 'g4f models';
      });
      
      // Clean provider names - remove "via g4f" and similar
      filteredModels = filteredModels.map(model => ({
        ...model,
        provider: model.provider?.replace(/\s+via\s+g4f/i, '').replace(/\s+via\s+deepinfra/i, '') || model.provider
      }));
      
      let sortedModels = [...filteredModels];
      
      if (sortBy === 'name') {
        sortedModels.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sortBy === 'speed') {
        sortedModels.sort((a, b) => {
          const aSpeed = a.speed === 'fast' ? 3 : a.speed === 'medium' ? 2 : 1;
          const bSpeed = b.speed === 'fast' ? 3 : b.speed === 'medium' ? 2 : 1;
          return bSpeed - aSpeed;
        });
      }
      
      return { ...group, models: sortedModels };
    })
    .filter(group => {
      // Filter out groups with "g4f" in name and empty groups
      const nameLower = group.name.toLowerCase();
      return group.models.length > 0 && 
             !nameLower.includes('g4f') && 
             nameLower !== 'g4f';
    });
  }, [providerGroups, sortBy]);
  
  const selectedModelInfo = sortedProviderGroups.flatMap(g => g.models).find(m => m.id === selectedModel);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    const startTime = Date.now();
    let thoughtStartTime = startTime;

    if (mode === 'chat') {
      const userMessage = { role: 'user' as const, content: input, id: `msg-${Date.now()}` };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setInput('');

      try {
        let memoryContext = [];
        if (openMemoryEnabled) {
          try {
            const memoryRes = await fetch('/api/openmemory/memory/query', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: input,
                k: 5,
              }),
            });
            if (memoryRes.ok) {
              const memoryData = await memoryRes.json();
              if (memoryData.matches && memoryData.matches.length > 0) {
                memoryContext = memoryData.matches.map((m: any) => ({
                  role: 'system' as const,
                  content: `[Memory Context] ${m.content}`,
                }));
              }
            }
          } catch (memError) {
            console.warn('OpenMemory query failed:', memError);
          }
        }

        thoughtStartTime = Date.now();
        
        // Add timeout to prevent infinite loading
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, 60000); // 60 second timeout - better for slower models
        
        try {
          const res = await fetch('/api/unified/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: selectedModel,
              messages: [...memoryContext, ...newMessages],
              stream: false,
              use_reasoning: reasoningEnabled,
              use_memory: openMemoryEnabled,
            }),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: { message: `HTTP ${res.status}: ${res.statusText}` } }));
            throw new Error(errorData.error?.details || errorData.error?.message || errorData.error || `Request failed with status ${res.status}`);
          }

          const thoughtTime = Date.now() - thoughtStartTime;
          const data = await res.json();
          if (data.error) throw new Error(data.error.details || data.error.message || data.error);

          const content = data.choices?.[0]?.message?.content || "No response generated.";
          const reasoning = data.reasoning;
          const totalTime = Date.now() - startTime;
          
          if (openMemoryEnabled && content) {
            try {
              await fetch('/api/openmemory/memory/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  content: `User: ${input}\nAssistant: ${content}`,
                  tags: ['playground', 'chat'],
                  metadata: { model: selectedModel, mode: 'chat' },
                }),
              });
            } catch (memError) {
              console.warn('OpenMemory storage failed:', memError);
            }
          }

          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content,
            reasoning,
            timestamp: Date.now(),
            id: `msg-${Date.now()}`,
            timing: { thoughtTime, totalTime },
          }]);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          // Re-throw with better error message for AbortError
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Request timed out after 2 minutes. Please try a different model or simplify your request.');
          }
          throw fetchError;
        }
      } catch (error) {
        // Only log non-AbortError errors to console (AbortError is expected for timeouts)
        if (!(error instanceof Error && error.name === 'AbortError')) {
          console.error('Chat error:', error);
        }
        
        let errorMessage = 'Failed to fetch response';
        
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('timed out') || error.message.includes('aborted')) {
            errorMessage = 'Request timed out after 60 seconds. Please try a different model or simplify your request.';
          } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
            errorMessage = 'Server error. Please try again or select a different model.';
          } else if (error.message.includes('404') || error.message.includes('Not Found')) {
            errorMessage = 'Model not found. Please select a different model.';
          } else if (error.message.includes('403')) {
            errorMessage = 'Access denied. This model may not be available.';
          } else if (error.message.includes('504') || error.message.includes('Gateway Timeout')) {
            errorMessage = 'Request timed out. The server took too long to respond.';
          } else {
            errorMessage = error.message || 'An error occurred. Please try again.';
          }
        }
        
        showError(errorMessage, 8000);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${errorMessage}`,
          id: `msg-${Date.now()}`,
          timestamp: Date.now(),
          timing: { totalTime: (Date.now() - startTime) / 1000 },
        }]);
      } finally {
        setIsLoading(false); // Always clear loading state
      }
    } else if (mode === 'image') {
      try {
        const prompt = input;
        setInput('');
        setGeneratedImage(null);
        
        // Add timeout for image generation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const res = await fetch('/api/unified/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            n: 1,
            size: "1024x1024"
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data.error) throw new Error(data.error.details || data.error.message || data.error);
        
        const url = data.data?.[0]?.url || (data.data?.[0]?.b64_json 
          ? `data:image/png;base64,${data.data[0].b64_json}`
          : null);
        if (url) setGeneratedImage(url);
        else throw new Error("No image returned");

      } catch (error) {
        console.error('Image generation error:', error);
        const errorMessage = error instanceof Error 
          ? (error.name === 'AbortError' || error.message.includes('timeout')
              ? 'Image generation timed out after 60 seconds. Please try again.' 
              : error.message)
          : 'Failed to generate image';
        showError(errorMessage, 8000);
      } finally {
        setIsLoading(false);
      }
    } else if (mode === 'video') {
      try {
        const prompt = input;
        setInput('');
        setGeneratedVideo(null);
        
        // Add timeout for video generation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const res = await fetch('/api/unified/v1/videos/generations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            duration: 8.0,
            aspect_ratio: '16:9'
          }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        const data = await res.json();
        if (data.error) throw new Error(data.error.details || data.error.message || data.error);
        
        const videoUrl = data.data?.[0]?.url || null;
        if (videoUrl) setGeneratedVideo(videoUrl);
        else throw new Error("No video returned");

      } catch (error) {
        console.error('Video generation error:', error);
        const errorMessage = error instanceof Error 
          ? (error.name === 'AbortError' || error.message.includes('timeout')
              ? 'Video generation timed out after 60 seconds. Please try again.' 
              : error.message)
          : 'Failed to generate video';
        showError(errorMessage, 8000);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // Visual feedback could be added here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyCodeBlock = async (text: string) => {
    await copyMessage(text);
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
      setGeneratedImage(null);
      setGeneratedVideo(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#F0DAD5] font-sans flex flex-col w-full">
      <KeyboardShortcuts />
      {/* Header */}
      <header className="bg-[#424658] border-b border-[#6C739C]/30 sticky top-0 z-20 w-full">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/az.png" 
                alt="az.ai logo" 
                width={32} 
                height={32}
                className="rounded-lg"
              />
              <h1 className="text-xl font-bold text-[#F0DAD5]">
                az.ai <span className="text-[#BABBB1] font-normal">Playground</span>
              </h1>
            </Link>
            {selectedModelInfo && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#424658] border border-[#6C739C]/40 text-xs">
                <span className="text-[#BABBB1]">Model:</span>
                <span className="text-[#D9A69F] font-semibold">{selectedModelInfo.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#424658] transition-colors"
            >
              <Settings className="w-5 h-5 text-[#BABBB1]" />
            </button>
            
            <nav className="flex items-center space-x-1 bg-[#424658] p-1 rounded-full border border-[#6C739C]/40">
              <button
                onClick={() => setMode('chat')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                  mode === 'chat' 
                    ? "bg-[#6C739C] text-[#F0DAD5]" 
                    : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#424658]/80"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setMode('image')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                  mode === 'image' 
                    ? "bg-[#6C739C] text-[#F0DAD5]" 
                    : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#424658]/80"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Image</span>
              </button>
              <button
                onClick={() => setMode('video')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                  mode === 'video' 
                    ? "bg-[#6C739C] text-[#F0DAD5]" 
                    : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#424658]/80"
                )}
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-6 flex gap-6 relative">
        
        {/* Sidebar / Model Selection */}
        <AnimatePresence>
          {(sidebarOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-56 flex-shrink-0 space-y-2 overflow-y-auto max-h-[calc(100vh-8rem)]",
                "md:block",
                !sidebarOpen && "hidden md:block",
                "bg-[#424658] p-3 rounded-xl border border-[#6C739C]/30"
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-semibold text-[#BABBB1] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-[#D9A69F]" />
                    Model Providers
                  </label>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 rounded hover:bg-[#424658]/80"
                  >
                    <X className="w-3.5 h-3.5 text-[#BABBB1]" />
                  </button>
                </div>
                
                {/* Sort */}
                <div className="mb-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'speed')}
                    className="w-full p-1.5 rounded-lg bg-[#1a1a1a] text-[#F0DAD5] text-[11px] border border-[#6C739C]/40 focus:outline-none focus:ring-1 focus:ring-[#6C739C]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="speed">Sort by Speed</option>
                  </select>
                </div>
                
                <div className="space-y-0.5">
                  {sortedProviderGroups.map(group => {
                    const isExpanded = expandedProviders.has(group.id);
                    return (
                      <div key={group.id} className="border border-[#6C739C]/30 rounded-lg overflow-hidden bg-[#1a1a1a]">
                        <button
                          onClick={() => toggleProvider(group.id)}
                          className="w-full text-left px-2.5 py-1.5 hover:bg-[#424658] transition-all flex items-center justify-between text-xs font-semibold text-[#F0DAD5] rounded-lg gap-2"
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <ProviderIcon provider={group.name} className="w-3.5 h-3.5 text-[#D9A69F] flex-shrink-0" />
                            <span className="truncate">{group.name}</span>
                          </div>
                          {isExpanded ? <ChevronDown className="w-3 h-3 text-[#BABBB1] flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-[#BABBB1] flex-shrink-0" />}
                        </button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-0.5 space-y-0.5">
                                {group.models.map(model => (
                                  <button
                                    key={model.id}
                                    onClick={() => {
                                      setSelectedModel(model.id);
                                      setShowModelInfo(true);
                                      // Close sidebar on mobile after selection
                                      if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                        setSidebarOpen(false);
                                      }
                                    }}
                                    className={cn(
                                      "w-full text-left px-2.5 py-1.5 rounded text-xs transition-all group",
                                      selectedModel === model.id 
                                        ? "bg-[#6C739C] text-[#F0DAD5] font-semibold" 
                                        : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#424658]"
                                    )}
                                  >
                                    <div className="font-medium flex items-center justify-between gap-1">
                                      <span className="truncate">{model.name}</span>
                                      {model.speed === 'fast' && (
                                        <Zap className="w-2.5 h-2.5 text-[#D9A69F] opacity-70 flex-shrink-0" />
                                      )}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Settings Panel */}
              <div className="space-y-1.5 mt-2">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#6C739C]/30 hover:bg-[#424658]/80 flex items-center justify-between text-xs font-semibold text-[#F0DAD5] transition-all"
                    >
                        <div className="flex items-center gap-1.5">
                            <Settings className="w-3 h-3 text-[#D9A69F]" />
                            <span>Settings</span>
                        </div>
                        {showSettings ? <ChevronDown className="w-3 h-3 text-[#BABBB1]" /> : <ChevronRight className="w-3 h-3 text-[#BABBB1]" />}
                    </button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl bg-[#424658] border border-[#6C739C]/30 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Brain className="w-3 h-3 text-[#D9A69F]" />
                            <div>
                              <div className="text-xs font-medium text-[#F0DAD5]">Reasoning</div>
                              <div className="text-[10px] text-[#BABBB1]">Always enabled</div>
                            </div>
                          </div>
                          <div className="px-1.5 py-0.5 rounded bg-[#6C739C] border border-[#6C739C]/50 text-[10px] text-[#F0DAD5] font-medium">
                            On
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Database className="w-3 h-3 text-[#D9A69F]" />
                            <div>
                              <div className="text-xs font-medium text-[#F0DAD5]">Memory</div>
                              <div className="text-[10px] text-[#BABBB1]">Session-based</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setOpenMemoryEnabled(!openMemoryEnabled)}
                            className={cn(
                              "relative w-11 h-6 rounded-full transition-colors",
                              openMemoryEnabled ? "bg-[#6C739C]" : "bg-[#424658] border border-[#6C739C]/40"
                            )}
                          >
                            <div className={cn(
                              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform",
                              openMemoryEnabled ? "translate-x-5" : "translate-x-0"
                            )} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="p-4 rounded-2xl bg-[#424658] border border-[#6C739C]/30 text-xs text-[#BABBB1]">
                <div className="flex items-center gap-2 mb-2 text-[#D9A69F]">
                  <Sparkles className="w-3 h-3" />
                  <span className="font-medium">Tip</span>
                </div>
                <p>
                  {mode === 'chat' 
                    ? "Memory transfers across models. Reasoning enhances all responses." 
                    : mode === 'image'
                    ? "Be specific with visual descriptions. Try Dreamina for high-quality images."
                    : "Describe the video scene with details. Multiple providers available."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat/Interaction Area */}
        <div className="flex-1 bg-[#1a1a1a] rounded-2xl border border-[#6C739C]/30 overflow-hidden flex flex-col w-full">
          
                {/* Output Stage */}
                <div className="flex-1 p-8 overflow-y-auto min-h-[400px] bg-[#1a1a1a] w-full" ref={scrollRef}>
            <AnimatePresence mode="wait">
              {mode === 'chat' ? (
                messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#424658] border-2 border-[#6C739C] flex items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-[#D9A69F]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#F0DAD5] mb-2">Start a conversation</p>
                      <p className="text-sm text-[#BABBB1]">
                        {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model to begin'}
                      </p>
                    </div>
                    {selectedModelInfo && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-[#424658] border border-[#6C739C]/30 text-xs text-left max-w-md"
                      >
                        <div className="text-[#D9A69F] font-semibold mb-1">{selectedModelInfo.name}</div>
                        <div className="text-[#BABBB1]">{selectedModelInfo.description}</div>
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <div className="space-y-6 max-w-4xl mx-auto">
                    {messages.map((msg, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        key={msg.id || idx} 
                        className={cn(
                          "flex gap-4 group",
                          msg.role === 'user' ? "flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 font-bold text-sm",
                          msg.role === 'user' 
                            ? "bg-[#424658] border-[#6C739C]/50 text-[#F0DAD5]" 
                            : "bg-[#424658] border-[#6C739C]/30 text-[#F0DAD5]"
                        )}>
                          {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={cn(
                          "flex-1 p-5 rounded-2xl text-sm leading-relaxed border-2 transition-all",
                          msg.role === 'user' 
                            ? "bg-[#424658] text-[#F0DAD5] border-[#6C739C]/50 rounded-tr-none" 
                            : "bg-[#424658] text-[#F0DAD5] border-[#6C739C]/30 rounded-tl-none"
                        )}>
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          {msg.reasoning && (
                            <div className="mt-3 pt-3 border-t border-[#6C739C]/30">
                              <div className="flex items-center gap-2 text-xs text-[#D9A69F]">
                                <Brain className="w-3 h-3" />
                                <span>
                                  Reasoning: {msg.reasoning.mode} 
                                  {msg.reasoning.confidence && ` (${(msg.reasoning.confidence * 100).toFixed(0)}% confidence)`}
                                </span>
                              </div>
                            </div>
                          )}
                          {msg.timing && (
                            <div className="mt-2 pt-2 border-t border-[#6C739C]/30">
                              <div className="flex items-center gap-4 text-xs text-[#BABBB1]">
                                {msg.timing.thoughtTime !== undefined && (
                                  <span>Thought: <span className="text-[#6C739C]">{msg.timing.thoughtTime}ms</span></span>
                                )}
                                {msg.timing.totalTime !== undefined && (
                                  <span>Total: <span className="text-[#D9A69F]">{msg.timing.totalTime}ms</span></span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="p-1.5 rounded hover:bg-[#424658]/80 transition-colors focus-visible:outline-2 focus-visible:outline-[#6C739C] focus-visible:outline-offset-1"
                              title="Copy message"
                              aria-label="Copy message to clipboard"
                            >
                              <Copy className="w-3 h-3 text-[#BABBB1]" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="flex gap-4"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#ffb3d1] flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[#2d2d2d]" />
                        </div>
                        <div className="flex-1 p-5 rounded-2xl bg-[#424658] border border-[#6C739C]/30 text-[#BABBB1] text-sm flex items-center gap-2 rounded-tl-none">
                          <Loader2 className="w-4 h-4 animate-spin text-[#D9A69F]" />
                          <span className="text-[#F0DAD5]">Thinking...</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )
              ) : mode === 'image' ? (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  {generatedImage ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                            className="max-w-full max-h-[70vh] rounded-2xl border border-[#6C739C]/30"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `generated-${Date.now()}.png`;
                            link.click();
                          }}
                          className="p-2 rounded bg-[#424658] border border-[#6C739C]/30 hover:bg-[#424658]/80 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-[#BABBB1]" />
                        </button>
                        <button
                          onClick={() => copyMessage(generatedImage)}
                          className="p-2 rounded bg-[#424658] border border-[#6C739C]/30 hover:bg-[#424658]/80 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4 text-[#BABBB1]" />
                        </button>
                      </div>
                    </motion.div>
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#3a3a3a]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#ffb3d1] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#D9A69F] font-medium">Generating image...</p>
                      <p className="text-xs text-[#BABBB1]">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-[#424658] border-2 border-[#6C739C] flex items-center justify-center mx-auto">
                        <ImageIcon className="w-12 h-12 text-[#D9A69F]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#e0e0e0] mb-2">Generate an Image</p>
                        <p className="text-sm text-[#888888]">
                          {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model and enter a prompt'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  {generatedVideo ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <video 
                        src={generatedVideo}
                        controls
                            className="max-w-full max-h-[70vh] rounded-2xl border border-[#6C739C]/30"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedVideo;
                            link.download = `generated-video-${Date.now()}.mp4`;
                            link.click();
                          }}
                          className="p-2 rounded bg-[#424658] border border-[#6C739C]/30 hover:bg-[#424658]/80 transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-[#BABBB1]" />
                        </button>
                        <button
                          onClick={() => copyMessage(generatedVideo)}
                          className="p-2 rounded bg-[#424658] border border-[#6C739C]/30 hover:bg-[#424658]/80 transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4 text-[#BABBB1]" />
                        </button>
                      </div>
                    </motion.div>
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#424658]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#6C739C] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#D9A69F] font-medium">Generating video...</p>
                      <p className="text-xs text-[#BABBB1]">This may take several minutes</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-[#424658] border-2 border-[#6C739C] flex items-center justify-center mx-auto">
                        <Video className="w-12 h-12 text-[#D9A69F]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#F0DAD5] mb-2">Generate a Video</p>
                        <p className="text-sm text-[#BABBB1]">
                          {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model and enter a prompt'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div className="p-4 bg-[#424658] border-t border-[#6C739C]/30 w-full">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    mode === 'chat' 
                      ? "Type your message... (Shift+Enter for new line, Cmd+K to focus)" 
                      : mode === 'image'
                      ? "Describe the image you want to generate... (Cmd+K to focus)"
                      : "Describe the video you want to create... (Cmd+K to focus)"
                  }
                  aria-label="Message input"
                  className="w-full bg-[#1a1a1a] text-[#F0DAD5] rounded-xl px-5 py-4 pr-14 border border-[#6C739C]/30 focus:border-[#6C739C] focus:ring-2 focus:ring-[#6C739C]/20 outline-none resize-none min-h-[60px] max-h-[200px] placeholder:text-[#BABBB1] transition-all"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {messages.length > 0 && mode === 'chat' && (
                    <button
                      onClick={clearChat}
                      className="p-1.5 rounded hover:bg-[#424658]/80 transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4 text-[#BABBB1]" />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
                className={cn(
                  "p-3 rounded-lg transition-all flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#6C739C] focus-visible:outline-offset-2",
                  isLoading || !input.trim()
                    ? "bg-[#424658] border border-[#6C739C]/30 text-[#BABBB1] cursor-not-allowed"
                    : "bg-[#6C739C] text-[#F0DAD5] hover:bg-[#6C739C]/80"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#BABBB1]/80">
              <div className="flex items-center gap-4">
                {selectedModelInfo && (
                  <span>Model: <span className="text-[#D9A69F]">{selectedModelInfo.name}</span></span>
                )}
                {openMemoryEnabled && (
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3 text-[#D9A69F]" />
                    Memory enabled
                  </span>
                )}
                {reasoningEnabled && (
                  <span className="flex items-center gap-1">
                    <Brain className="w-3 h-3 text-[#D9A69F]" />
                    Reasoning enabled
                  </span>
                )}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#BABBB1]">
                Powered by az.ai
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Playground() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center" role="status" aria-label="Loading playground">
        <Loader2 className="w-8 h-8 text-[#ffb3d1] animate-spin" aria-hidden="true" />
        <span className="sr-only">Loading playground...</span>
      </div>
    }>
      <PlaygroundContent />
    </Suspense>
  );
}
