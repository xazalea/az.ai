# az.ai - Unified AI Platform with Reasoning & Memory

Unified AI infrastructure with **OpenReason** (reasoning engine) and **OpenMemory** (session-based memory). Access 50+ models through a single OpenAI-compatible API.

## 🧠 Core Features

- **OpenReason**: Advanced reasoning engine (always enabled)
- **OpenMemory**: Session-based memory (enabled by default, opt-out)
- **50+ Models**: Text, image, and video generation
- **Zero Setup**: No environment variables for most models
- **OpenAI Compatible**: Drop-in replacement

## Quick Start

```bash
POST /v1/chat/completions
Content-Type: application/json

{
  "model": "qwen",
  "messages": [{"role": "user", "content": "Hello!"}]
  # session_id auto-generated, memory enabled by default
}
```

## API Endpoints

### Chat Completions (with Reasoning & Memory)
```bash
POST /v1/chat/completions
{
  "model": "qwen",  # or "deepseek", "gpt-4", etc.
  "messages": [{"role": "user", "content": "Solve: 2x + 5 = 15"}],
  "use_memory": true,  # Default: true (opt-out) - auto session management
  "use_reasoning": true  # Default: true
}
# session_id auto-generated, memory transfers across models
```

Response includes reasoning metadata:
```json
{
  "choices": [{"message": {"content": "x = 5"}}],
  "reasoning": {
    "engine": "OpenReason",
    "confidence": 0.92,
    "mode": "math",
    "domain": "mathematics"
  }
}
```

### Image Generation
```bash
POST /v1/images/generations
{
  "model": "jimeng-api",  # or "flux", "imagen-3", etc.
  "prompt": "A beautiful sunset",
  "n": 1
}
```

### Video Generation
```bash
POST /v1/videos/generations
{
  "model": "jimeng-api",  # or "veo-3", "viggle", etc.
  "prompt": "A cat dancing",
  "duration": 8.0
}
```

### Reasoning (Direct)
```bash
POST /v1/reasoning
{
  "query": "What is 2+2?",
  "config": {"provider": "openai"}
}
```

### Memory (Session-Based)
```bash
# Query session memories
POST /v1/memory/query
{
  "query": "previous conversation",
  "k": 5,
  "filters": {"user_id": "session123"}
}

# Add to session (auto-done in chat, but available directly)
POST /v1/memory/add
{
  "content": "User prefers dark mode",
  "tags": ["preferences"],
  "user_id": "session123"
}
```

## Available Models

**Text**: `qwen`, `deepseek`, `glm-4`, `doubao`, `kimi`, `minimax`, `step`, `groq`, `gpt-4`, `gpt-3.5`, `chatgpt`, `gemini-3-pro`, `claude-opus-4.5`, `mistral-large`, `grok-4`, `llama-4-scout`, and more

**Image**: `jimeng-api`, `imagen-3`, `flux`, `turbo`, `pollinations`

**Video**: `jimeng-api`, `veo-3`, `viggle`, `tongyi`, `vidu`, `pixverse`, `runway`, `luma`

## Memory Behavior

- **Auto-managed**: Session IDs automatically generated (no need to provide)
- **Model-agnostic**: Memory transfers across different models in same session
- **Session-based**: Memory is temporary and tied to auto-generated session
- **Opt-out**: Set `use_memory: false` to disable
- **Auto-storage**: Conversations automatically stored and retrieved
- **Context-aware**: Previous messages and memories used for context

## Reasoning Behavior

- **Always enabled**: OpenReason enhances all responses by default
- **Opt-out**: Set `use_reasoning: false` to disable
- **Metadata**: Response includes confidence, mode, and domain

## Deployment

Deploy to Vercel with one click. No additional configuration needed.

## License

See individual package licenses.
