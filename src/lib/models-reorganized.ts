// Reorganized models by provider - merges g4f and deepinfra models into actual providers
import { G4F_MODEL_LIST } from './g4f-model-list';
import { DEEPINFRA_MODELS } from './deepinfra-models';
import type { Model, ProviderGroup } from './models';

// Helper to group models by provider
function groupModelsByProvider(allModels: Model[]): Map<string, Model[]> {
  const providerMap = new Map<string, Model[]>();
  
  allModels.forEach(model => {
    const provider = model.provider || 'Other';
    if (!providerMap.has(provider)) {
      providerMap.set(provider, []);
    }
    providerMap.get(provider)!.push(model);
  });
  
  return providerMap;
}

// Get all models from g4f and deepinfra, organized by provider
export function getReorganizedProviderGroups(): ProviderGroup[] {
  // Combine all models
  const allModels: Model[] = [
    // Package-based models
    { id: 'qwen', name: 'Qwen 2.5', description: 'General purpose coding & chat', type: 'chat', provider: 'Qwen', speed: 'fast', route: '/api/models/qwen-free-api/v1/chat/completions' },
    { id: 'qwen-code', name: 'Qwen Code', description: 'Specialized for coding', type: 'chat', provider: 'Qwen', route: '/api/models/qwen-free-api/v1/chat/completions' },
    { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'High performance general model', type: 'chat', provider: 'DeepSeek', speed: 'fast', route: '/api/models/deepseek-free-api/v1/chat/completions' },
    { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Reasoning focused', type: 'chat', provider: 'DeepSeek', route: '/api/models/deepseek-free-api/v1/chat/completions' },
    { id: 'glm-4', name: 'GLM-4', description: 'Strong agentic capabilities', type: 'chat', provider: 'GLM', route: '/api/models/glm-free-api/v1/chat/completions' },
    { id: 'doubao-pro-32k', name: 'Doubao Pro', description: 'Great Chinese understanding', type: 'chat', provider: 'Doubao', route: '/api/models/doubao-free-api/v1/chat/completions' },
    { id: 'kimi', name: 'Kimi', description: 'Long context specialist', type: 'chat', provider: 'Kimi', route: '/api/models/kimi-free-api/v1/chat/completions' },
    { id: 'minimax', name: 'MiniMax', description: 'Natural conversation', type: 'chat', provider: 'MiniMax', route: '/api/models/minimax-free-api/v1/chat/completions' },
    { id: 'step', name: 'Step-1', description: 'Multi-modal reasoning', type: 'chat', provider: 'Step', route: '/api/models/step-free-api/v1/chat/completions' },
    
    // g4f models
    ...(G4F_MODEL_LIST as Model[]),
    
    // DeepInfra models
    ...DEEPINFRA_MODELS.map(modelId => {
      const parts = modelId.split('/');
      const provider = parts[0] || 'DeepInfra';
      const modelName = parts[1] || modelId;
      
      let type: 'chat' | 'image' | 'video' = 'chat';
      if (modelId.toLowerCase().includes('stable-diffusion') || modelId.toLowerCase().includes('flux') || modelId.toLowerCase().includes('sdxl') || modelId.toLowerCase().includes('imagen')) {
        type = 'image';
      }
      
      let speed: 'fast' | 'medium' | 'slow' | undefined = undefined;
      if (modelId.toLowerCase().includes('turbo') || modelId.toLowerCase().includes('flash') || modelId.toLowerCase().includes('8b') || modelId.toLowerCase().includes('7b')) {
        speed = 'fast';
      } else if (modelId.toLowerCase().includes('70b') || modelId.toLowerCase().includes('72b')) {
        speed = 'medium';
      }
      
      return {
        id: modelId,
        name: modelName.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `${provider} ${modelName}`,
        type,
        provider: provider.charAt(0).toUpperCase() + provider.slice(1).replace(/-/g, ' '),
        speed,
        route: type === 'image' ? '/api/deepinfra/v1/images/generations' : '/api/deepinfra/v1/chat/completions',
      };
    }) as Model[],
    
    // Other models
    { id: 'groq', name: 'Groq LPU™', description: 'Ultra-fast inference', type: 'chat', provider: 'Groq', speed: 'fast', route: '/api/groq/v1/chat/completions' },
    { id: 'pollinations', name: 'Pollinations', description: 'Free text generation', type: 'chat', provider: 'Pollinations', speed: 'fast', route: '/api/pollinations/v1/chat/completions' },
    { id: 'dreamina', name: 'Dreamina AI', description: 'High-quality text-to-image & image-to-image (2K/4K)', type: 'image', provider: 'Dreamina', route: '/api/python/dreamina/v1/images/generations' },
    { id: 'jimeng-api', name: 'Jimeng', description: 'Advanced image generation', type: 'image', provider: 'Jimeng', route: '/api/jimeng-api/v1/images/generations' },
    { id: 'imagefx', name: 'ImageFX', description: 'Google ImageFX for photorealistic images', type: 'image', provider: 'Google', route: '/api/services/imagefx/v1/images/generations' },
    { id: 'viggle', name: 'Viggle AI', description: 'Meme creation & animation', type: 'video', provider: 'Viggle', route: '/api/services/viggle/v1/videos/generations' },
  ];
  
  // Group by provider
  const providerMap = groupModelsByProvider(allModels);
  
  // Create provider groups
  const groups: ProviderGroup[] = [];
  
  // Define provider order
  const providerOrder = [
    'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral AI', 'DeepSeek', 'Qwen', 
    'xAI', 'Groq', 'GLM', 'Doubao', 'Kimi', 'MiniMax', 'Step', 'Jimeng',
    'Dreamina', 'Viggle', 'Pollinations', 'Stability AI', 'Black Forest Labs',
    'Bria', 'NVIDIA', 'Microsoft', '01.AI', 'Other'
  ];
  
  providerOrder.forEach(provider => {
    const models = providerMap.get(provider) || [];
    if (models.length > 0) {
      groups.push({
        id: provider.toLowerCase().replace(/\s+/g, '-'),
        name: provider,
        models: models.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  });
  
  // Add remaining providers
  providerMap.forEach((models, provider) => {
    if (!providerOrder.includes(provider)) {
      groups.push({
        id: provider.toLowerCase().replace(/\s+/g, '-'),
        name: provider,
        models: models.sort((a, b) => a.name.localeCompare(b.name)),
      });
    }
  });
  
  return groups;
}

