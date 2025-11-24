"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, MessageSquare, Loader2, Sparkles, Command, Terminal, Video, ChevronDown, ChevronRight, Zap, Brain, Database, Settings, Copy, Download, Share2, History, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PROVIDER_GROUPS, getProviderGroupsByType, type Model } from '@/lib/models';

export default function Playground() {
  const [mode, setMode] = useState<'chat' | 'image' | 'video'>('chat');
  const [selectedModel, setSelectedModel] = useState('qwen');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set(['openai', 'google', 'deepseek'])); // Default expanded
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', content: string, reasoning?: any, timestamp?: number }>>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [openMemoryEnabled, setOpenMemoryEnabled] = useState(false);
  const [reasoningEnabled, setReasoningEnabled] = useState(true); // OpenReason always enabled by default
  const [showSettings, setShowSettings] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{ id: string, title: string, messages: any[], timestamp: number }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, generatedImage, generatedVideo]);

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);

    if (mode === 'chat') {
      const newMessages = [...messages, { role: 'user' as const, content: input }];
      setMessages(newMessages);
      setInput('');

      try {
        // Query OpenMemory if enabled
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
                  content: `[Memory Context] ${m.content} (relevance: ${(m.score * 100).toFixed(1)}%)`,
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
            use_reasoning: reasoningEnabled, // OpenReason enhancement
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const content = data.choices?.[0]?.message?.content || "No response generated.";
        const reasoning = data.reasoning; // OpenReason metadata
        
        // Store in OpenMemory if enabled
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
        }]);
      } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error instanceof Error ? error.message : 'Failed to fetch response'}` }]);
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
        if (data.error) throw new Error(data.error);
        
        const url = data.data?.[0]?.url || data.data?.[0]?.b64_json 
          ? `data:image/png;base64,${data.data[0].b64_json || data.data[0].url.split(',')[1]}`
          : null;
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
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GOOGLE_API_KEY || ''}`,
          },
          body: JSON.stringify({
            prompt,
            model: selectedModel,
            duration: 8.0,
            aspect_ratio: '16:9'
          })
        });

        const data = await res.json();
        if (data.error) throw new Error(data.error);
        
        const videoUrl = data.data?.[0]?.url || null;
        if (videoUrl) setGeneratedVideo(videoUrl);
        else throw new Error("No video returned");

      } catch (error) {
        alert(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#424658] text-[#F0DAD5] font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-[#6C739C]/30 bg-[#424658]/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D9A69F] to-[#C56B62] flex items-center justify-center shadow-lg shadow-[#C56B62]/20">
                <Terminal className="w-5 h-5 text-white" />
             </div>
             <h1 className="text-xl font-bold tracking-tight text-[#F0DAD5]">az.ai <span className="opacity-50 font-light">Playground</span></h1>
          </div>
          
          <nav className="flex items-center space-x-1 bg-[#303340] p-1 rounded-lg border border-[#6C739C]/30">
            <button
              onClick={() => setMode('chat')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                mode === 'chat' ? "bg-[#6C739C] text-white shadow-sm" : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#6C739C]/20"
              )}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setMode('image')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                mode === 'image' ? "bg-[#D9A69F] text-[#424658] shadow-sm" : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#D9A69F]/20"
              )}
            >
              <ImageIcon className="w-4 h-4" />
              Imagine
            </button>
            <button
              onClick={() => setMode('video')}
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2",
                mode === 'video' ? "bg-[#C56B62] text-white shadow-sm" : "text-[#BABBB1] hover:text-[#F0DAD5] hover:bg-[#C56B62]/20"
              )}
            >
              <Video className="w-4 h-4" />
              Animate
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl flex gap-6">
        
        {/* Sidebar / Model Selection */}
        <div className="w-64 flex-shrink-0 space-y-4 hidden md:block overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="space-y-2">
                <label className="text-xs font-semibold text-[#BABBB1] uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-3 h-3" />
                  Models
                </label>
                <div className="space-y-1">
                    {providerGroups.map(group => {
                      const isExpanded = expandedProviders.has(group.id);
                      return (
                        <div key={group.id} className="border border-[#6C739C]/20 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleProvider(group.id)}
                            className="w-full text-left px-3 py-2 bg-[#6C739C]/10 hover:bg-[#6C739C]/20 transition-colors flex items-center justify-between text-sm font-medium text-[#F0DAD5]"
                          >
                            <span>{group.name}</span>
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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
                                      onClick={() => setSelectedModel(model.id)}
                                      className={cn(
                                        "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                                        selectedModel === model.id 
                                          ? "bg-[#6C739C]/20 text-[#D9A69F] border border-[#6C739C]/50" 
                                          : "text-[#F0DAD5]/80 hover:bg-[#6C739C]/10"
                                      )}
                                    >
                                      <div className="font-medium">{model.name}</div>
                                      <div className="text-xs text-[#BABBB1]/70 truncate">{model.description}</div>
                                      {model.speed === 'fast' && (
                                        <div className="flex items-center gap-1 mt-1">
                                          <Zap className="w-3 h-3 text-[#DEA785]" />
                                          <span className="text-xs text-[#DEA785]">Fast</span>
                                        </div>
                                      )}
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
                    className="w-full px-3 py-2 rounded-lg bg-[#6C739C]/10 hover:bg-[#6C739C]/20 border border-[#6C739C]/20 flex items-center justify-between text-sm font-medium text-[#F0DAD5] transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </div>
                    {showSettings ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                    {showSettings && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-3 rounded-lg bg-[#303340] border border-[#6C739C]/20 space-y-3">
                                {/* OpenReason - Always Enabled */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Brain className="w-4 h-4 text-[#DEA785]" />
                                        <div>
                                            <div className="text-sm font-medium text-[#F0DAD5]">OpenReason</div>
                                            <div className="text-xs text-[#BABBB1]/70">Reasoning Engine</div>
                                        </div>
                                    </div>
                                    <div className="px-2 py-1 rounded bg-[#DEA785]/20 text-xs text-[#DEA785] font-medium">
                                        Always On
                                    </div>
                                </div>
                                
                                {/* OpenMemory - Optional */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Database className="w-4 h-4 text-[#D9A69F]" />
                                        <div>
                                            <div className="text-sm font-medium text-[#F0DAD5]">OpenMemory</div>
                                            <div className="text-xs text-[#BABBB1]/70">Long-term Memory</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setOpenMemoryEnabled(!openMemoryEnabled)}
                                        className={cn(
                                            "relative w-11 h-6 rounded-full transition-colors",
                                            openMemoryEnabled ? "bg-[#D9A69F]" : "bg-[#6C739C]/30"
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
            
            <div className="p-4 rounded-xl bg-[#303340] border border-[#6C739C]/20 text-xs text-[#BABBB1]">
                <div className="flex items-center gap-2 mb-2 text-[#D9A69F]">
                    <Sparkles className="w-3 h-3" />
                    <span>Pro Tip</span>
                </div>
                <p>
                    {mode === 'chat' 
                        ? "OpenReason enhances all responses with advanced reasoning. Enable OpenMemory for context-aware conversations!" 
                        : mode === 'image'
                        ? "Be specific with your visual descriptions. Mention styles like 'oil painting' or 'cyberpunk'."
                        : "Describe the video scene you want. Include details about motion, camera angles, and style."}
                </p>
            </div>
        </div>

        {/* Interaction Area */}
        <div className="flex-1 bg-[#303340]/50 rounded-2xl border border-[#6C739C]/30 overflow-hidden flex flex-col shadow-2xl">
            
            {/* Output Stage */}
            <div className="flex-1 p-6 overflow-y-auto min-h-[400px]" ref={scrollRef}>
                <AnimatePresence mode="wait">
                    {mode === 'chat' ? (
                        messages.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-4 text-[#BABBB1]/50"
                            >
                                <MessageSquare className="w-16 h-16" />
                                <p className="text-lg font-medium">Start a conversation</p>
                                <p className="text-sm">Selected: {providerGroups.flatMap(g => g.models).find(m => m.id === selectedModel)?.name || selectedModel}</p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((msg, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                        key={idx} 
                                        className={cn(
                                            "flex gap-4 max-w-3xl",
                                            msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                            msg.role === 'user' ? "bg-[#D9A69F] text-[#424658]" : "bg-[#6C739C] text-white"
                                        )}>
                                            {msg.role === 'user' ? 'U' : 'AI'}
                                        </div>
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                                            msg.role === 'user' 
                                                ? "bg-[#D9A69F]/10 text-[#F0DAD5] border border-[#D9A69F]/20 rounded-tr-none" 
                                                : "bg-[#424658] text-[#F0DAD5] border border-[#6C739C]/30 rounded-tl-none"
                                        )}>
                                            {msg.content}
                                            {msg.reasoning && (
                                                <div className="mt-2 pt-2 border-t border-[#6C739C]/20">
                                                    <div className="flex items-center gap-2 text-xs text-[#DEA785]">
                                                        <Brain className="w-3 h-3" />
                                                        <span>Reasoning: {msg.reasoning.mode} ({msg.reasoning.confidence ? (msg.reasoning.confidence * 100).toFixed(0) : 'N/A'}% confidence)</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-[#6C739C] flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        </div>
                                        <div className="p-4 rounded-2xl bg-[#424658] border border-[#6C739C]/30 rounded-tl-none text-[#BABBB1] text-sm flex items-center gap-2">
                                            Thinking...
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    ) : mode === 'image' ? (
                        <div className="h-full flex flex-col items-center justify-center">
                            {generatedImage ? (
                                <motion.img 
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    src={generatedImage} 
                                    alt="Generated" 
                                    className="max-w-full max-h-[600px] rounded-lg shadow-2xl border-4 border-[#D9A69F]/20"
                                />
                            ) : (
                                isLoading ? (
                                    <div className="text-center space-y-4">
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-[#6C739C]/20"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-[#D9A69F] border-t-transparent animate-spin"></div>
                                        </div>
                                        <p className="text-[#D9A69F] animate-pulse">Dreaming up your image...</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 text-[#BABBB1]/50">
                                        <ImageIcon className="w-16 h-16 mx-auto" />
                                        <p className="text-lg font-medium">Enter a prompt to generate an image</p>
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                            {generatedVideo ? (
                                <motion.video
                                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                    src={generatedVideo}
                                    controls
                                    className="max-w-full max-h-[600px] rounded-lg shadow-2xl border-4 border-[#C56B62]/20"
                                />
                            ) : (
                                isLoading ? (
                                    <div className="text-center space-y-4">
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 rounded-full border-4 border-[#6C739C]/20"></div>
                                            <div className="absolute inset-0 rounded-full border-4 border-[#C56B62] border-t-transparent animate-spin"></div>
                                        </div>
                                        <p className="text-[#C56B62] animate-pulse">Crafting your video...</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-4 text-[#BABBB1]/50">
                                        <Video className="w-16 h-16 mx-auto" />
                                        <p className="text-lg font-medium">Enter a prompt to generate a video</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#303340] border-t border-[#6C739C]/30">
                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={mode === 'chat' ? "Type your message..." : mode === 'image' ? "Describe the image you want to see..." : "Describe the video you want to create..."}
                        className="w-full bg-[#424658] text-[#F0DAD5] rounded-xl px-4 py-3 pr-12 border border-[#6C739C]/30 focus:border-[#D9A69F] focus:ring-1 focus:ring-[#D9A69F] outline-none resize-none h-[60px] placeholder:text-[#BABBB1]/30 transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#D9A69F] text-[#424658] hover:bg-[#DEA785] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                </div>
                <div className="mt-2 text-center text-[10px] text-[#BABBB1]/40 uppercase tracking-widest">
                    Powered by az.ai unified infrastructure
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
