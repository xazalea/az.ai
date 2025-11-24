# az.ai - Unified AI Provider Platform with Advanced Reasoning & Memory

## Overview

az.ai is a comprehensive, unified AI infrastructure platform that provides access to multiple AI models through a single OpenAI-compatible API. The platform features **OpenReason** (mandatory reasoning engine) and **OpenMemory** (optional long-term memory) to enhance all AI interactions. The platform is designed to be affordable, easy to use, and deployable on Vercel with zero environment variable friction.

## 🧠 Key Features

### **OpenReason - Advanced Reasoning Engine** (Always Enabled)
- **Mandatory reasoning enhancement** for all AI responses
- Multi-domain cognitive system with specialized solvers (Math, Logic, Causal, Ethics)
- Unified reasoning graph with reflexive self-audit
- Automatic reasoning quality verification
- Enhances all chat completions with advanced reasoning capabilities

### **OpenMemory - Long-Term Memory** (Optional)
- **Optional long-term memory** system for context-aware conversations
- Persistent memory across sessions
- Semantic search and retrieval
- User-specific memory isolation
- Enable in the playground settings for enhanced context awareness

### **Enhanced Image & Video Generation**
- **Jimeng API** integration for advanced image and video generation
- Image composition features
- High-quality video generation
- Multiple resolution and aspect ratio options

## Integrated Providers

### Text Generation Models

1. **Qwen 2.5** - General purpose coding & chat (`qwen-free-api`)
2. **DeepSeek V3** - High performance general model (`deepseek-free-api`)
3. **DeepSeek R1** - Reasoning focused model (`deepseek-free-api`)
4. **DeepSeek Free** - Free DeepSeek access (`deepseek4free`)
5. **GLM-4** - Strong agentic capabilities (`glm-free-api`)
6. **Doubao Pro** - Great Chinese understanding (`doubao-free-api`)
7. **Kimi** - Long context specialist (`kimi-free-api`)
8. **MiniMax** - Natural conversation (`minimax-free-api`)
9. **Step-1** - Multi-modal reasoning (`step-free-api`)
10. **Groq LPU™** - Ultra-fast inference (`Groq2API`)
11. **GPT-4 (Free)** - GPT-4 via gpt4free-ts (`gpt4free-ts`)
12. **GPT-3.5 Turbo (Free)** - Free GPT-3.5 access (`free-gpt3.5-2api`)
13. **ChatGPT (Free)** - Free ChatGPT API (`ChatGPTAPIFree`)
14. **Gemini Multimodal** - Multimodal Gemini (`gemini-multimodal-playground`)
15. **Gemini 2.5 Pro (CLI)** - Via CLIProxyAPI
16. **Claude Code (CLI)** - Via CLIProxyAPI
17. **Qwen Code (CLI)** - Via CLIProxyAPI
18. **Pollinations** - Free text generation (`pollinations`)

### Image Generation Models

1. **Jimeng API (Enhanced)** - Advanced image generation with composition features (`jimeng-api`)
2. **Imagen 3** - Photorealistic generation (`imageFX-api`)
3. **Jimeng** - Artistic generation (`jimeng-free-api`)
4. **ImageAI (Google)** - Enhanced prompts via ImageAI (`ImageAI`)
5. **ImageAI (OpenAI)** - DALL-E via ImageAI wrapper (`ImageAI`)
6. **Pollinations (Flux)** - Free high-quality image generation (`pollinations`)
7. **Pollinations (Turbo)** - Fast image generation (`pollinations`)

### Video Generation Models

1. **Jimeng API (Enhanced)** - Advanced video generation with enhanced quality (`jimeng-api`)
2. **Veo 3** - Google Veo 3 video generation (`ImageAI`)
3. **Veo 3 Fast** - Faster Veo generation
4. **Veo 2** - Previous generation model
5. **Viggle AI** - Meme creation & character animation (`Viggle-AI-WebUI`)
6. **Tongyi** - Alibaba video generation (`ai-video-api`)
7. **Vidu** - High quality video generation (`ai-video-api`)
8. **PixVerse** - Creative video generation (`ai-video-api`)
9. **Runway** - Professional video generation (`ai-video-api`)
10. **Stability AI Video** - Via ai-video-api
11. **Zhipu** - Via ai-video-api
12. **Luma Labs** - Via ai-video-api

## API Endpoints

### Unified Endpoints (Recommended)

All models are accessible through unified OpenAI-compatible endpoints. Simply specify the `model` parameter in your request:

#### Text Generation
```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "qwen",  # or "deepseek", "gpt-4", "pollinations", etc.
  "messages": [
    {"role": "user", "content": "Hello!"}
  ]
}
```

#### Image Generation
```bash
POST /v1/images/generations
Content-Type: application/json

{
  "model": "flux",  # or "imagen-3", "pollinations", "jimeng", etc.
  "prompt": "A beautiful sunset",
  "n": 1,
  "size": "1024x1024"
}
```

#### Video Generation
```bash
POST /v1/videos/generations
Content-Type: application/json

{
  "model": "veo-3",  # or "viggle", "tongyi", "vidu", etc.
  "prompt": "A cat dancing",
  "duration": 8.0,
  "aspect_ratio": "16:9"
}
```

### Model Selection

The unified API automatically routes to the correct provider based on the `model` field. Available models:

**Text Models**: `qwen`, `deepseek`, `glm-4`, `doubao`, `kimi`, `minimax`, `step`, `groq`, `gpt-4`, `gpt-3.5`, `chatgpt`, `gemini-multimodal`, `gemini-2.5-pro`, `claude-code`, `qwen-code`, `pollinations`

**Image Models**: `imagen-3`, `jimeng`, `imageai-google`, `imageai-openai`, `pollinations`, `flux`, `turbo`

**Video Models**: `veo-3`, `veo-3-fast`, `veo-2`, `viggle`, `tongyi`, `vidu`, `pixverse`, `runway`, `stability-video`, `zhipu`, `luma`

## Features

- **Unified API**: Single endpoint for all text, image, and video generation models
- **Zero Setup**: No environment variables required for most models
- **OpenAI Compatible**: Drop-in replacement for OpenAI API
- **Modern UI**: Beautiful Lavender Sapphire Mist themed interface
- **Interactive Playground**: Test models directly in the browser
- **Vercel Ready**: Fully optimized for serverless deployment
- **Multi-Provider**: Access to 18+ text models, 6+ image models, and 11+ video models
- **Meme Creation**: Viggle AI integration for character animation and memes

## Architecture

- **Frontend**: Next.js 14 with React, TypeScript, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js, Go, Python)
- **Routing**: Unified API gateway with intelligent model routing
- **Packages**: Monorepo structure with individual provider packages

## Deployment

The platform is designed for one-click deployment on Vercel:

1. Connect your GitHub repository
2. Vercel automatically detects Next.js
3. Deploy - no additional configuration needed

## Color Palette

The UI uses the **Lavender Sapphire Mist** palette:
- `#D9A69F` - Pale Pink/Lavender (Text/Accents)
- `#6C739C` - Muted Purple (Primary Elements)
- `#F0DAD5` - Very Pale Pink (Backgrounds/Text)
- `#BABBB1` - Grey (Borders/Secondary Text)
- `#C56B62` - Deep Pink (Hover/Active)
- `#424658` - Dark Grey/Navy (Main Background)
- `#DEA785` - Peach (Accents/Highlights)


