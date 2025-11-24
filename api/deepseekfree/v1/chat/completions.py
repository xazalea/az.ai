"""
deepseek4free Python API wrapper for Vercel
"""

import json
import sys
from pathlib import Path

# Add deepseek4free to path
deepseek_path = Path(__file__).parent.parent.parent / "packages" / "deepseek4free"
sys.path.insert(0, str(deepseek_path))

def handler(request):
    """Vercel Python serverless function handler"""
    try:
        # Parse request
        if hasattr(request, 'body'):
            body = json.loads(request.body) if isinstance(request.body, str) else request.body
        else:
            body = {}
        
        method = getattr(request, 'method', 'POST')
        path = getattr(request, 'path', '/')
        
        if method != 'POST' or not path.endswith('/chat/completions'):
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed or invalid path'})
            }
        
        # Import deepseek4free
        try:
            from dsk.server import app as deepseek_app
            from dsk.bypass import get_cookies
            
            # For now, return a simple response indicating deepseek4free integration
            # The actual implementation would require setting up the FastAPI app properly
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'message': 'deepseek4free integrated',
                    'note': 'This requires proper FastAPI setup for full functionality',
                    'prompt': body.get('messages', [{}])[-1].get('content', '') if body.get('messages') else ''
                })
            }
        except ImportError as e:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'deepseek4free dependencies not available',
                    'details': str(e)
                })
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }

