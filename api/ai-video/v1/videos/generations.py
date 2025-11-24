"""
AI Video API wrapper - supports multiple video generation providers
"""

import json
import sys
from pathlib import Path

# Add ai-video-api to path
ai_video_path = Path(__file__).parent.parent.parent / "packages" / "ai-video-api"
sys.path.insert(0, str(ai_video_path))

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
        model = body.get('model', 'tongyi')  # Default to Tongyi
        image = body.get('image')  # Base64 encoded image for image-to-video
        video = body.get('video')  # Reference video
        
        if not prompt and not image:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing prompt or image'})
            }
        
        # Try to use ai-video-api
        try:
            from video_generation.generator import VideoGenerator
            
            # Initialize generator based on model
            generator = VideoGenerator(provider=model)
            
            # Generate video
            if image:
                # Image-to-video
                import base64
                import tempfile
                image_data = base64.b64decode(image)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
                    tmp.write(image_data)
                    result = generator.image_to_video(
                        image_path=tmp.name,
                        prompt=prompt or "Generate video from image"
                    )
            elif video:
                # Subject reference video
                import base64
                import tempfile
                video_data = base64.b64decode(video)
                with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as tmp:
                    tmp.write(video_data)
                    result = generator.subject_reference(
                        subject_video_path=tmp.name,
                        prompt=prompt
                    )
            else:
                # Text-to-video
                result = generator.text_to_video(prompt=prompt)
            
            # Read video file and encode as base64
            if result and hasattr(result, 'video_path'):
                with open(result.video_path, 'rb') as f:
                    video_bytes = f.read()
                    video_b64 = base64.b64encode(video_bytes).decode('utf-8')
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({
                        'created': int(result.created_at) if hasattr(result, 'created_at') else int(__import__('time').time()),
                        'data': [{
                            'b64_video': video_b64,
                            'url': f'data:video/mp4;base64,{video_b64}',
                            'revised_prompt': prompt,
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
                    'error': 'AI Video API dependencies not available',
                    'details': str(e),
                    'note': 'ai-video-api requires installation of dependencies'
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

