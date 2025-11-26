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
            
            // Process ALL models from the API - no filtering
            // DeepInfra API should return all available models across all categories
            console.log(`[Models] Fetched ${modelsArray.length} models from DeepInfra API`);
            
            deepInfraModels = modelsArray.map((model: any) => {
              const modelId = model.id || model.name || '';
              const parts = modelId.split('/');
              const provider = parts[0] || 'DeepInfra';
              const modelName = parts[1] || modelId;
              const lowerId = modelId.toLowerCase();
              
              // Determine model type - check for video models first
              // DeepInfra has text-to-video models - check model object for category/type if available
              let type: 'chat' | 'image' | 'video' = 'chat';
              
              // Check model metadata first (if API provides it)
              if (model.category) {
                const category = String(model.category).toLowerCase();
                if (category.includes('video') || category.includes('text-to-video')) {
                  type = 'video';
                } else if (category.includes('image') || category.includes('text-to-image')) {
                  type = 'image';
                } else if (category.includes('text') || category.includes('generation')) {
                  type = 'chat';
                }
              }
              
              // Fallback to pattern matching if no category
              if (type === 'chat') {
                if (lowerId.includes('veo') || 
                    lowerId.includes('video') ||
                    lowerId.includes('cogvideo') ||
                    lowerId.includes('runway') ||
                    lowerId.includes('pika') ||
                    lowerId.includes('kling') ||
                    lowerId.includes('luma') ||
                    lowerId.includes('text-to-video') ||
                    lowerId.includes('texttovideo')) {
                  type = 'video';
                } else if (lowerId.includes('stable-diffusion') || 
                           lowerId.includes('flux') || 
                           lowerId.includes('sdxl') || 
                           lowerId.includes('imagen') ||
                           lowerId.includes('dalle') ||
                           lowerId.includes('midjourney') ||
                           lowerId.includes('black-forest-labs') ||
                           lowerId.includes('text-to-image') ||
                           lowerId.includes('texttoimage') ||
                           lowerId.includes('bria') ||
                           lowerId.includes('seedream')) {
                  type = 'image';
                } else if (lowerId.includes('whisper') ||
                           lowerId.includes('audio') ||
                           lowerId.includes('tts') ||
                           lowerId.includes('speech') ||
                           lowerId.includes('voxtral')) {
                  // Audio/speech models are treated as chat (they use chat completions endpoint)
                  type = 'chat';
                } else if (lowerId.includes('embedding') ||
                           lowerId.includes('bge') ||
                           lowerId.includes('gte') ||
                           lowerId.includes('e5') ||
                           lowerId.includes('sentence-transformers') ||
                           lowerId.includes('reranker')) {
                  // Embedding/reranker models are treated as chat
                  type = 'chat';
                }
              }
              
              // Determine speed
              let speed: 'fast' | 'medium' | 'slow' | undefined = undefined;
              if (lowerId.includes('turbo') || 
                  lowerId.includes('flash') || 
                  lowerId.includes('8b') || 
                  lowerId.includes('7b') ||
                  lowerId.includes('fast') ||
                  lowerId.includes('small')) {
                speed = 'fast';
              } else if (lowerId.includes('70b') || 
                         lowerId.includes('72b') ||
                         lowerId.includes('large')) {
                speed = 'medium';
              } else if (lowerId.includes('405b') ||
                         lowerId.includes('235b') ||
                         lowerId.includes('480b')) {
                speed = 'slow';
              }
              
              // Determine route based on type
              let route: string;
              if (type === 'video') {
                route = '/api/deepinfra/v1/videos/generations';
              } else if (type === 'image') {
                route = '/api/deepinfra/v1/images/generations';
              } else {
                route = '/api/deepinfra/v1/chat/completions';
              }
              
              // Format model name nicely
              const formattedName = modelName
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase())
                .replace(/Hf\b/g, 'HF')
                .replace(/Instruct\b/g, 'Instruct')
                .replace(/Chat\b/g, 'Chat');
              
              return {
                id: modelId,
                name: formattedName,
                description: model.description || `${provider} ${formattedName}`,
                type,
                provider: provider.charAt(0).toUpperCase() + provider.slice(1),
                speed,
                route,
              };
            });
          }
        } catch (error) {
          console.error('Failed to fetch DeepInfra models:', error);
        }

        // Helper to check if two models are duplicates
        // Only considers them duplicates if they're clearly the same model
        const areModelsDuplicate = (model1: Model, model2: Model): boolean => {
          // Exact ID match
          if (model1.id === model2.id) return true;
          
          // Same provider and very similar names (after normalization)
          const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/\./g, '');
          const name1 = normalize(model1.name);
          const name2 = normalize(model2.name);
          
          // If names are identical after normalization and same provider, likely duplicate
          if (name1 === name2 && model1.provider === model2.provider) {
            return true;
          }
          
          // Check for common variations (e.g., "gpt-4" vs "gpt4" vs "gpt 4")
          const variants = [
            ['gpt35', 'gpt3.5', 'gpt-3.5', 'gpt 3.5'],
            ['gpt4', 'gpt-4', 'gpt 4'],
            ['gpt4turbo', 'gpt-4-turbo', 'gpt 4 turbo'],
            ['gpt5', 'gpt-5', 'gpt 5'],
            ['claudeopus', 'claude-opus', 'claude opus'],
            ['claudesonnet', 'claude-sonnet', 'claude sonnet'],
            ['gemini3pro', 'gemini-3-pro', 'gemini 3 pro'],
            ['gemini25pro', 'gemini-2.5-pro', 'gemini 2.5 pro'],
            ['gemini25flash', 'gemini-2.5-flash', 'gemini 2.5 flash'],
            ['llama3', 'llama-3', 'llama 3'],
            ['llama4', 'llama-4', 'llama 4'],
            ['qwen25', 'qwen-2.5', 'qwen 2.5', 'qwen2.5'],
            ['qwen3', 'qwen-3', 'qwen 3'],
            ['deepseekv3', 'deepseek-v3', 'deepseek v3'],
            ['deepseekr1', 'deepseek-r1', 'deepseek r1'],
          ];
          
          for (const variantGroup of variants) {
            if (variantGroup.some(v => name1.includes(v)) && 
                variantGroup.some(v => name2.includes(v)) &&
                model1.provider === model2.provider) {
              return true;
            }
          }
          
          return false;
        };

        // Helper to get model quality score (higher is better)
        const getModelScore = (model: Model): number => {
          let score = 0;
          // Prefer models with speed indicators
          if (model.speed === 'fast') score += 3;
          else if (model.speed === 'medium') score += 2;
          else if (model.speed === 'slow') score += 1;
          // Prefer models with routes (more complete)
          if (model.route) score += 2;
          // Prefer models with better descriptions
          if (model.description && model.description.length > 20) score += 1;
          // Prefer models from PROVIDER_GROUPS (more curated)
          return score;
        };

        // Combine all models with proper deduplication
        const allModels: Model[] = [];
        const modelIdSet = new Set<string>(); // Track exact IDs to avoid exact duplicates
        
        // Helper to find duplicate in existing models
        const findDuplicate = (model: Model): Model | undefined => {
          return allModels.find(existing => areModelsDuplicate(model, existing));
        };
        
        // Add all models from PROVIDER_GROUPS (highest priority - most curated)
        PROVIDER_GROUPS.forEach(group => {
          group.models.forEach(model => {
            if (!modelIdSet.has(model.id)) {
              const duplicate = findDuplicate(model);
              if (!duplicate) {
                allModels.push(model);
                modelIdSet.add(model.id);
              } else if (getModelScore(model) > getModelScore(duplicate)) {
                // Replace duplicate with better version
                const index = allModels.indexOf(duplicate);
                allModels[index] = model;
                modelIdSet.add(model.id);
              }
            }
          });
        });
        
        // Add all G4F models (lower priority - only if not duplicate)
        (G4F_MODEL_LIST as Model[]).forEach(model => {
          if (!modelIdSet.has(model.id)) {
            const duplicate = findDuplicate(model);
            if (!duplicate) {
              allModels.push(model);
              modelIdSet.add(model.id);
            } else if (getModelScore(model) > getModelScore(duplicate)) {
              // Replace duplicate with better version
              const index = allModels.indexOf(duplicate);
              allModels[index] = model;
              modelIdSet.add(model.id);
            }
          }
        });
        
        // Add static DeepInfra models (convert from string IDs to Model objects)
        DEEPINFRA_MODELS.forEach(modelId => {
          if (!modelIdSet.has(modelId)) {
            const parts = modelId.split('/');
            const provider = parts[0] || 'DeepInfra';
            const modelName = parts[1] || modelId;
            const lowerId = modelId.toLowerCase();
            
            // Determine model type - check for video models first
            let type: 'chat' | 'image' | 'video' = 'chat';
            if (lowerId.includes('veo') || 
                lowerId.includes('video') ||
                lowerId.includes('cogvideo') ||
                lowerId.includes('runway') ||
                lowerId.includes('pika') ||
                lowerId.includes('kling') ||
                lowerId.includes('luma') ||
                lowerId.includes('text-to-video') ||
                lowerId.includes('texttovideo')) {
              type = 'video';
            } else if (lowerId.includes('stable-diffusion') || 
                       lowerId.includes('flux') || 
                       lowerId.includes('sdxl') || 
                       lowerId.includes('imagen') ||
                       lowerId.includes('dalle') ||
                       lowerId.includes('midjourney') ||
                       lowerId.includes('black-forest-labs') ||
                       lowerId.includes('text-to-image') ||
                       lowerId.includes('texttoimage') ||
                       lowerId.includes('bria') ||
                       lowerId.includes('seedream')) {
              type = 'image';
            } else if (lowerId.includes('whisper') ||
                       lowerId.includes('audio') ||
                       lowerId.includes('tts') ||
                       lowerId.includes('speech') ||
                       lowerId.includes('voxtral')) {
              type = 'chat'; // Audio/speech models use chat endpoint
            } else if (lowerId.includes('embedding') ||
                       lowerId.includes('bge') ||
                       lowerId.includes('gte') ||
                       lowerId.includes('e5') ||
                       lowerId.includes('sentence-transformers') ||
                       lowerId.includes('reranker')) {
              type = 'chat'; // Embedding/reranker models use chat endpoint
            }
            
            // Determine speed
            let speed: 'fast' | 'medium' | 'slow' | undefined = undefined;
            if (lowerId.includes('turbo') || 
                lowerId.includes('flash') || 
                lowerId.includes('8b') || 
                lowerId.includes('7b') ||
                lowerId.includes('fast') ||
                lowerId.includes('small')) {
              speed = 'fast';
            } else if (lowerId.includes('70b') || 
                       lowerId.includes('72b') ||
                       lowerId.includes('large')) {
              speed = 'medium';
            } else if (lowerId.includes('405b') ||
                       lowerId.includes('235b') ||
                       lowerId.includes('480b')) {
              speed = 'slow';
            }
            
            // Determine route based on type
            let route: string;
            if (type === 'video') {
              route = '/api/deepinfra/v1/videos/generations';
            } else if (type === 'image') {
              route = '/api/deepinfra/v1/images/generations';
            } else {
              route = '/api/deepinfra/v1/chat/completions';
            }
            
            // Format model name nicely
            const formattedName = modelName
              .replace(/-/g, ' ')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase())
              .replace(/Hf\b/g, 'HF')
              .replace(/Instruct\b/g, 'Instruct')
              .replace(/Chat\b/g, 'Chat');
            
            const model: Model = {
              id: modelId,
              name: formattedName,
              description: `${provider} ${formattedName}`,
              type,
              provider: provider.charAt(0).toUpperCase() + provider.slice(1),
              speed,
              route,
            };
            
            const duplicate = findDuplicate(model);
            if (!duplicate) {
              allModels.push(model);
              modelIdSet.add(model.id);
            } else if (getModelScore(model) > getModelScore(duplicate)) {
              // Replace duplicate with better version
              const index = allModels.indexOf(duplicate);
              allModels[index] = model;
              modelIdSet.add(model.id);
            }
          }
        });
        
        // Add fetched DeepInfra models (only if not duplicate)
        deepInfraModels.forEach(model => {
          if (!modelIdSet.has(model.id)) {
            const duplicate = findDuplicate(model);
            if (!duplicate) {
              allModels.push(model);
              modelIdSet.add(model.id);
            } else if (getModelScore(model) > getModelScore(duplicate)) {
              // Replace duplicate with better version
              const index = allModels.indexOf(duplicate);
              allModels[index] = model;
              modelIdSet.add(model.id);
            }
          }
        });

        // Log model counts for debugging
        const deepInfraCount = deepInfraModels.length;
        const totalBeforeGrouping = allModels.length;
        console.log(`[Models] Processing models - DeepInfra API: ${deepInfraCount}, Total unique: ${totalBeforeGrouping}`);
        
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
              aria-label="Search models"
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
          <div className="text-center py-16" role="status" aria-label="Loading models">
            <p className="text-[#888888] text-lg">Loading models...</p>
            <span className="sr-only">Loading models list...</span>
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

