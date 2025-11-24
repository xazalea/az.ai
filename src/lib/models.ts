// Comprehensive model list organized by provider
export interface Model {
  id: string;
  name: string;
  description: string;
  type: 'chat' | 'image' | 'video';
  provider: string;
  speed?: 'fast' | 'medium' | 'slow'; // For v2 API routing
}

export interface ProviderGroup {
  id: string;
  name: string;
  icon?: string;
  models: Model[];
}

export const PROVIDER_GROUPS: ProviderGroup[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: [
      { id: 'gpt-5.1-high', name: 'GPT-5.1 High', description: 'Latest high-performance model', type: 'chat', provider: 'openai', speed: 'fast' },
      { id: 'gpt-5-chat', name: 'GPT-5 Chat', description: 'GPT-5 conversational model', type: 'chat', provider: 'openai', speed: 'fast' },
      { id: 'gpt-4', name: 'GPT-4', description: 'GPT-4 via gpt4free-ts', type: 'chat', provider: 'openai', speed: 'medium' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', type: 'chat', provider: 'openai', speed: 'fast' },
      { id: 'gpt-oss-120b', name: 'GPT-OSS 120B', description: 'Open source 120B model', type: 'chat', provider: 'openai' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Free ChatGPT API', type: 'chat', provider: 'openai', speed: 'fast' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', description: 'Most capable Claude model', type: 'chat', provider: 'anthropic' },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', description: 'Balanced performance', type: 'chat', provider: 'anthropic', speed: 'fast' },
      { id: 'claude-code', name: 'Claude Code', description: 'Specialized for coding', type: 'chat', provider: 'anthropic' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro', description: 'Latest Pro model', type: 'chat', provider: 'google' },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'High performance Pro', type: 'chat', provider: 'google' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Fast and efficient', type: 'chat', provider: 'google', speed: 'fast' },
      { id: 'gemini-multimodal', name: 'Gemini Multimodal', description: 'Multimodal capabilities', type: 'chat', provider: 'google' },
      { id: 'imagen-3', name: 'Imagen 3', description: 'Photorealistic images', type: 'image', provider: 'google' },
      { id: 'veo-3', name: 'Veo 3', description: 'High-quality video', type: 'video', provider: 'google' },
      { id: 'veo-3-fast', name: 'Veo 3 Fast', description: 'Faster video generation', type: 'video', provider: 'google' },
      { id: 'veo-2', name: 'Veo 2', description: 'Previous generation', type: 'video', provider: 'google' },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', description: 'High performance general model', type: 'chat', provider: 'deepseek', speed: 'fast' },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', description: 'Reasoning focused', type: 'chat', provider: 'deepseek' },
      { id: 'deepseek-v3.1', name: 'DeepSeek V3.1', description: 'Latest V3.1 model', type: 'chat', provider: 'deepseek', speed: 'fast' },
      { id: 'deepseek-free', name: 'DeepSeek Free', description: 'Free DeepSeek access', type: 'chat', provider: 'deepseek', speed: 'fast' },
    ],
  },
  {
    id: 'qwen',
    name: 'Qwen',
    models: [
      { id: 'qwen', name: 'Qwen 2.5', description: 'General purpose coding & chat', type: 'chat', provider: 'qwen', speed: 'fast' },
      { id: 'qwen-code', name: 'Qwen Code', description: 'Specialized for coding', type: 'chat', provider: 'qwen' },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Large language model', type: 'chat', provider: 'mistral', speed: 'fast' },
    ],
  },
  {
    id: 'meta',
    name: 'Meta',
    models: [
      { id: 'llama-4-scout', name: 'Llama 4 Scout', description: 'Scout model variant', type: 'chat', provider: 'meta' },
      { id: 'llama-4-maverick', name: 'Llama 4 Maverick', description: 'Maverick model variant', type: 'chat', provider: 'meta' },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    models: [
      { id: 'grok-4', name: 'Grok-4', description: 'Latest Grok model', type: 'chat', provider: 'xai' },
    ],
  },
  {
    id: 'chinese',
    name: 'Chinese Providers',
    models: [
      { id: 'glm-4', name: 'GLM-4', description: 'Strong agentic capabilities', type: 'chat', provider: 'chinese' },
      { id: 'doubao-pro-32k', name: 'Doubao Pro', description: 'Great Chinese understanding', type: 'chat', provider: 'chinese' },
      { id: 'kimi', name: 'Kimi', description: 'Long context specialist', type: 'chat', provider: 'chinese' },
      { id: 'minimax', name: 'MiniMax', description: 'Natural conversation', type: 'chat', provider: 'chinese' },
      { id: 'step', name: 'Step-1', description: 'Multi-modal reasoning', type: 'chat', provider: 'chinese' },
      { id: 'jimeng', name: 'Jimeng', description: 'Artistic image generation', type: 'image', provider: 'chinese' },
    ],
  },
  {
    id: 'other',
    name: 'Other Providers',
    models: [
      { id: 'groq', name: 'Groq LPU™', description: 'Ultra-fast inference', type: 'chat', provider: 'other', speed: 'fast' },
      { id: 'blackbox', name: 'BlackBox', description: 'BlackBox AI', type: 'chat', provider: 'other' },
      { id: 'ollama', name: 'Ollama', description: 'Local models via Ollama', type: 'chat', provider: 'other' },
      { id: 'pollinations', name: 'Pollinations', description: 'Free text generation', type: 'chat', provider: 'other', speed: 'fast' },
    ],
  },
  {
    id: 'image',
    name: 'Image Generation',
    models: [
      { id: 'imageai-google', name: 'ImageAI (Google)', description: 'Enhanced prompts', type: 'image', provider: 'image' },
      { id: 'imageai-openai', name: 'ImageAI (OpenAI)', description: 'DALL-E wrapper', type: 'image', provider: 'image' },
      { id: 'pollinations-image-flux', name: 'Pollinations (Flux)', description: 'High quality Flux', type: 'image', provider: 'image' },
      { id: 'pollinations-image-turbo', name: 'Pollinations (Turbo)', description: 'Fast generation', type: 'image', provider: 'image', speed: 'fast' },
    ],
  },
  {
    id: 'video',
    name: 'Video Generation',
    models: [
      { id: 'viggle', name: 'Viggle AI', description: 'Meme creation & animation', type: 'video', provider: 'video' },
      { id: 'tongyi', name: 'Tongyi', description: 'Alibaba video generation', type: 'video', provider: 'video' },
      { id: 'vidu', name: 'Vidu', description: 'High quality video', type: 'video', provider: 'video' },
      { id: 'pixverse', name: 'PixVerse', description: 'Creative video generation', type: 'video', provider: 'video' },
      { id: 'runway', name: 'Runway', description: 'Professional video', type: 'video', provider: 'video' },
      { id: 'stability-video', name: 'Stability AI', description: 'Stability video model', type: 'video', provider: 'video' },
      { id: 'zhipu', name: 'Zhipu', description: 'Zhipu video model', type: 'video', provider: 'video' },
      { id: 'luma', name: 'Luma Labs', description: 'Luma video generation', type: 'video', provider: 'video' },
    ],
  },
];

// Get all models flattened
export const ALL_MODELS: Model[] = PROVIDER_GROUPS.flatMap(group => group.models);

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

