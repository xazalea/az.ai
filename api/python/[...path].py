"""
Unified Python API router - handles all Python-based API routes
Routes: /api/python/{service}/{version}/{endpoint}
"""

import json
import sys
from pathlib import Path

def handler(request):
    """Vercel Python serverless function handler for all Python routes"""
    try:
        if hasattr(request, 'body'):
            body = json.loads(request.body) if isinstance(request.body, str) else request.body
        else:
            body = {}
        
        method = getattr(request, 'method', 'POST')
        
        if method == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
                'body': json.dumps({})
            }
        
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed'})
            }
        
        # Extract path from request
        path = getattr(request, 'path', '')
        if not path:
            # Try to get from URL
            url = getattr(request, 'url', '')
            if url:
                from urllib.parse import urlparse
                parsed = urlparse(url)
                path = parsed.path
        
        # Parse path: /api/python/{service}/{version}/{endpoint}
        path_parts = [p for p in path.split('/') if p]
        
        if len(path_parts) < 4:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Invalid path format'})
            }
        
        service = path_parts[2]  # e.g., 'dreamina', 'deepseekfree', etc.
        version = path_parts[3] if len(path_parts) > 3 else 'v1'
        endpoint = '/'.join(path_parts[4:]) if len(path_parts) > 4 else ''
        
        # Route to appropriate handler
        if service == 'dreamina' and endpoint == 'images/generations':
            # Dreamina image generation
            dreamina_path = Path(__file__).parent.parent.parent / "packages" / "dreamina-free-api"
            sys.path.insert(0, str(dreamina_path))
            
            try:
                from core.token_manager import TokenManager
                from core.api_client import ApiClient
                
                prompt = body.get('prompt')
                model = body.get('model', 'dreamina-4.0')
                size = body.get('size', '1024x1024')
                n = body.get('n', 1)
                image = body.get('image')
                
                if not prompt:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Missing prompt'})
                    }
                
                width, height = map(int, size.split('x'))
                ratio = '1:1' if width == height else ('16:9' if width > height else '9:16')
                resolution = '4k' if max(width, height) >= 2048 else '2k'
                
                config_path = dreamina_path / 'config.json'
                if not config_path.exists():
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'Dreamina not configured'})
                    }
                
                with open(config_path, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                
                if not config.get('accounts'):
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({'error': 'No Dreamina accounts configured'})
                    }
                
                token_manager = TokenManager(config)
                api_client = ApiClient(token_manager, config)
                
                results = []
                for i in range(min(n, 4)):
                    if image:
                        result = api_client.image_to_image(
                            prompt=prompt,
                            image_base64=image,
                            model=model,
                            ratio=ratio,
                            resolution=resolution
                        )
                    else:
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
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Dreamina error', 'details': str(e)})
                }
        
        elif service == 'deepseekfree' and endpoint == 'chat/completions':
            # DeepSeek Free API
            deepseek_path = Path(__file__).parent.parent.parent / "packages" / "deepseek-free-api"
            sys.path.insert(0, str(deepseek_path))
            
            try:
                from api.routes.chat import create_completion
                
                messages = body.get('messages', [])
                model = body.get('model', 'deepseek-chat')
                
                result = await create_completion(messages, model)
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps(result)
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'DeepSeek error', 'details': str(e)})
                }
        
        elif service == 'gemini-multimodal' and endpoint == 'chat/completions':
            # Gemini Multimodal
            gemini_path = Path(__file__).parent.parent.parent / "packages" / "gemini-multimodal-playground"
            sys.path.insert(0, str(gemini_path))
            
            try:
                # Import and use Gemini API
                messages = body.get('messages', [])
                model = body.get('model', 'gemini-pro')
                
                # Placeholder - implement Gemini API call
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'choices': [{'message': {'content': 'Gemini multimodal response'}}]
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Gemini error', 'details': str(e)})
                }
        
        elif service == 'imageai' and endpoint == 'images/generations':
            # ImageAI
            imageai_path = Path(__file__).parent.parent.parent / "packages" / "ImageAI"
            sys.path.insert(0, str(imageai_path))
            
            try:
                prompt = body.get('prompt')
                model = body.get('model', 'google')
                
                # Placeholder - implement ImageAI call
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'data': [{'url': 'placeholder'}]
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'ImageAI error', 'details': str(e)})
                }
        
        elif service == 'video' and endpoint == 'videos/generations':
            # Video (Veo) - Google VEO API integration using VeoClient
            video_path = Path(__file__).parent.parent.parent / "packages" / "ImageAI"
            sys.path.insert(0, str(video_path))
            
            try:
                from core.video.veo_client import VeoClient, VeoGenerationConfig, VeoModel
                import asyncio
                import base64
                import tempfile
                import os
                
                prompt = body.get('prompt')
                model = body.get('model', 'veo-3')
                aspect_ratio = body.get('aspect_ratio', '16:9')
                duration = body.get('duration', 8.0)
                n = body.get('n', 1)
                image = body.get('image')  # Base64 image for image-to-video
                
                # Get Google API key from environment
                google_api_key = os.environ.get('GOOGLE_API_KEY') or os.environ.get('GEMINI_API_KEY')
                if not google_api_key:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*',
                        },
                        'body': json.dumps({
                            'error': 'Google API key required for VEO video generation',
                            'note': 'Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable in Vercel',
                            'alternative': 'Use other video models like jimeng-api, viggle, or ai-video which don\'t require API keys'
                        })
                    }
                
                # Map model names to VeoModel enum
                model_map = {
                    'veo-3': VeoModel.VEO_3_GENERATE,
                    'veo-3.1': VeoModel.VEO_3_1_GENERATE,
                    'veo-3.0': VeoModel.VEO_3_GENERATE,
                    'veo-3.1-generate': VeoModel.VEO_3_1_GENERATE,
                    'veo-3-fast': VeoModel.VEO_3_FAST,
                    'veo-2': VeoModel.VEO_2_GENERATE,
                }
                veo_model = model_map.get(model.lower(), VeoModel.VEO_3_GENERATE)
                
                # Map aspect ratio
                aspect_map = {
                    '16:9': '16:9',
                    '9:16': '9:16',
                    '1:1': '1:1',
                    '4:3': '4:3',
                    '3:4': '3:4',
                }
                veo_aspect = aspect_map.get(aspect_ratio, '16:9')
                
                # Ensure duration is 8 for Veo 3.0/3.1 (required by API)
                if veo_model in [VeoModel.VEO_3_GENERATE, VeoModel.VEO_3_1_GENERATE]:
                    duration = 8.0
                elif veo_model == VeoModel.VEO_3_FAST:
                    # Veo 3 Fast supports 4, 6, or 8 seconds
                    if duration not in [4, 6, 8]:
                        duration = 8.0
                
                # Initialize Veo client
                veo_client = VeoClient(api_key=google_api_key, auth_mode='api-key')
                
                # Handle image-to-video if image provided
                seed_image_path = None
                if image:
                    # Decode base64 image
                    try:
                        if ',' in image:
                            image = image.split(',')[1]  # Remove data:image/...;base64, prefix
                        image_bytes = base64.b64decode(image)
                        
                        # Save to temp file
                        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                            tmp.write(image_bytes)
                            seed_image_path = Path(tmp.name)
                    except Exception as e:
                        return {
                            'statusCode': 400,
                            'headers': {'Content-Type': 'application/json'},
                            'body': json.dumps({'error': 'Invalid image data', 'details': str(e)})
                        }
                
                # Generate videos (up to n variations, max 4)
                videos = []
                for i in range(min(n, 4)):
                    try:
                        # Create generation config
                        config = VeoGenerationConfig(
                            prompt=prompt,
                            model=veo_model,
                            duration=int(duration),
                            aspect_ratio=veo_aspect,
                            image=seed_image_path,
                        )
                        
                        # Generate video (async)
                        loop = asyncio.new_event_loop()
                        asyncio.set_event_loop(loop)
                        result = loop.run_until_complete(veo_client.generate_video_async(config))
                        loop.close()
                        
                        if result.success and result.video_path:
                            # Read video and convert to base64 or return URL
                            with open(result.video_path, 'rb') as f:
                                video_bytes = f.read()
                            
                            # For Vercel, we'll return base64
                            video_b64 = base64.b64encode(video_bytes).decode('utf-8')
                            video_url = f"data:video/mp4;base64,{video_b64}"
                            
                            # Generate poster (first frame) if available
                            poster_url = ""
                            if result.poster_path and result.poster_path.exists():
                                with open(result.poster_path, 'rb') as f:
                                    poster_bytes = f.read()
                                poster_b64 = base64.b64encode(poster_bytes).decode('utf-8')
                                poster_url = f"data:image/png;base64,{poster_b64}"
                            
                            videos.append({
                                'url': video_url,
                                'poster': poster_url,
                                'revised_prompt': prompt,
                            })
                            
                            # Cleanup temp files
                            if seed_image_path and seed_image_path.exists():
                                try:
                                    os.unlink(seed_image_path)
                                except:
                                    pass
                        else:
                            videos.append({
                                'error': result.error or 'Generation failed'
                            })
                    except Exception as e:
                        videos.append({
                            'error': str(e)
                        })
                
                if not videos or all('error' in v for v in videos):
                    return {
                        'statusCode': 500,
                        'headers': {'Content-Type': 'application/json'},
                        'body': json.dumps({
                            'error': 'Video generation failed',
                            'details': videos[0].get('error') if videos else 'Unknown error'
                        })
                    }
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                    },
                    'body': json.dumps({
                        'created': int(__import__('time').time()),
                        'data': [{'url': v['url'], 'poster': v.get('poster', ''), 'revised_prompt': v.get('revised_prompt', prompt)} for v in videos if 'url' in v]
                    })
                }
            except ImportError as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'error': 'Veo client not available',
                        'details': str(e),
                        'note': 'Install google-genai package: pip install google-genai'
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'Video generation error', 'details': str(e)})
                }
        
        elif service == 'ai-video' and endpoint == 'videos/generations':
            # AI Video API
            ai_video_path = Path(__file__).parent.parent.parent / "packages" / "ai-video-api"
            sys.path.insert(0, str(ai_video_path))
            
            try:
                prompt = body.get('prompt')
                model = body.get('model', 'tongyi')
                
                # Placeholder - implement AI Video API call
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'data': [{'url': 'placeholder'}]
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'AI Video error', 'details': str(e)})
                }
        
        elif service == 'webai' and endpoint == 'chat/completions':
            # WebAI (g4f)
            webai_path = Path(__file__).parent.parent.parent / "packages" / "webai-to-api"
            sys.path.insert(0, str(webai_path))
            
            try:
                messages = body.get('messages', [])
                model = body.get('model', 'gpt-3.5-turbo')
                
                # Placeholder - implement WebAI call
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'choices': [{'message': {'content': 'WebAI response'}}]
                    })
                }
            except Exception as e:
                return {
                    'statusCode': 500,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'error': 'WebAI error', 'details': str(e)})
                }
        
        elif service == 'removerized' and endpoint == 'images/edit':
            # Removerized background removal
            return {
                'statusCode': 501,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Background removal requires client-side processing',
                    'note': 'Use @imgly/background-removal-js in browser or Node.js'
                })
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': f'Unknown service: {service}'})
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

