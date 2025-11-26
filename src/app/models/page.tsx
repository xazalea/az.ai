"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Zap, Brain, Image as ImageIcon, Video, ChevronDown, ChevronRight, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PROVIDER_GROUPS, type Model, type ProviderGroup } from '@/lib/models';
import { G4F_MODEL_LIST } from '@/lib/g4f-model-list';
import { DEEPINFRA_MODELS } from '@/lib/deepinfra-models';
import Image from 'next/image';
import Link from 'next/link';

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<'all' | 'chat' | 'image' | 'video'>('all');
  const [allProviderGroups, setAllProviderGroups] = useState<ProviderGroup[]>(PROVIDER_GROUPS);
  const [loading, setLoading] = useState(true);

  // Fetch all models dynamically on mount
  useEffect(() => {
    const fetchAllModels = async () => {
      try {
        setLoading(true);
        
        // Fetch DeepInfra models from API
        let deepInfraModels: Model[] = [];
        try {
          const deepInfraResponse = await fetch('/api/deepinfra/v1/models');
          if (deepInfraResponse.ok) {
            const deepInfraData = await deepInfraResponse.json();
            const modelsArray = Array.isArray(deepInfraData) ? deepInfraData : (deepInfraData.data || []);
            
            deepInfraModels = modelsArray.map((model: any) => {
              const modelId = model.id || model.name || '';
              const parts = modelId.split('/');
              const provider = parts[0] || 'DeepInfra';
              const modelName = parts[1] || modelId;
              
              let type: 'chat' | 'image' | 'video' = 'chat';
              if (modelId.toLowerCase().includes('stable-diffusion') || 
                  modelId.toLowerCase().includes('flux') || 
                  modelId.toLowerCase().includes('sdxl') || 
                  modelId.toLowerCase().includes('imagen')) {
                type = 'image';
              }
              
              let speed: 'fast' | 'medium' | 'slow' | undefined = undefined;
              if (modelId.toLowerCase().includes('turbo') || 
                  modelId.toLowerCase().includes('flash') || 
                  modelId.toLowerCase().includes('8b') || 
                  modelId.toLowerCase().includes('7b')) {
                speed = 'fast';
              } else if (modelId.toLowerCase().includes('70b') || 
                         modelId.toLowerCase().includes('72b')) {
                speed = 'medium';
              }
              
              return {
                id: modelId,
                name: modelName.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: `${provider} ${modelName}`,
                type,
                provider: provider.charAt(0).toUpperCase() + provider.slice(1),
                speed,
                route: type === 'image' ? '/api/deepinfra/v1/images/generations' : '/api/deepinfra/v1/chat/completions',
              };
            });
          }
        } catch (error) {
          console.error('Failed to fetch DeepInfra models:', error);
        }

        // Combine all models - use all models from PROVIDER_GROUPS, G4F_MODEL_LIST, and fetched DeepInfra models
        const allModels: Model[] = [];
        const modelIdSet = new Set<string>();
        
        // Add all models from PROVIDER_GROUPS (without deduplication)
        PROVIDER_GROUPS.forEach(group => {
          group.models.forEach(model => {
            if (!modelIdSet.has(model.id)) {
              allModels.push(model);
              modelIdSet.add(model.id);
            }
          });
        });
        
        // Add all G4F models (these are already in Model format)
        (G4F_MODEL_LIST as Model[]).forEach(model => {
          if (!modelIdSet.has(model.id)) {
            allModels.push(model);
            modelIdSet.add(model.id);
          }
        });
        
        // Add static DeepInfra models (convert from string IDs to Model objects)
        DEEPINFRA_MODELS.forEach(modelId => {
          if (!modelIdSet.has(modelId)) {
            const parts = modelId.split('/');
            const provider = parts[0] || 'DeepInfra';
            const modelName = parts[1] || modelId;
            
            let type: 'chat' | 'image' | 'video' = 'chat';
            if (modelId.toLowerCase().includes('stable-diffusion') || 
                modelId.toLowerCase().includes('flux') || 
                modelId.toLowerCase().includes('sdxl') || 
                modelId.toLowerCase().includes('imagen')) {
              type = 'image';
            }
            
            let speed: 'fast' | 'medium' | 'slow' | undefined = undefined;
            if (modelId.toLowerCase().includes('turbo') || 
                modelId.toLowerCase().includes('flash') || 
                modelId.toLowerCase().includes('8b') || 
                modelId.toLowerCase().includes('7b')) {
              speed = 'fast';
            } else if (modelId.toLowerCase().includes('70b') || 
                       modelId.toLowerCase().includes('72b')) {
              speed = 'medium';
            }
            
            allModels.push({
              id: modelId,
              name: modelName.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              description: `${provider} ${modelName}`,
              type,
              provider: provider.charAt(0).toUpperCase() + provider.slice(1),
              speed,
              route: type === 'image' ? '/api/deepinfra/v1/images/generations' : '/api/deepinfra/v1/chat/completions',
            });
            modelIdSet.add(modelId);
          }
        });
        
        // Add fetched DeepInfra models (only if not already in static list)
        deepInfraModels.forEach(model => {
          if (!modelIdSet.has(model.id)) {
            allModels.push(model);
            modelIdSet.add(model.id);
          }
        });

        // Group all models by provider
        const providerMap = new Map<string, Model[]>();
        
        allModels.forEach(model => {
          const provider = model.provider || 'Other';
          if (!providerMap.has(provider)) {
            providerMap.set(provider, []);
          }
          providerMap.get(provider)!.push(model);
        });

        // Create provider groups
        const groups: ProviderGroup[] = Array.from(providerMap.entries()).map(([provider, models]) => ({
          id: provider.toLowerCase().replace(/\s+/g, '-'),
          name: provider,
          models: models.sort((a, b) => a.name.localeCompare(b.name)),
        }));

        // Sort groups by name
        groups.sort((a, b) => a.name.localeCompare(b.name));

        setAllProviderGroups(groups);
      } catch (error) {
        console.error('Error fetching models:', error);
        // Fallback to static models
        setAllProviderGroups(PROVIDER_GROUPS);
      } finally {
        setLoading(false);
      }
    };

    fetchAllModels();
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

  const expandAll = () => {
    const allIds = new Set(allProviderGroups.map(g => g.id));
    setExpandedProviders(allIds);
  };

  const collapseAll = () => {
    setExpandedProviders(new Set());
  };

  // Filter models based on search and type
  const filteredGroups = allProviderGroups.map(group => {
    let filteredModels = group.models.filter(model => {
      const matchesSearch = !searchQuery || 
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'all' || model.type === filterType;
      
      return matchesSearch && matchesType;
    });
    
    return { ...group, models: filteredModels };
  }).filter(group => group.models.length > 0);

  const totalModels = allProviderGroups.reduce((sum, group) => sum + group.models.length, 0);
  const filteredCount = filteredGroups.reduce((sum, group) => sum + group.models.length, 0);

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-[#e0e0e0] font-sans">
      {/* Header */}
      <header className="bg-[#1a1a1a] border-b border-[#3a3a3a] sticky top-0 z-20">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center max-w-7xl">
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="/az.png" 
              alt="az.ai logo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <span className="text-2xl font-bold text-[#e0e0e0]">az.ai</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/playground" className="text-[#888888] hover:text-[#e0e0e0] transition-colors text-sm font-medium">
              Playground
            </Link>
            <Link href="https://github.com/xazalea/az.ai" target="_blank" className="text-[#888888] hover:text-[#e0e0e0] transition-colors text-sm font-medium">
              GitHub
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-[#e0e0e0]">
            Available <span className="text-[#ffb3d1]">Models</span>
          </h1>
          <p className="text-xl text-[#888888] max-w-2xl mx-auto">
            Access {totalModels.toLocaleString()}+ AI models through a single unified API. From GPT-5 to Claude Opus, Gemini to DeepSeek, and everything in between.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#888888]" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#2d2d2d] border border-[#3a3a3a] text-[#e0e0e0] placeholder:text-[#888888] focus:outline-none focus:ring-2 focus:ring-[#ffb3d1] focus:border-[#ffb3d1] transition-all"
            />
          </div>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#888888]">Filter by type:</span>
                <div className="flex gap-2">
                  {(['all', 'chat', 'image', 'video'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        filterType === type
                          ? "bg-[#ffb3d1] text-[#2d2d2d]"
                          : "bg-[#2d2d2d] text-[#888888] hover:bg-[#3a3a3a] hover:text-[#e0e0e0] border border-[#3a3a3a]"
                      )}
                    >
                      {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-sm text-[#888888]">
                Showing {filteredCount.toLocaleString()} of {totalModels.toLocaleString()} models
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={expandAll}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2d2d2d] text-[#888888] hover:bg-[#3a3a3a] hover:text-[#e0e0e0] border border-[#3a3a3a] transition-all flex items-center gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2d2d2d] text-[#888888] hover:bg-[#3a3a3a] hover:text-[#e0e0e0] border border-[#3a3a3a] transition-all flex items-center gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Models Grid */}
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[#888888] text-lg">Loading models...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGroups.map(group => {
            const isExpanded = expandedProviders.has(group.id);
            return (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-[#3a3a3a] rounded-2xl overflow-hidden bg-[#2d2d2d]"
              >
                <button
                  onClick={() => toggleProvider(group.id)}
                  className="w-full text-left px-6 py-4 hover:bg-[#3a3a3a] transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-[#e0e0e0]">{group.name}</h2>
                    <span className="px-3 py-1 rounded-full bg-[#1a1a1a] text-xs text-[#888888] border border-[#3a3a3a]">
                      {group.models.length.toLocaleString()} {group.models.length === 1 ? 'model' : 'models'}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-[#888888]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#888888]" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {group.models.map(model => (
                        <motion.div
                          key={model.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 rounded-xl bg-[#1a1a1a] border border-[#3a3a3a] hover:border-[#ffb3d1] transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-[#e0e0e0] group-hover:text-[#ffb3d1] transition-colors">
                              {model.name}
                            </h3>
                            <div className="flex items-center gap-1">
                              {model.type === 'chat' && <Brain className="w-4 h-4 text-[#ffb3d1]" />}
                              {model.type === 'image' && <ImageIcon className="w-4 h-4 text-[#a8d5ba]" />}
                              {model.type === 'video' && <Video className="w-4 h-4 text-[#b8c5ff]" />}
                              {model.speed === 'fast' && <Zap className="w-3 h-3 text-[#ffb3d1]" />}
                            </div>
                          </div>
                          <p className="text-sm text-[#888888] mb-3">{model.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-[#888888]">{model.provider}</span>
                            <Link
                              href={`/playground?model=${encodeURIComponent(model.id)}&mode=${model.type}`}
                              className="text-xs text-[#ffb3d1] hover:text-[#ffa0c7] transition-colors font-medium"
                            >
                              Try →
                            </Link>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
          </div>
        )}

        {!loading && filteredGroups.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[#888888] text-lg">No models found matching your search.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-[#3a3a3a] bg-[#1a1a1a] mt-20">
        <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image 
              src="/az.png" 
              alt="az.ai logo" 
              width={32} 
              height={32}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-[#e0e0e0]">az.ai</span>
          </div>
          <div className="text-sm text-[#888888]">
            © 2025 az.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

