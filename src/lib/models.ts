// Comprehensive model list organized by provider
// Models are deduplicated - fastest version is kept when duplicates exist
import { G4F_MODEL_LIST } from './g4f-model-list';
import { DEEPINFRA_MODELS } from './deepinfra-models';

export interface Model {
  id: string;
  name: string;
  description: string;
  type: 'chat' | 'image' | 'video';
  provider: string;
  speed?: 'fast' | 'medium' | 'slow'; // For fastest selection
  route?: string; // API route for this model
}

export interface ProviderGroup {
  id: string;
  name: string;
  icon?: string;
  models: Model[];
}

// Model registry for deduplication - maps canonical name to fastest model
const MODEL_REGISTRY: Map<string, Model> = new Map();

function registerModel(model: Model, canonicalName: string) {
  const existing = MODEL_REGISTRY.get(canonicalName);
  if (!existing) {
    MODEL_REGISTRY.set(canonicalName, model);
  } else {
    // Keep fastest version
    const existingSpeed = existing.speed === 'fast' ? 3 : existing.speed === 'medium' ? 2 : 1;
    const newSpeed = model.speed === 'fast' ? 3 : model.speed === 'medium' ? 2 : 1;
    if (newSpeed > existingSpeed) {
      MODEL_REGISTRY.set(canonicalName, model);
    }
  }
}

// Helper to get canonical model name (for deduplication)
function getCanonicalName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/gpt35|gpt3\.5/g, 'gpt35')
    .replace(/gpt4/g, 'gpt4')
    .replace(/claude/g, 'claude')
    .replace(/gemini/g, 'gemini')
    .replace(/llama/g, 'llama')
    .replace(/qwen/g, 'qwen')
    .replace(/deepseek/g, 'deepseek')
    .replace(/mistral/g, 'mistral');
}

