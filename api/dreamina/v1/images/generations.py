"""
Dreamina AI Image Generation API
Supports text-to-image and image-to-image generation
"""

import json
import sys
from pathlib import Path

# Add dreamina-free-api to path
dreamina_path = Path(__file__).parent.parent.parent / "packages" / "dreamina-free-api"
sys.path.insert(0, str(dreamina_path))

def handler(request):
    """Vercel Python serverless function handler for Dreamina image generation"""
    try:
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
        
        prompt = body.get('prompt')
        model = body.get('model', 'dreamina-4.0')
        size = body.get('size', '1024x1024')
        n = body.get('n', 1)
        image = body.get('image')  # Base64 encoded image for image-to-image
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing prompt'})
            }
        
        # Parse size
        width, height = map(int, size.split('x'))
        
        # Determine aspect ratio
        if width == height:
            ratio = '1:1'
        elif width > height:
            ratio = '16:9' if width / height > 1.5 else '4:3'
        else:
            ratio = '9:16' if height / width > 1.5 else '3:4'
        
        # Determine resolution
        resolution = '4k' if max(width, height) >= 2048 else '2k'
        
        try:
            from core.token_manager import TokenManager
            from core.api_client import ApiClient
            
            # Load config
            config_path = dreamina_path / 'config.json'
            if not config_path.exists():
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'Dreamina API not configured',
                        'note': 'Please configure sessionid in config.json'
                    })
                }
            
            with open(config_path, 'r', encoding='utf-8') as f:
                config = json.load(f)
            
            if not config.get('accounts') or len(config['accounts']) == 0:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'No Dreamina accounts configured',
                        'note': 'Please add at least one sessionid in config.json'
                    })
                }
            
            # Initialize token manager and API client
            token_manager = TokenManager(config)
            api_client = ApiClient(token_manager, config)
            
            # Generate image(s)
            results = []
            for i in range(min(n, 4)):  # Max 4 images
                if image:
                    # Image-to-image
                    result = api_client.image_to_image(
                        prompt=prompt,
                        image_base64=image,
                        model=model,
                        ratio=ratio,
                        resolution=resolution
                    )
                else:
                    # Text-to-image
                    result = api_client.text_to_image(
                        prompt=prompt,
                        model=model,
                        ratio=ratio,
                        resolution=resolution
                    )
                
                if result and result.get('image_url'):
                    results.append({
                        'url': result['image_url'],
                        'revised_prompt': prompt,
                    })
            
            if not results:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Image generation failed'})
                }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'created': int(__import__('time').time()),
                    'data': results
                })
            }
            
        except ImportError as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Dreamina API import failed',
                    'details': str(e)
                })
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Image generation failed',
                    'details': str(e)
                })
            }
            
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal server error',
                'details': str(e)
            })
        }

