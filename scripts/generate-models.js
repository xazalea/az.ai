// Script to generate comprehensive models list from g4f-models.ts
const fs = require('fs');
const path = require('path');

// Read the g4f models
const g4fModelsPath = path.join(__dirname, '../src/lib/g4f-models.ts');
const g4fContent = fs.readFileSync(g4fModelsPath, 'utf8');

// Extract model IDs from G4F_MODELS array
// Match strings that are in the array, excluding import statements and comments
const arrayContent = g4fContent.match(/export const G4F_MODELS = \[([\s\S]*?)\];/);
if (!arrayContent) {
  console.error('Could not find G4F_MODELS array');
  process.exit(1);
}

// Extract model IDs from the array content
const modelMatches = arrayContent[1].match(/['"]([^'"]+)['"]/g);
const modelIds = modelMatches
  ? modelMatches
      .map(m => m.replace(/['"]/g, ''))
      .filter(id => {
        // Filter out non-model strings (imports, comments, etc.)
        return !id.startsWith('.') && 
               !id.startsWith('/') && 
               !id.includes('import') &&
               !id.includes('export') &&
               id.length > 0 &&
               id !== 'g4f';
      })
  : [];

// Filter models - include most, but exclude specific non-chat types
const g4fChatModels = modelIds.filter(id => {
  const lower = id.toLowerCase();
  // Exclude only embedding, image generation, video generation, and TTS models
  // Include models with / (they can still work via g4f)
  // Include @cf/ and @hf/ models (they're worker models but can be chat)
  // Include models/ prefix (Gemini models)
  // Include openrouter: prefix models
  return !lower.includes('embedding') &&
         !lower.includes('imagen') &&
         !lower.includes('veo') &&
         !lower.includes('flux') &&
         !lower.includes('sdxl') &&
         !lower.includes('dall-e') &&
         !lower.includes('gpt-image') &&
         !lower.includes('recraft') &&
         !lower.includes('tts') &&
         !lower.includes('audio') &&
         !lower.includes('whisper') &&
         !lower.includes('melotts') &&
         !lower.includes('aura') &&
         !lower.includes('stable-diffusion') &&
         !lower.includes('inpainting') &&
         !lower.includes('img2img') &&
         !lower.includes('bart-large-cnn') &&
         !lower.includes('resnet') &&
         !lower.includes('m2m100') &&
         !lower.includes('indictrans') &&
         !lower.includes('sqlcoder') &&
         !lower.includes('phi-2') &&
         !lower.includes('clip') &&
         !lower.includes('nvclip') &&
         !lower.includes('vila') &&
         !lower.includes('neva') &&
         !lower.includes('parse') &&
         !lower.includes('translate') &&
         !lower.includes('usdcode') &&
         !lower.includes('deplot') &&
         !lower.includes('paligemma') &&
         !lower.includes('recurrentgemma') &&
         !lower.includes('shieldgemma') &&
         !lower.includes('codegemma') &&
         !lower.includes('replace_background') &&
         !lower.includes('erase') &&
         !lower.includes('expand') &&
         !lower.includes('fibo') &&
         !lower.includes('gen_fill') &&
         !lower.includes('remove_background') &&
         !lower.includes('enhance') &&
         !lower.includes('blur_background') &&
         !lower.includes('bria') &&
         !lower.includes('ocr');
});

// Generate model objects
const models = g4fChatModels.map(id => {
  // Strip "openrouter:" prefix from ID but keep it for internal use
  const cleanId = id.startsWith('openrouter:') ? id.replace('openrouter:', '') : id;
  const displayId = cleanId; // Use clean ID for display
  
  // Handle model names with slashes (provider/model format)
  let name;
  if (cleanId.includes('/')) {
    const parts = cleanId.split('/');
    const modelName = parts[parts.length - 1]; // Get last part (just the model name)
    name = modelName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bGpt\b/g, 'GPT')
      .replace(/\bLlama\b/g, 'Llama')
      .replace(/\bGemini\b/g, 'Gemini')
      .replace(/\bClaude\b/g, 'Claude')
      .replace(/\bMistral\b/g, 'Mistral')
      .replace(/\bGrok\b/g, 'Grok')
      .replace(/\bQwen\b/g, 'Qwen')
      .replace(/\bDeepseek\b/g, 'DeepSeek')
      .replace(/\bGlm\b/g, 'GLM')
      .replace(/\bKimi\b/g, 'Kimi')
      .replace(/\bPhi\b/g, 'Phi')
      .replace(/\bYi\b/g, 'Yi')
      .replace(/\bO\b/g, 'O')
      .replace(/\bNova\b/g, 'Nova')
      .replace(/\bHermes\b/g, 'Hermes')
      .replace(/\bCommand\b/g, 'Command')
      .replace(/\bPixtral\b/g, 'Pixtral')
      .replace(/\bMixtral\b/g, 'Mixtral')
      .replace(/\bGemma\b/g, 'Gemma')
      .replace(/\bNemotron\b/g, 'Nemotron')
      .replace(/\bCogito\b/g, 'Cogito')
      .replace(/\bSeed\b/g, 'Seed')
      .replace(/\bRing\b/g, 'Ring')
      .replace(/\bLing\b/g, 'Ling')
      .replace(/\bErnie\b/g, 'ERNIE')
      .replace(/\bSonar\b/g, 'Sonar')
      .replace(/\bGoliath\b/g, 'Goliath')
      .replace(/\bSd\b/g, 'SD')
      .replace(/\bCliptagger\b/g, 'Cliptagger')
      .replace(/\bOpenchat\b/g, 'OpenChat')
      .replace(/\bMeowgpt\b/g, 'MeowGPT')
      .replace(/\bChar\b/g, 'Char')
      .replace(/\bNano\b/g, 'Nano')
      .replace(/\bBanana\b/g, 'Banana')
      .replace(/\bLucid\b/g, 'Lucid')
      .replace(/\bOrigin\b/g, 'Origin')
      .replace(/\bCogvideox\b/g, 'CogVideoX')
      .replace(/\bBidara\b/g, 'Bidara')
      .replace(/\bChickytutor\b/g, 'ChickyTutor')
      .replace(/\bEvil\b/g, 'Evil')
      .replace(/\bMidijourney\b/g, 'Midijourney')
      .replace(/\bRtist\b/g, 'Rtist')
      .replace(/\bUnity\b/g, 'Unity')
      .replace(/\bSearchgpt\b/g, 'SearchGPT')
      .replace(/\bLlama\b/g, 'Llama')
      .replace(/\bRoblox\b/g, 'Roblox');
  } else {
    name = cleanId
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bGpt\b/g, 'GPT')
      .replace(/\bLlama\b/g, 'Llama')
      .replace(/\bGemini\b/g, 'Gemini')
      .replace(/\bClaude\b/g, 'Claude')
      .replace(/\bMistral\b/g, 'Mistral')
      .replace(/\bGrok\b/g, 'Grok')
      .replace(/\bQwen\b/g, 'Qwen')
      .replace(/\bDeepseek\b/g, 'DeepSeek')
      .replace(/\bGlm\b/g, 'GLM')
      .replace(/\bKimi\b/g, 'Kimi')
      .replace(/\bPhi\b/g, 'Phi')
      .replace(/\bYi\b/g, 'Yi')
      .replace(/\bO\b/g, 'O')
      .replace(/\bNova\b/g, 'Nova')
      .replace(/\bHermes\b/g, 'Hermes')
      .replace(/\bCommand\b/g, 'Command')
      .replace(/\bPixtral\b/g, 'Pixtral')
      .replace(/\bMixtral\b/g, 'Mixtral')
      .replace(/\bGemma\b/g, 'Gemma')
      .replace(/\bNemotron\b/g, 'Nemotron')
      .replace(/\bCogito\b/g, 'Cogito')
      .replace(/\bSeed\b/g, 'Seed')
      .replace(/\bRing\b/g, 'Ring')
      .replace(/\bLing\b/g, 'Ling')
      .replace(/\bErnie\b/g, 'ERNIE')
      .replace(/\bSonar\b/g, 'Sonar')
      .replace(/\bGoliath\b/g, 'Goliath')
      .replace(/\bSd\b/g, 'SD')
      .replace(/\bCliptagger\b/g, 'Cliptagger')
      .replace(/\bOpenchat\b/g, 'OpenChat')
      .replace(/\bMeowgpt\b/g, 'MeowGPT')
      .replace(/\bChar\b/g, 'Char')
      .replace(/\bNano\b/g, 'Nano')
      .replace(/\bBanana\b/g, 'Banana')
      .replace(/\bLucid\b/g, 'Lucid')
      .replace(/\bOrigin\b/g, 'Origin')
      .replace(/\bCogvideox\b/g, 'CogVideoX')
      .replace(/\bBidara\b/g, 'Bidara')
      .replace(/\bChickytutor\b/g, 'ChickyTutor')
      .replace(/\bEvil\b/g, 'Evil')
      .replace(/\bMidijourney\b/g, 'Midijourney')
      .replace(/\bRtist\b/g, 'Rtist')
      .replace(/\bUnity\b/g, 'Unity')
      .replace(/\bSearchgpt\b/g, 'SearchGPT')
      .replace(/\bLlama\b/g, 'Llama')
      .replace(/\bRoblox\b/g, 'Roblox');
  }
  
  // Determine provider
  let provider = 'g4f';
  const lowerId = cleanId.toLowerCase();
  if (lowerId.includes('gpt') || lowerId.includes('o1') || lowerId.includes('o3') || lowerId.includes('o4')) {
    provider = 'OpenAI';
  } else if (lowerId.includes('claude')) {
    provider = 'Anthropic';
  } else if (lowerId.includes('gemini') || lowerId.includes('gemma')) {
    provider = 'Google';
  } else if (lowerId.includes('llama')) {
    provider = 'Meta';
  } else if (lowerId.includes('mistral') || lowerId.includes('mixtral') || lowerId.includes('pixtral')) {
    provider = 'Mistral AI';
  } else if (lowerId.includes('grok')) {
    provider = 'xAI';
  } else if (lowerId.includes('qwen')) {
    provider = 'Qwen';
  } else if (lowerId.includes('deepseek')) {
    provider = 'DeepSeek';
  } else if (lowerId.includes('glm')) {
    provider = 'GLM';
  } else if (lowerId.includes('kimi')) {
    provider = 'Kimi';
  } else if (lowerId.includes('phi') || lowerId.includes('microsoft')) {
    provider = 'Microsoft';
  } else if (lowerId.includes('yi') || lowerId.includes('01-ai')) {
    provider = '01.AI';
  } else if (lowerId.includes('command') || lowerId.includes('cohere')) {
    provider = 'Cohere';
  } else if (lowerId.includes('hermes') || lowerId.includes('nousresearch')) {
    provider = 'NousResearch';
  } else if (lowerId.includes('nova') || lowerId.includes('amazon')) {
    provider = 'Amazon';
  } else if (lowerId.includes('sonar') || lowerId.includes('perplexity')) {
    provider = 'Perplexity';
  } else if (lowerId.includes('cogito') || lowerId.includes('deepcogito')) {
    provider = 'DeepCogito';
  } else if (lowerId.includes('nemotron') || lowerId.includes('nvidia')) {
    provider = 'NVIDIA';
  } else if (lowerId.includes('ollama')) {
    provider = 'Ollama';
  }
  
  // Determine speed
  let speed = undefined;
  if (lowerId.includes('flash') || lowerId.includes('mini') || lowerId.includes('turbo') || 
      lowerId.includes('fast') || lowerId.includes('lite') || lowerId.includes('small') ||
      lowerId.includes('8b') || lowerId.includes('7b') || lowerId.includes('3b') ||
      lowerId.includes('1.5b') || lowerId.includes('1b')) {
    speed = 'fast';
  } else if (lowerId.includes('medium') || lowerId.includes('32b') || lowerId.includes('14b')) {
    speed = 'medium';
  }
  
  return {
    id: id, // Keep original ID with openrouter: prefix for API routing
    name: name,
    description: name, // Remove "via g4f" - just use the model name
    type: 'chat',
    provider: provider,
    speed: speed,
    route: '/api/python/webai/v1/chat/completions'
  };
});

// Output as TypeScript array
const output = `// Auto-generated from g4f-models.ts
export const G4F_MODEL_LIST = ${JSON.stringify(models, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '../src/lib/g4f-model-list.ts'), output);
console.log(`Generated ${models.length} models`);