export const PROVIDER_GROUPS: ProviderGroup[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-5.1-high', name: 'GPT-5.1 High', description: 'Latest high-performance model', type: 'chat', provider: 'OpenAI', speed: 'fast', route: '/api/services/gpt4freejs/v1/chat/completions' },
      { id: 'gpt-5-chat', name: 'GPT-5 Chat', description: 'GPT-5 conversational model', type: 'chat', provider: 'OpenAI', speed: 'fast', route: '/api/services/gpt4freejs/v1/chat/completions' },
      { id: 'gpt-4', name: 'GPT-4', description: 'GPT-4 model', type: 'chat', provider: 'OpenAI', speed: 'medium', route: '/api/services/gpt4freejs/v1/chat/completions' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', type: 'chat', provider: 'OpenAI', speed: 'fast', route: '/api/services/gpt4freejs/v1/chat/completions' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'ChatGPT model', type: 'chat', provider: 'OpenAI', speed: 'fast', route: '/api/services/gpt4freejs/v1/chat/completions' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', description: 'Most capable Claude model', type: 'chat', provider: 'Anthropic', route: '/api/python/webai/v1/chat/completions' },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Balanced performance', type: 'chat', provider: 'Anthropic', speed: 'fast', route: '/api/python/webai/v1/chat/completions' },
      { id: 'claude-code', name: 'Claude Code', description: 'Specialized for coding', type: 'chat', provider: 'Anthropic', route: '/api/python/webai/v1/chat/completions' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Latest Pro model', type: 'chat', provider: 'Google', route: '/api/python/webai/v1/chat/completions' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High performance Pro', type: 'chat', provider: 'Google', route: '/api/python/webai/v1/chat/completions' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient', type: 'chat', provider: 'Google', speed: 'fast', route: '/api/python/webai/v1/chat/completions' },
      { id: 'gemini-multimodal', name: 'Gemini Multimodal', description: 'Multimodal capabilities', type: 'chat', provider: 'Google', route: '/api/python/gemini-multimodal/v1/chat/completions' },
      { id: 'imagen-3', name: 'Imagen 3', description: 'Photorealistic images', type: 'image', provider: 'Google', route: '/api/services/imagefx/v1/images/generations' },
      { id: 'veo-3', name: 'Veo 3', description: 'High-quality video', type: 'video', provider: 'Google', route: '/api/python/video/v1/videos/generations' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'High performance general model', type: 'chat', provider: 'DeepSeek', speed: 'fast', route: '/api/models/deepseek-free-api/v1/chat/completions' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Reasoning focused', type: 'chat', provider: 'DeepSeek', route: '/api/models/deepseek-free-api/v1/chat/completions' },
      { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', description: 'Latest V3.1 model', type: 'chat', provider: 'DeepSeek', speed: 'fast', route: '/api/python/webai/v1/chat/completions' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen',
    models: [
      { id: 'qwen', name: 'Qwen 2.5', description: 'General purpose coding & chat', type: 'chat', provider: 'Qwen', speed: 'fast', route: '/api/models/qwen-free-api/v1/chat/completions' },
      { id: 'qwen-code', name: 'Qwen Code', description: 'Specialized for coding', type: 'chat', provider: 'Qwen', route: '/api/models/qwen-free-api/v1/chat/completions' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Large language model', type: 'chat', provider: 'Mistral AI', speed: 'fast', route: '/api/python/webai/v1/chat/completions' },
      { id: 'mistralai/mixtral-8x7b-instruct-v0.1', name: 'Mixtral 8x7B', description: 'Mixtral 8x7B Instruct', type: 'chat', provider: 'Mistral AI', speed: 'fast', route: '/api/deepinfra/v1/chat/completions' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    models: [
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B', description: 'Llama 3 70B Instruct', type: 'chat', provider: 'Meta', speed: 'fast', route: '/api/deepinfra/v1/chat/completions' },
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B', description: 'Llama 3 8B Instruct', type: 'chat', provider: 'Meta', speed: 'fast', route: '/api/deepinfra/v1/chat/completions' },
      { id: 'meta-llama/llama-2-70b-chat-hf', name: 'Llama 2 70B', description: 'Llama 2 70B Chat', type: 'chat', provider: 'Meta', route: '/api/deepinfra/v1/chat/completions' },
      { id: 'llama-4-scout', name: 'Llama 4 Scout', description: 'Scout model variant', type: 'chat', provider: 'Meta', route: '/api/python/webai/v1/chat/completions' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', description: 'Maverick model variant', type: 'chat', provider: 'Meta', route: '/api/python/webai/v1/chat/completions' },
    ],
  },
  {
    id: 'deepinfra',
    name: 'DeepInfra',
    models: DEEPINFRA_MODELS.map(modelId => {
      // Extract provider and model name from model ID
      const parts = modelId.split('/');
      const provider = parts[0] || 'DeepInfra';
      const modelName = parts[1] || modelId;
      
      // Determine type based on model name
      let type: 'chat' | 'image' | 'video' = 'chat';
      if (modelId.toLowerCase().includes('stable-diffusion') || modelId.toLowerCase().includes('flux') || modelId.toLowerCase().includes('sdxl') || modelId.toLowerCase().includes('imagen')) {
        type = 'image';
      } else if (modelId.toLowerCase().includes('embedding') || modelId.toLowerCase().includes('bge') || modelId.toLowerCase().includes('gte') || modelId.toLowerCase().includes('e5')) {
        type = 'chat'; // Embeddings are still chat models
      }
      
      // Determine speed
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
        provider: provider.charAt(0).toUpperCase() + provider.slice(1),
        speed,
        route: type === 'image' ? '/api/deepinfra/v1/images/generations' : '/api/deepinfra/v1/chat/completions',
      };
    }) as Model[],
  },
  {
    id: 'xai',
    name: 'xAI',
    models: [
      { id: 'grok-4', name: 'Grok-4', description: 'Latest Grok model', type: 'chat', provider: 'xAI', route: '/api/python/webai/v1/chat/completions' },
    ],
  },
  {
    id: 'chinese',
    name: 'Chinese Providers',
    models: [
      { id: 'glm-4', name: 'GLM-4', description: 'Strong agentic capabilities', type: 'chat', provider: 'GLM', route: '/api/models/glm-free-api/v1/chat/completions' },
      { id: 'doubao-pro-32k', name: 'Doubao Pro', description: 'Great Chinese understanding', type: 'chat', provider: 'Doubao', route: '/api/models/doubao-free-api/v1/chat/completions' },
      { id: 'kimi', name: 'Kimi', description: 'Long context specialist', type: 'chat', provider: 'Kimi', route: '/api/models/kimi-free-api/v1/chat/completions' },
      { id: 'minimax', name: 'MiniMax', description: 'Natural conversation', type: 'chat', provider: 'MiniMax', route: '/api/models/minimax-free-api/v1/chat/completions' },
      { id: 'step', name: 'Step-1', description: 'Multi-modal reasoning', type: 'chat', provider: 'Step', route: '/api/models/step-free-api/v1/chat/completions' },
    ],
  },
  {
    id: 'g4f',
    name: 'g4f Providers',
    models: G4F_MODEL_LIST as Model[],
  },
  {
    id: 'other',
    name: 'Other Providers',
    models: [
      { id: 'groq', name: 'Groq LPU™', description: 'Ultra-fast inference', type: 'chat', provider: 'Groq', speed: 'fast', route: '/api/groq/v1/chat/completions' },
      { id: 'pollinations', name: 'Pollinations', description: 'Free text generation', type: 'chat', provider: 'Pollinations', speed: 'fast', route: '/api/pollinations/v1/chat/completions' },
      { id: 'blackbox', name: 'BlackBox', description: 'BlackBox AI', type: 'chat', provider: 'BlackBox', route: '/api/services/gpt4freejs/v1/chat/completions' },
      { id: 'ollama', name: 'Ollama', description: 'Local models via Ollama', type: 'chat', provider: 'Ollama', route: '/api/services/gpt4freejs/v1/chat/completions' },
    ],
  },
  {
    id: 'image',
    name: 'Image Generation',
    models: [
      { id: 'dreamina', name: 'Dreamina AI', description: 'High-quality text-to-image & image-to-image (2K/4K)', type: 'image', provider: 'Dreamina', route: '/api/python/dreamina/v1/images/generations' },
      { id: 'jimeng-api', name: 'Jimeng', description: 'Advanced image generation', type: 'image', provider: 'Jimeng', route: '/api/jimeng-api/v1/images/generations' },
      { id: 'imagefx', name: 'ImageFX', description: 'Google ImageFX for photorealistic images', type: 'image', provider: 'Google', route: '/api/services/imagefx/v1/images/generations' },
      { id: 'pollinations-image-flux', name: 'Pollinations (Flux)', description: 'High quality Flux generation', type: 'image', provider: 'Pollinations', route: '/api/pollinations/v1/images/generations' },
      { id: 'stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL', description: 'Stable Diffusion XL', type: 'image', provider: 'Stability AI', route: '/api/deepinfra/v1/images/generations' },
    ],
  },
  {
    id: 'video',
    name: 'Video Generation',
    models: [
      { id: 'jimeng-api', name: 'Jimeng', description: 'Advanced video generation', type: 'video', provider: 'Jimeng', route: '/api/jimeng-api/v1/videos/generations' },
      { id: 'viggle', name: 'Viggle AI', description: 'Meme creation & animation', type: 'video', provider: 'Viggle', route: '/api/services/viggle/v1/videos/generations' },
      { id: 'tongyi', name: 'Tongyi', description: 'Alibaba video generation', type: 'video', provider: 'Tongyi', route: '/api/python/ai-video/v1/videos/generations' },
      { id: 'vidu', name: 'Vidu', description: 'High quality video', type: 'video', provider: 'Vidu', route: '/api/python/ai-video/v1/videos/generations' },
      { id: 'pixverse', name: 'PixVerse', description: 'Creative video generation', type: 'video', provider: 'PixVerse', route: '/api/python/ai-video/v1/videos/generations' },
      { id: 'runway', name: 'Runway', description: 'Professional video', type: 'video', provider: 'Runway', route: '/api/python/ai-video/v1/videos/generations' },
      { id: 'luma', name: 'Luma Labs', description: 'Luma video generation', type: 'video', provider: 'Luma', route: '/api/python/ai-video/v1/videos/generations' },
    ],
  },
];

// Register all models for deduplication
PROVIDER_GROUPS.forEach(group => {
  group.models.forEach(model => {
    registerModel(model, getCanonicalName(model.name));
  });
});

// Get all models flattened (deduplicated)
export const ALL_MODELS: Model[] = Array.from(MODEL_REGISTRY.values());

// Get models by type
export const getModelsByType = (type: 'chat' | 'image' | 'video'): Model[] => {
  return ALL_MODELS.filter(model => model.type === type);
};

// Get fast models for v2 API
export const FAST_MODELS: Model[] = ALL_MODELS.filter(model => model.speed === 'fast');

// Get provider groups by type
export const getProviderGroupsByType = (type: 'chat' | 'image' | 'video'): ProviderGroup[] => {
  return PROVIDER_GROUPS.map(group => ({
    ...group,
    models: group.models.filter(model => model.type === type),
  })).filter(group => group.models.length > 0);
};

// Find model by ID (with fallback to fastest if duplicate)
export const findModel = (modelId: string): Model | undefined => {
  // First try exact match
  let model = ALL_MODELS.find(m => m.id === modelId);
  if (model) return model;
  
  // Try canonical name match
  const canonical = getCanonicalName(modelId);
  model = MODEL_REGISTRY.get(canonical);
  if (model) return model;
  
  // Try partial match
  const lowerId = modelId.toLowerCase();
  const matches = ALL_MODELS.filter(m => 
    m.id.toLowerCase().includes(lowerId) || 
    m.name.toLowerCase().includes(lowerId)
  );
  
  // Return fastest match
  if (matches.length > 0) {
    return matches.sort((a, b) => {
      const aSpeed = a.speed === 'fast' ? 3 : a.speed === 'medium' ? 2 : 1;
      const bSpeed = b.speed === 'fast' ? 3 : b.speed === 'medium' ? 2 : 1;
      return bSpeed - aSpeed;
    })[0];
  }
  
  return undefined;
};
