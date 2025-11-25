"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, MessageSquare, Loader2, Sparkles, Command, Terminal, Video, ChevronDown, ChevronRight, Zap, Brain, Database, Settings, Copy, Download, Share2, History, Trash2, X, Maximize2, Minimize2, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PROVIDER_GROUPS, getProviderGroupsByType, type Model } from '@/lib/models';

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
  const selectedModelInfo = providerGroups.flatMap(g => g.models).find(m => m.id === selectedModel);

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
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-[#3a3a3a] bg-[#1a1a1a] sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#4a9eff]" />
            </div>
            <h1 className="text-xl font-semibold text-white">az.ai <span className="opacity-50 font-normal">Playground</span></h1>
            {selectedModelInfo && (
              <div className="hidden md:flex items-center gap-2 px-2 py-1 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-xs">
                <span className="text-[#888888]">Model:</span>
                <span className="text-[#4a9eff] font-medium">{selectedModelInfo.name}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded hover:bg-[#2a2a2a] transition-colors"
            >
              <Settings className="w-5 h-5 text-[#888888]" />
            </button>
            
            <nav className="flex items-center space-x-1 bg-[#2a2a2a] p-1 rounded border border-[#3a3a3a]">
              <button
                onClick={() => setMode('chat')}
                className={cn(
                  "px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  mode === 'chat' ? "bg-[#4a9eff] text-white" : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button
                onClick={() => setMode('image')}
                className={cn(
                  "px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  mode === 'image' ? "bg-[#4a9eff] text-white" : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
                )}
              >
                <ImageIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Image</span>
              </button>
              <button
                onClick={() => setMode('video')}
                className={cn(
                  "px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2",
                  mode === 'video' ? "bg-[#4a9eff] text-white" : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
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
                  <label className="text-xs font-semibold text-[#888888] uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3 h-3 text-[#4a9eff]" />
                    Models
                  </label>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-1 rounded hover:bg-[#2a2a2a]"
                  >
                    <X className="w-4 h-4 text-[#888888]" />
                  </button>
                </div>
                <div className="space-y-1">
                  {providerGroups.map(group => {
                    const isExpanded = expandedProviders.has(group.id);
                    return (
                      <div key={group.id} className="border border-[#3a3a3a] rounded overflow-hidden bg-[#2a2a2a]">
                        <button
                          onClick={() => toggleProvider(group.id)}
                          className="w-full text-left px-3 py-2 hover:bg-[#1a1a1a] transition-colors flex items-center justify-between text-sm font-medium text-white"
                        >
                          <span>{group.name}</span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-[#888888]" /> : <ChevronRight className="w-4 h-4 text-[#888888]" />}
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
                                      "w-full text-left px-3 py-2 rounded text-sm transition-colors group",
                                      selectedModel === model.id 
                                        ? "bg-[#4a9eff] text-white" 
                                        : "text-[#888888] hover:text-white hover:bg-[#1a1a1a]"
                                    )}
                                  >
                                    <div className="font-medium flex items-center justify-between">
                                      <span>{model.name}</span>
                                      {model.speed === 'fast' && (
                                        <Zap className="w-3 h-3 text-[#4a9eff] opacity-70" />
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
                  className="w-full px-3 py-2 rounded border border-[#3a3a3a] bg-[#2a2a2a] hover:bg-[#1a1a1a] flex items-center justify-between text-sm font-medium text-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#4a9eff]" />
                    <span>Settings</span>
                  </div>
                  {showSettings ? <ChevronDown className="w-4 h-4 text-[#888888]" /> : <ChevronRight className="w-4 h-4 text-[#888888]" />}
                </button>
                
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded border border-[#3a3a3a] bg-[#2a2a2a] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Brain className="w-4 h-4 text-[#4a9eff]" />
                            <div>
                              <div className="text-sm font-medium text-white">Reasoning</div>
                              <div className="text-xs text-[#888888]">Always enabled</div>
                            </div>
                          </div>
                          <div className="px-2 py-1 rounded bg-[#1a1a1a] border border-[#3a3a3a] text-xs text-[#4a9eff] font-medium">
                            On
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-[#4a9eff]" />
                            <div>
                              <div className="text-sm font-medium text-white">Memory</div>
                              <div className="text-xs text-[#888888]">Session-based</div>
                            </div>
                          </div>
                          <button
                            onClick={() => setOpenMemoryEnabled(!openMemoryEnabled)}
                            className={cn(
                              "relative w-11 h-6 rounded-full transition-colors",
                              openMemoryEnabled ? "bg-[#4a9eff]" : "bg-[#3a3a3a]"
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
              
              <div className="p-4 rounded border border-[#3a3a3a] bg-[#2a2a2a] text-xs text-[#888888]">
                <div className="flex items-center gap-2 mb-2 text-[#4a9eff]">
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
        <div className="flex-1 bg-[#2a2a2a] rounded-lg border border-[#3a3a3a] overflow-hidden flex flex-col shadow-lg">
          
          {/* Output Stage */}
          <div className="flex-1 p-6 overflow-y-auto min-h-[400px] bg-[#1a1a1a]" ref={scrollRef}>
            <AnimatePresence mode="wait">
              {mode === 'chat' ? (
                messages.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-20 h-20 rounded-full bg-[#2a2a2a] border-2 border-[#4a9eff] flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-[#4a9eff]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-white mb-2">Start a conversation</p>
                      <p className="text-sm text-[#888888]">
                        {selectedModelInfo ? `Using ${selectedModelInfo.name}` : 'Select a model to begin'}
                      </p>
                    </div>
                    {selectedModelInfo && (
                      <div className="mt-4 p-3 rounded bg-[#2a2a2a] border border-[#3a3a3a] text-xs text-left max-w-md">
                        <div className="text-[#4a9eff] font-medium mb-1">{selectedModelInfo.name}</div>
                        <div className="text-[#888888]">{selectedModelInfo.description}</div>
                      </div>
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
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2",
                          msg.role === 'user' 
                            ? "bg-[#2a2a2a] border-[#3a3a3a] text-white" 
                            : "bg-[#4a9eff] border-[#4a9eff] text-white"
                        )}>
                          {msg.role === 'user' ? 'U' : 'AI'}
                        </div>
                        <div className={cn(
                          "flex-1 p-4 rounded-lg text-sm leading-relaxed border transition-all",
                          msg.role === 'user' 
                            ? "bg-[#2a2a2a] text-white border-[#3a3a3a] rounded-tr-none" 
                            : "bg-[#2a2a2a] text-white border-[#3a3a3a] rounded-tl-none"
                        )}>
                          <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          {msg.reasoning && (
                            <div className="mt-3 pt-3 border-t border-[#3a3a3a]">
                              <div className="flex items-center gap-2 text-xs text-[#4a9eff]">
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
                              className="p-1.5 rounded hover:bg-[#1a1a1a] transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3 h-3 text-[#888888]" />
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
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                        </div>
                        <div className="flex-1 p-4 rounded-lg bg-[#2a2a2a] border border-[#3a3a3a] text-[#888888] text-sm flex items-center gap-2 rounded-tl-none">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Thinking...</span>
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
                        className="max-w-full max-h-[70vh] rounded-lg border-2 border-[#3a3a3a] shadow-xl"
                      />
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = generatedImage;
                            link.download = `generated-${Date.now()}.png`;
                            link.click();
                          }}
                          className="p-2 rounded bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors"
                          title="Download"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => copyMessage(generatedImage)}
                          className="p-2 rounded bg-[#2a2a2a] border border-[#3a3a3a] hover:bg-[#1a1a1a] transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </motion.div>
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#3a3a3a]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#4a9eff] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#4a9eff] font-medium">Generating image...</p>
                      <p className="text-xs text-[#888888]">This may take a moment</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-[#2a2a2a] border-2 border-[#4a9eff] flex items-center justify-center mx-auto">
                        <ImageIcon className="w-10 h-10 text-[#4a9eff]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-white mb-2">Generate an Image</p>
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
                    <motion.video
                      initial={{ opacity: 0, scale: 0.9 }} 
                      animate={{ opacity: 1, scale: 1 }}
                      src={generatedVideo}
                      controls
                      className="max-w-full max-h-[70vh] rounded-lg border-2 border-[#3a3a3a] shadow-xl"
                    />
                  ) : isLoading ? (
                    <div className="text-center space-y-4">
                      <div className="relative w-24 h-24 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[#3a3a3a]"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-[#4a9eff] border-t-transparent animate-spin"></div>
                      </div>
                      <p className="text-[#4a9eff] font-medium">Generating video...</p>
                      <p className="text-xs text-[#888888]">This may take several minutes</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-[#2a2a2a] border-2 border-[#4a9eff] flex items-center justify-center mx-auto">
                        <Video className="w-10 h-10 text-[#4a9eff]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-white mb-2">Generate a Video</p>
                        <p className="text-sm text-[#888888]">
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
          <div className="p-4 bg-[#1a1a1a] border-t border-[#3a3a3a]">
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
                  className="w-full bg-[#2a2a2a] text-white rounded-lg px-4 py-3 pr-12 border border-[#3a3a3a] focus:border-[#4a9eff] focus:ring-1 focus:ring-[#4a9eff] outline-none resize-none min-h-[60px] max-h-[200px] placeholder:text-[#888888] transition-all"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  {messages.length > 0 && mode === 'chat' && (
                    <button
                      onClick={clearChat}
                      className="p-1.5 rounded hover:bg-[#1a1a1a] transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4 text-[#888888]" />
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
                    ? "bg-[#3a3a3a] text-[#888888] cursor-not-allowed"
                    : "bg-[#4a9eff] text-white hover:bg-[#3a8ee0] shadow-lg hover:shadow-[#4a9eff]/50"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#888888]/60">
              <div className="flex items-center gap-4">
                {selectedModelInfo && (
                  <span>Model: <span className="text-[#4a9eff]">{selectedModelInfo.name}</span></span>
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
