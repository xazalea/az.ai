// Comprehensive list of DeepInfra models
// These models route through /api/deepinfra/v1/chat/completions, /api/deepinfra/v1/images/generations, or /api/deepinfra/v1/videos/generations
// Source: https://deepinfra.com/models

export const DEEPINFRA_MODELS: string[] = [
  // Meta/Llama models
  'meta-llama/Llama-2-70b-chat-hf',
  'meta-llama/Llama-3-70b-instruct',
  'meta-llama/Llama-3-8b-instruct',
  'meta-llama/Llama-3.2-3B-Instruct',
  'meta-llama/Llama-3.2-11B-Vision-Instruct',
  'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  'meta-llama/Meta-Llama-3.1-8B-Instruct',
  'meta-llama/Meta-Llama-3-8B-Instruct',
  'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  'meta-llama/Llama-4-Scout-17B-16E-Instruct',
  'meta-llama/Llama-Guard-4-12B',
  
  // Mistral models
  'mistralai/Mixtral-8x7B-Instruct-v0.1',
  'mistralai/Mistral-Small-24B-Instruct-2501',
  'mistralai/Mistral-Small-3.2-24B-Instruct-2506',
  'mistralai/Mistral-Nemo-Instruct-2407',
  'mistralai/Voxtral-Small-24B-2507', // Speech recognition
  'mistralai/Voxtral-Mini-3B-2507', // Speech recognition
  
  // Qwen models
  'Qwen/Qwen2.5-72B-Instruct',
  'Qwen/Qwen3-14B',
  'Qwen/Qwen3-30B-A3B',
  'Qwen/Qwen3-32B',
  'Qwen/Qwen3-235B-A22B-Instruct-2507',
  'Qwen/Qwen3-235B-A22B-Thinking-2507',
  'Qwen/Qwen3-Coder-480B-A35B-Instruct',
  'Qwen/Qwen3-Coder-480B-A35B-Instruct-Turbo',
  'Qwen/Qwen3-Embedding-0.6B',
  'Qwen/Qwen3-Embedding-4B',
  'Qwen/Qwen3-Embedding-8B',
  'Qwen/Qwen3-Embedding-0.6B-batch',
  'Qwen/Qwen3-Embedding-4B-batch',
  'Qwen/Qwen3-Embedding-8B-batch',
  'Qwen/Qwen3-Next-80B-A3B-Instruct',
  'Qwen/Qwen3-VL-30B-A3B-Instruct',
  'Qwen/Qwen3-VL-235B-A22B-Instruct',
  'Qwen/Qwen-Image-Edit',
  'Qwen/Qwen2.5-VL-32B-Instruct',
  
  // DeepSeek models
  'deepseek-ai/DeepSeek-V2.5',
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-V3-0324',
  'deepseek-ai/DeepSeek-V3.1',
  'deepseek-ai/DeepSeek-V3.1-Terminus',
  'deepseek-ai/DeepSeek-V3.2-Exp',
  'deepseek-ai/DeepSeek-R1',
  'deepseek-ai/DeepSeek-R1-0528',
  'deepseek-ai/DeepSeek-R1-0528-Turbo',
  'deepseek-ai/DeepSeek-R1-Turbo',
  'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
  'deepseek-ai/Janus-Pro-1B',
  'deepseek-ai/Janus-Pro-7B',
  'deepseek-ai/DeepSeek-OCR',
  
  // Google models
  'google/gemini-2.5-pro',
  'google/gemini-2.5-flash',
  'google/gemini-2.0-flash-001',
  'google/gemini-1.5-flash',
  'google/gemini-1.5-flash-8b',
  'google/gemma-7b-it',
  'google/gemma-3-4b-it',
  'google/gemma-3-12b-it',
  'google/gemma-3-27b-it',
  'google/embeddinggemma-300m',
  // Note: Google video models like veo-3 are typically accessed via Google's API, not DeepInfra
  
  // Anthropic models
  'anthropic/claude-4-sonnet',
  'anthropic/claude-4-opus',
  'anthropic/claude-3-7-sonnet-latest',
  
  // OpenAI models
  'openai/gpt-oss-120b',
  'openai/gpt-oss-120b-Turbo',
  'openai/gpt-oss-20b',
  
  // Microsoft models
  'microsoft/phi-3-medium-4k-instruct',
  'microsoft/phi-4',
  'microsoft/WizardLM-2-8x22B',
  
  // NVIDIA models
  'nvidia/NVIDIA-Nemotron-Nano-9B-v2',
  'nvidia/NVIDIA-Nemotron-Nano-12B-v2-VL',
  'nvidia/Llama-3.1-Nemotron-70B-Instruct',
  'nvidia/Llama-3.3-Nemotron-Super-49B-v1.5',
  
  // 01.AI models
  '01-ai/Yi-34B-Chat',
  
  // Stability AI models (Image)
  'stabilityai/sdxl-turbo',
  'stabilityai/stable-diffusion-xl-base-1.0',
  'stabilityai/stable-diffusion-2-1',
  'stabilityai/stable-diffusion-2-1-base',
  
  // Black Forest Labs models (Image)
  'black-forest-labs/FLUX-1-dev',
  'black-forest-labs/FLUX-1-schnell',
  'black-forest-labs/FLUX-1-Redux-dev',
  'black-forest-labs/FLUX-1.1-pro',
  'black-forest-labs/FLUX.1-Kontext-dev',
  'black-forest-labs/FLUX-pro',
  
  // Bria models (Image editing)
  'Bria/replace_background',
  'Bria/erase_foreground',
  'Bria/erase',
  'Bria/expand',
  'Bria/fibo',
  'Bria/gen_fill',
  'Bria/blur_background',
  'Bria/remove_background',
  'Bria/enhance',
  'Bria/Bria-3.2',
  'Bria/Bria-3.2-vector',
  
  // Sentence Transformers (Embeddings)
  'sentence-transformers/all-MiniLM-L6-v2',
  'sentence-transformers/all-MiniLM-L12-v2',
  'sentence-transformers/all-mpnet-base-v2',
  'sentence-transformers/paraphrase-MiniLM-L6-v2',
  'sentence-transformers/multi-qa-mpnet-base-dot-v1',
  'sentence-transformers/clip-ViT-B-32',
  'sentence-transformers/clip-ViT-B-32-multilingual-v1',
  
  // Embedding models
  'thenlper/gte-base',
  'thenlper/gte-large',
  'intfloat/e5-base-v2',
  'intfloat/e5-large-v2',
  'intfloat/multilingual-e5-large',
  'intfloat/multilingual-e5-large-instruct',
  'BAAI/bge-large-en-v1.5',
  'BAAI/bge-base-en-v1.5',
  'BAAI/bge-m3',
  'BAAI/bge-m3-multi',
  'BAAI/bge-en-icl',
  
  // OCR models
  'PaddlePaddle/PaddleOCR-VL-0.9B',
  'allenai/olmOCR-2-7B-1025',
  
  // Other text generation models
  'NousResearch/Hermes-3-Llama-3.1-405B',
  'NousResearch/Hermes-3-Llama-3.1-70B',
  'Sao10K/L3.1-70B-Euryale-v2.2',
  'Sao10K/L3.3-70B-Euryale-v2.3',
  'Sao10K/L3-8B-Lunaris-v1-Turbo',
  'Gryphe/MythoMax-L2-13b',
  'shibing624/text2vec-base-chinese',
  'ByteDance/Seedream-4',
  'zai-org/GLM-4.6',
  'MiniMaxAI/MiniMax-M2',
  'moonshotai/Kimi-K2-Instruct-0905',
  'moonshotai/Kimi-K2-Thinking',
  
  // Note: DeepInfra API dynamically provides all available models
  // This static list is a fallback. The API endpoint should fetch the complete list.
];

// Helper to check if a model should route through DeepInfra
export function isDeepInfraModel(modelId: string): boolean {
  const lowerId = modelId.toLowerCase();
  
  // Check exact matches
  if (DEEPINFRA_MODELS.some(model => model.toLowerCase() === lowerId)) {
    return true;
  }
  
  // Check for patterns that indicate DeepInfra models
  const deepInfraPatterns = [
    /^meta-llama\//i,
    /^mistralai\//i,
    /^qwen\//i,
    /^deepseek-ai\//i,
    /^google\/gemma/i,
    /^anthropic\/claude/i,
    /^openai\/gpt-oss/i,
    /^microsoft\//i,
    /^nvidia\//i,
    /^01-ai\//i,
    /^stabilityai\//i,
    /^black-forest-labs\//i,
    /^bria\//i,
    /^sentence-transformers\//i,
    /^baai\//i,
    /^intfloat\//i,
    /^thenlper\//i,
    /^paddlepaddle\//i,
    /^nousresearch\//i,
    /\/.*-instruct/i, // Models with -instruct suffix
    /\/.*-chat/i,     // Models with -chat suffix
  ];
  
  return deepInfraPatterns.some(pattern => pattern.test(modelId));
}

