# az.ai - Unified AI Platform

Unified AI infrastructure with reasoning and memory. Access 50+ models through a single OpenAI-compatible API.

## Quick Start

```bash
POST /v1/chat/completions
{
  "model": "qwen",
  "messages": [{"role": "user", "content": "Hello!"}]
}
```

## Features

- **50+ Models**: Text, image, video generation
- **Reasoning**: Advanced reasoning engine (auto-enabled)
- **Memory**: Session-based memory (auto-enabled, opt-out)
- **Zero Setup**: No environment variables needed
- **OpenAI Compatible**: Drop-in replacement

## API

### Chat
```bash
POST /v1/chat/completions
{
  "model": "qwen",  # or "deepseek", "gpt-4", etc.
  "messages": [{"role": "user", "content": "Hello"}],
  "use_memory": true,  # Default: true
  "use_reasoning": true  # Default: true
}
```

### Image
```bash
POST /v1/images/generations
{
  "model": "jimeng-api",
  "prompt": "A sunset"
}
```

### Video
```bash
POST /v1/videos/generations
{
  "model": "jimeng-api",
  "prompt": "A cat dancing"
}
```

## Models

**Text**: `qwen`, `deepseek`, `glm-4`, `gpt-4`, `gpt-3.5`, `gemini-3-pro`, `claude-opus-4.5`, `mistral-large`, `grok-4`, and more

**Image**: `jimeng-api`, `imagen-3`, `flux`, `pollinations`

**Video**: `jimeng-api`, `veo-3`, `viggle`, `tongyi`, `vidu`, `pixverse`, `runway`, `luma`

## Memory

- Auto-managed sessions (no `session_id` needed)
- Transfers across models
- Opt-out: `use_memory: false`

## Deployment

Deploy to Vercel with one click.
