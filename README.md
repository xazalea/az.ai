# az.ai - Unified AI Provider Platform

## Overview

az.ai is a comprehensive, unified AI infrastructure platform that provides access to multiple AI models through a single OpenAI-compatible API. The platform is designed to be affordable, easy to use, and deployable on Vercel with zero environment variable friction.

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

### Image Generation Models

1. **Imagen 3** - Photorealistic generation (`imageFX-api`)
2. **Jimeng** - Artistic generation (`jimeng-free-api`)
3. **ImageAI (Google)** - Enhanced prompts via ImageAI (`ImageAI`)
4. **ImageAI (OpenAI)** - DALL-E via ImageAI wrapper (`ImageAI`)

## API Endpoints

### Unified Text Generation
```
POST /v1/chat/completions
```
Routes requests to the appropriate provider based on the `model` field in the request body.

### Unified Image Generation
```
POST /v1/images/generations
```
Routes to ImageFX or ImageAI based on model selection.

### Provider-Specific Endpoints

- `/api/qwen/v1/chat/completions` - Qwen models
- `/api/groq/v1/chat/completions` - Groq models
- `/api/deepseek/v1/chat/completions` - DeepSeek models
- `/api/gpt4free/v1/chat/completions` - GPT-4 free
- `/api/chatgptfree/v1/chat/completions` - ChatGPT free
- `/api/freegpt/v1/chat/completions` - GPT-3.5 free
- `/api/deepseekfree/v1/chat/completions` - DeepSeek free
- `/api/gemini-multimodal/v1/chat/completions` - Gemini multimodal
- `/api/imagefx/v1/images/generations` - ImageFX
- `/api/imageai/v1/images/generations` - ImageAI

## Features

- **Unified API**: Single endpoint for all text generation models
- **Zero Setup**: No environment variables required for most models
- **OpenAI Compatible**: Drop-in replacement for OpenAI API
- **Modern UI**: Beautiful Lavender Sapphire Mist themed interface
- **Interactive Playground**: Test models directly in the browser
- **Vercel Ready**: Fully optimized for serverless deployment
- **Multi-Provider**: Access to 14+ text models and 4+ image models

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

## Contributing

This project integrates multiple open-source AI provider projects:
- LLM-Red-Team repositories
- Groq2API
- imageFX-api
- ImageAI
- gpt4free-ts
- ChatGPTAPIFree
- free-gpt3.5-2api
- deepseek4free
- gemini-multimodal-playground

All integrated projects maintain their original licenses and credits.

## License

See individual package licenses. The main platform code follows the same licensing as the integrated projects.

