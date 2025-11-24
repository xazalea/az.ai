# ImageAI Integration

ImageAI from [lelandg/ImageAI](https://github.com/lelandg/ImageAI) has been integrated into az.ai to provide enhanced image generation capabilities.

## Features

ImageAI provides:
- **Multi-Provider Support**: Google Gemini, OpenAI DALL-E, Stability AI
- **Enhanced Prompt Engineering**: Better prompt templates and optimization
- **Video Generation**: Support for Google Veo video generation
- **Layout Templates**: Pre-built templates for various use cases

## Usage

ImageAI is available as an optional provider in the Playground. Select "ImageAI (Google)" or "ImageAI (OpenAI)" from the model dropdown when in Image mode.

## API Endpoint

```
POST /api/imageai/v1/images/generations
```

### Request Body

```json
{
  "prompt": "A beautiful landscape",
  "provider": "google",
  "model": "gemini-2.5-flash-image-preview",
  "n": 1,
  "size": "1024x1024"
}
```

### Response

Same format as OpenAI's image generation API:

```json
{
  "created": 1234567890,
  "data": [
    {
      "b64_json": "base64_encoded_image",
      "url": "data:image/png;base64,...",
      "revised_prompt": "Enhanced prompt"
    }
  ]
}
```

## Setup Notes

ImageAI requires Python dependencies. For full functionality, ensure the following are available:
- Python 3.8+
- Required packages (see `packages/ImageAI/requirements.txt`)

The Python serverless function at `api/imageai/v1/images/generations.py` will attempt to use ImageAI providers when available.

## Fallback

If ImageAI dependencies are not available, the system will fall back to the default ImageFX provider.

