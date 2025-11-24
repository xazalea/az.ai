"""
Minimal ImageAI API wrapper for Vercel
Only includes essential dependencies for image generation
"""

import json
import base64
import sys
import os
from pathlib import Path

# Add ImageAI to path
imageai_path = Path(__file__).parent.parent.parent / "packages" / "ImageAI"
sys.path.insert(0, str(imageai_path))

def handler(request):
    """Vercel Python serverless function handler"""
    try:
        # Parse request body
        if hasattr(request, 'body'):
            body = json.loads(request.body) if isinstance(request.body, str) else request.body
        else:
            body = {}
        
        method = getattr(request, 'method', 'POST')
        
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        prompt = body.get('prompt', '')
        model = body.get('model', 'gemini-2.5-flash-image-preview')
        provider = body.get('provider', 'google')
        n = min(body.get('n', 1), 4)
        size = body.get('size', '1024x1024')
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing prompt'})
            }
        
        # Parse size
        width, height = 1024, 1024
        if 'x' in str(size):
            try:
                parts = str(size).split('x')
                width, height = int(parts[0]), int(parts[1])
            except:
                pass
        
        # Try to use ImageAI providers
        results = []
        
        try:
            if provider == 'google':
                from providers.google import GoogleProvider
                config = {'api_key': body.get('api_key', '')}
                provider_instance = GoogleProvider(config)
                text_outputs, image_bytes_list = provider_instance.generate(
                    prompt=prompt,
                    model=model,
                    width=width,
                    height=height
                )
                
                for img_bytes in image_bytes_list[:n]:
                    img_b64 = base64.b64encode(img_bytes).decode('utf-8')
                    results.append({
                        'b64_json': img_b64,
                        'url': f'data:image/png;base64,{img_b64}',
                        'revised_prompt': prompt
                    })
            else:
                # Fallback: return error for unsupported providers in this wrapper
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': f'Provider {provider} not yet supported in ImageAI wrapper'})
                }
        except ImportError as e:
            # If ImageAI dependencies aren't available, return helpful error
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'ImageAI dependencies not available',
                    'message': 'ImageAI requires additional setup. Falling back to default image generation.',
                    'fallback': 'Use /v1/images/generations endpoint instead'
                })
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Image generation failed', 'details': str(e)})
            }
        
        if not results:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'No images generated'})
            }
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'created': int(__import__('time').time()),
                'data': results
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }
