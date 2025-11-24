"""
Video Generation API using ImageAI's Veo capabilities
"""

import json
import sys
import base64
from pathlib import Path
from typing import Optional

# Add ImageAI to path
imageai_path = Path(__file__).parent.parent.parent / "packages" / "ImageAI"
sys.path.insert(0, str(imageai_path))

def handler(request):
    """Vercel Python serverless function handler for video generation"""
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
        model = body.get('model', 'veo-3')
        duration = body.get('duration', 8.0)
        aspect_ratio = body.get('aspect_ratio', '16:9')
        start_frame = body.get('start_frame')  # Base64 encoded image
        
        if not prompt:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing prompt'})
            }
        
        # Try to use ImageAI's Veo client
        try:
            from core.video.veo_client import VeoClient, VeoGenerationConfig, VeoModel
            from google.generativeai import configure
            
            # Get API key from Authorization header
            auth_header = getattr(request, 'headers', {}).get('Authorization', '')
            if auth_header.startswith('Bearer '):
                api_key = auth_header.split(' ', 1)[1]
                configure(api_key=api_key)
            else:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Missing API key in Authorization header (Bearer <API_KEY>)'})
                }
            
            # Initialize Veo client
            veo_client = VeoClient(api_key=api_key)
            
            # Map model string to VeoModel enum
            model_map = {
                'veo-3': VeoModel.VEO_3,
                'veo-3-fast': VeoModel.VEO_3_FAST,
                'veo-2': VeoModel.VEO_2,
            }
            veo_model = model_map.get(model, VeoModel.VEO_3)
            
            # Prepare config
            config = VeoGenerationConfig(
                prompt=prompt,
                model=veo_model,
                aspect_ratio=aspect_ratio,
                duration_seconds=duration,
            )
            
            # Handle start frame if provided
            if start_frame:
                # Decode base64 image
                try:
                    image_data = base64.b64decode(start_frame)
                    # Save to temp file (Veo client expects Path)
                    import tempfile
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                        tmp.write(image_data)
                        config.seed_image = Path(tmp.name)
                except Exception as e:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': f'Invalid start_frame: {str(e)}'})
                    }
            
            # Generate video (async, but we'll wait)
            import asyncio
            result = asyncio.run(veo_client.generate_video_async(config))
            
            if result.error:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Video generation failed', 'details': result.error})
                }
            
            # Read video file and encode as base64
            if result.video_path and result.video_path.exists():
                with open(result.video_path, 'rb') as f:
                    video_bytes = f.read()
                    video_b64 = base64.b64encode(video_bytes).decode('utf-8')
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'created': int(result.metadata.get('completed_at', 0)),
                        'data': [{
                            'b64_video': video_b64,
                            'url': f'data:video/mp4;base64,{video_b64}',
                            'revised_prompt': result.metadata.get('prompt', prompt),
                            'duration': duration,
                            'model': model
                        }]
                    })
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Video generation completed but no video file found'})
                }
                
        except ImportError as e:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Video generation dependencies not available',
                    'details': str(e),
                    'note': 'ImageAI Veo client requires google-generativeai package'
                })
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Video generation failed', 'details': str(e)})
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }

