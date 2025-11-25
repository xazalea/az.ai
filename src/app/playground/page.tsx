"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, MessageSquare, Loader2, Sparkles, Command, Terminal, Video, ChevronDown, ChevronRight, Zap, Brain, Database, Settings, Copy, Download, Share2, History, Trash2, X, Maximize2, Minimize2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PROVIDER_GROUPS, getProviderGroupsByType, type Model } from '@/lib/models';
import Image from 'next/image';
import Link from 'next/link';

export default function Playground() {
  const [mode, setMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [selectedModel, setSelectedModel] = useState('qwen');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(['openai', 'google', 'deepseek']));
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, reasoning?: any, timestamp?: number, id?: string }>>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [openMemoryEnabled, setOpenMemoryEnabled] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModelInfo, setShowModelInfo] = useState(false);
  const [sortBy, setSortBy] = useState<'provider' | 'name' | 'speed'>('provider');
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, generatedImage, generatedVideo]);

  useEffect(() => {
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

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
  
  // Sort and filter models
  const sortedProviderGroups = providerGroups.map(group => {
    let sortedModels = [...group.models];
    
    if (sortBy === 'name') {
      sortedModels.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'speed') {
      sortedModels.sort((a, b) => {
        const aSpeed = a.speed === 'fast' ? 3 : a.speed === 'medium' ? 2 : 1;
        const bSpeed = b.speed === 'fast' ? 3 : b.speed === 'medium' ? 2 : 1;
        return bSpeed - aSpeed;
      });
    }
    
    // Filter by provider if selected
    if (filterProvider !== 'all') {
      sortedModels = sortedModels.filter(m => m.provider.toLowerCase() === filterProvider.toLowerCase());
    }
    
    return { ...group, models: sortedModels };
  }).filter(group => group.models.length > 0);
  
  const selectedModelInfo = sortedProviderGroups.flatMap(g => g.models).find(m => m.id === selectedModel);
  
  // Get unique providers for filter
  const uniqueProviders = Array.from(new Set(providerGroups.flatMap(g => g.models.map(m => m.provider))));

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

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

        const res = await fetch('/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [...memoryContext, ...newMessages],
            stream: false,
            use_reasoning: reasoningEnabled,
            use_memory: openMemoryEnabled,
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.details || data.error.message || data.error);

        const content = data.choices?.[0]?.message?.content || "No response generated.";
        const reasoning = data.reasoning;
        
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
        }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Error: ${error instanceof Error ? error.message : 'Failed to fetch response'}`,
          id: `msg-${Date.now()}`,
        }]);
      }
    } else if (mode === 'image') {
      try {
        const prompt = input;
        setInput('');
        setGeneratedImage(null);
        
        const res = await fetch('/v1/images/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            n: 1,
            size: "1024x1024"
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.details || data.error.message || data.error);
        
        const url = data.data?.[0]?.url || (data.data?.[0]?.b64_json 
          ? `data:image/png;base64,${data.data[0].b64_json}`
          : null);
        if (url) setGeneratedImage(url);
        else throw new Error("No image returned");

      } catch (error) {
        alert(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    } else if (mode === 'video') {
      try {
        const prompt = input;
        setInput('');
        setGeneratedVideo(null);
        
        const res = await fetch('/v1/videos/generations', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            duration: 8.0,
            aspect_ratio: '16:9'
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error.details || data.error.message || data.error);
        
        const videoUrl = data.data?.[0]?.url || null;
        if (videoUrl) setGeneratedVideo(videoUrl);
        else throw new Error("No video returned");

      } catch (error) {
        alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsLoading(false);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([]);
      setGeneratedImage(null);
      setGeneratedVideo(null);
    }
  };

      return (
        <div className="min-h-screen bg-[#faf9f7] text-[#2d2d2d] font-sans flex flex-col">
          {/* Header */}
          <header className="bg-[#faf9f7] border-b border-[#e8e5e0] sticky top-0 z-20">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Link href="/" className="flex items-center gap-3">
                  <Image 
                    src="/az.png" 
                    alt="az.ai logo" 
                    width={32} 
                    height={32}
                    className="rounded-lg"
                  />
                  <h1 className="text-xl font-bold text-[#2d2d2d]">
                    az.ai <span className="text-[#6b6b6b] font-normal">Playground</span>
                  </h1>
                </Link>
            {selectedModelInfo && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ffffff] border border-[#e8e5e0]/50 text-xs">
                <span className="text-[#6b6b6b]">Model:</span>
                <span className="text-[#d94d7a] font-semibold">{selectedModelInfo.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[#f5f3f0]/50 transition-colors"
            >
              <Settings className="w-5 h-5 text-[#6b6b6b]" />
            </button>
            
            <nav className="flex items-center space-x-1 bg-[#ffffff] p-1 rounded-full border-2 border-[#e8e5e0]">
              <button
                onClick={() => setMode('chat')}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                  mode === 'chat' 
                    ? "bg-[#ffb3d1] text-[#2d2d2d]" 
                    : "text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f5f3f0]"
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
                    ? "bg-[#ffb3d1] text-[#2d2d2d]" 
                    : "text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f5f3f0]"
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
                    ? "bg-[#ffb3d1] text-[#2d2d2d]" 
                    : "text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f5f3f0]"
                )}
              >
                <Video className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl flex gap-6 relative">
        
        {/* Sidebar / Model Selection */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 768) && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "w-64 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]",
                "md:block",
                !sidebarOpen && "hidden"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#6b6b6b] uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#d94d7a]" />
                    Models
                  </label>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 rounded-lg hover:bg-[#f5f3f0]"
                  >
                    <X className="w-4 h-4 text-[#6b6b6b]" />
                  </button>
                </div>
                <div className="space-y-1">
                  {sortedProviderGroups.map(group => {
                    const isExpanded = expandedProviders.has(group.id);
                    return (
                      <div key={group.id} className="border border-[#e8e5e0]/50 rounded-xl overflow-hidden bg-[#ffffff]">
                        <button
                          onClick={() => toggleProvider(group.id)}
                          className="w-full text-left px-4 py-3 hover:bg-[#f5f3f0]/50 transition-all flex items-center justify-between text-sm font-semibold text-[#2d2d2d] rounded-xl "
                        >
                          <span>{group.name}</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-[#6b6b6b]" /> : <ChevronRight className="w-4 h-4 text-[#6b6b6b]" />}
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
                              <div className="p-1 space-y-1">
                                {group.models.map(model => (
                                  <button
                                    key={model.id}
                                    onClick={() => {
                                      setSelectedModel(model.id);
                                      setShowModelInfo(true);
                                    }}
                                    className={cn(
                                      "w-full text-left px-4 py-3 rounded-xl text-sm transition-all group",
                                      selectedModel === model.id 
                                        ? "bg-[#ffb3d1] text-[#2d2d2d] font-semibold" 
                                        : "text-[#6b6b6b] hover:text-[#2d2d2d] hover:bg-[#f5f3f0]"
                                    )}
                                  >
                                    <div className="font-medium flex items-center justify-between">
                                      <span>{model.name}</span>
                                      {model.speed === 'fast' && (
                                        <Zap className="w-3 h-3 text-[#d94d7a] opacity-70" />
                                      )}
                                    </div>
                                    <div className="text-xs opacity-70 truncate mt-0.5">{model.description}</div>
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
              <div className="space-y-3">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-full px-4 py-3 rounded-2xl bg-[#ffffff] border-2 border-[#e8e5e0] hover:bg-[#f5f3f0] flex items-center justify-between text-sm font-semibold text-[#2d2d2d] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#d94d7a]" />
                    <span>Settings</span>
                  </div>
                  {showSettings ? <ChevronDown className="w-4 h-4 text-[#6b6b6b]" /> : <ChevronRight className="w-4 h-4 text-[#6b6b6b]" />}
                </button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#e8e5e0] space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-[#d94d7a]" />
                            <div>
                              <div className="text-sm font-medium text-[#2d2d2d]">Reasoning</div>
                              <div className="text-xs text-[#6b6b6b]">Always enabled</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded bg-[#f5f3f0] border border-[#e8e5e0] text-xs text-[#d94d7a] font-medium">
                            On
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-[#d94d7a]" />
                            <div>
                              <div className="text-sm font-medium text-[#2d2d2d]">Memory</div>
                              <div className="text-xs text-[#6b6b6b]">Session-based</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setOpenMemoryEnabled(!openMemoryEnabled)}
                            className={cn(
                              "relative w-11 h-6 rounded-full transition-colors",
                              openMemoryEnabled ? "bg-[#a8d5ba]" : "bg-[#d4c5b8]"
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
              
              <div className="p-4 rounded-2xl bg-[#ffffff] border-2 border-[#e8e5e0] text-xs text-[#6b6b6b]">
                <div className="flex items-center gap-2 mb-2 text-[#d94d7a]">
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
        <div className="flex-1 bg-[#ffffff] rounded-2xl border border-[#e8e5e0]/50 overflow-hidden flex flex-col shadow-2xl ">
          
                {/* Output Stage */}
                <div className="flex-1 p-8 overflow-y-auto min-h-[400px] bg-[#ffffff]" ref={scrollRef}>
            <AnimatePresence mode="wait">
              {mode === 'chat' ? (
                messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-24 h-24 rounded-full bg-[#ffffff] border-2 border-[#4a9eff]/50 flex items-center justify-center glow pulse-glow">
                      <MessageSquare className="w-12 h-12 text-[#d94d7a]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-[#2d2d2d] mb-2">Start a conversation</p>
                      <p className="text-sm text-[#6b6b6b]">
                        {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model to begin'}
                      </p>
                    </div>
                    {selectedModelInfo && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 rounded-xl bg-[#ffffff] border border-[#e8e5e0]/50 text-xs text-left max-w-md "
                      >
                        <div className="text-[#d94d7a] font-semibold mb-1">{selectedModelInfo.name}</div>
                        <div className="text-[#6b6b6b]">{selectedModelInfo.description}</div>
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
                            ? "bg-[#e0f0ff] border-[#b8c5ff] text-[#2d2d2d]" 
                            : "bg-[#ffb3d1] border-[#ffb3d1] text-[#2d2d2d]"
                        )}>
                          {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={cn(
                          "flex-1 p-5 rounded-2xl text-sm leading-relaxed border-2 transition-all",
                          msg.role === 'user' 
                            ? "bg-[#e0f0ff] text-[#2d2d2d] border-[#b8c5ff] rounded-tr-none" 
                            : "bg-[#ffe0ed] text-[#2d2d2d] border-[#ffb3d1] rounded-tl-none"
                        )}>
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          {msg.reasoning && (
                            <div className="mt-3 pt-3 border-t border-[#e8e5e0]">
                              <div className="flex items-center gap-2 text-xs text-[#d94d7a]">
                                <Brain className="w-3 h-3" />
                                <span>
                                  Reasoning: {msg.reasoning.mode} 
                                  {msg.reasoning.confidence && ` (${(msg.reasoning.confidence * 100).toFixed(0)}% confidence)`}
                                </span>
                              </div>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => copyMessage(msg.content)}
                              className="p-1.5 rounded hover:bg-[#f5f3f0] transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3 text-[#6b6b6b]" />
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
                        <div className="w-10 h-10 rounded-full bg-[#4a9eff] flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-[#2d2d2d]" />
                        </div>
                        <div className="flex-1 p-5 rounded-2xl bg-[#ffe0ed] border-2 border-[#ffb3d1] text-[#6b6b6b] text-sm flex items-center gap-2 rounded-tl-none">
                          <Loader2 className="w-4 h-4 animate-spin text-[#d94d7a]" />
                          <span className="text-[#2d2d2d]">Thinking...</span>
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
                        className="max-w-full max-h-[70vh] rounded-2xl border-2 border-[#e8e5e0]/50 shadow-2xl "
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `generated-${Date.now()}.png`;
                            link.click();
                          }}
                          className="p-2 rounded bg-[#ffffff] border border-[#e8e5e0] hover:bg-[#f5f3f0] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-[#2d2d2d]" />
                        </button>
                        <button
                          onClick={() => copyMessage(generatedImage)}
                          className="p-2 rounded bg-[#ffffff] border border-[#e8e5e0] hover:bg-[#f5f3f0] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4 text-[#2d2d2d]" />
                        </button>
                      </div>
                    </motion.div>
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#e8e5e0]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#4a9eff] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#d94d7a] font-medium">Generating image...</p>
                      <p className="text-xs text-[#6b6b6b]">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-[#ffe0ed] border-2 border-[#ffb3d1] flex items-center justify-center mx-auto">
                        <ImageIcon className="w-12 h-12 text-[#d94d7a]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#2d2d2d] mb-2">Generate an Image</p>
                        <p className="text-sm text-[#6b6b6b]">
                          {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model and enter a prompt'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6">
                  {generatedVideo ? (
                    <motion.video
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      src={generatedVideo}
                      controls
                      className="max-w-full max-h-[70vh] rounded-2xl border-2 border-[#e8e5e0]"
                    />
                    <div className="mt-4 text-center">
                      <a
                        href={generatedVideo}
                        download={`generated-video-${Date.now()}.mp4`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#ffb3d1] text-[#2d2d2d] font-medium hover:bg-[#ffa0c7] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Video
                      </a>
                    </div>
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#e8e5e0]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#ffb3d1] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#d94d7a] font-medium">Generating video...</p>
                      <p className="text-xs text-[#6b6b6b]">This may take several minutes</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 rounded-full bg-[#ffe0ed] border-2 border-[#ffb3d1] flex items-center justify-center mx-auto">
                        <Video className="w-12 h-12 text-[#d94d7a]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-[#2d2d2d] mb-2">Generate a Video</p>
                        <p className="text-sm text-[#6b6b6b]">
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
          <div className="p-4 bg-[#f5f3f0] border-t border-[#e8e5e0]">
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
                      ? "Type your message... (Shift+Enter for new line)" 
                      : mode === 'image'
                      ? "Describe the image you want to generate..."
                      : "Describe the video you want to create..."
                  }
                  className="w-full bg-[#ffffff] text-[#2d2d2d] rounded-xl px-5 py-4 pr-14 border border-[#e8e5e0]/50 focus:border-[#4a9eff] focus:ring-2 focus:ring-[#4a9eff]/20 outline-none resize-none min-h-[60px] max-h-[200px] placeholder:text-[#6b6b6b] transition-all"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {messages.length > 0 && mode === 'chat' && (
                    <button
                      onClick={clearChat}
                      className="p-1.5 rounded hover:bg-[#f5f3f0] transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4 text-[#6b6b6b]" />
                    </button>
                  )}
                </div>
              </div>
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={cn(
                  "p-3 rounded-lg transition-all flex items-center justify-center",
                  isLoading || !input.trim()
                    ? "bg-[#3a3a3a] text-[#6b6b6b] cursor-not-allowed"
                    : "bg-[#4a9eff] text-[#2d2d2d] hover:bg-[#3a8ee0] shadow-lg hover:shadow-[#4a9eff]/50"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#6b6b6b]/60">
              <div className="flex items-center gap-4">
                {selectedModelInfo && (
                  <span>Model: <span className="text-[#d94d7a]">{selectedModelInfo.name}</span></span>
                )}
                {openMemoryEnabled && (
                  <span className="flex items-center gap-1">
                    <Database className="w-3 h-3" />
                    Memory enabled
                  </span>
                )}
              </div>
              <span>Press Enter to send, Shift+Enter for new line</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
