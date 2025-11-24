"""
Gemini Multimodal Playground API wrapper
"""

import json
import sys
from pathlib import Path

# Add gemini-multimodal-playground to path
gemini_path = Path(__file__).parent.parent.parent / "packages" / "gemini-multimodal-playground" / "backend"
sys.path.insert(0, str(gemini_path))

def handler(request):
    """Vercel Python serverless function handler"""
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
        
        # Try to use Gemini multimodal API
        try:
            from main import app as gemini_app
            # For now, return integration status
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'message': 'Gemini Multimodal Playground integrated',
                    'note': 'Full functionality requires proper FastAPI setup'
                })
            }
        except ImportError:
            return {
                'statusCode': 503,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Gemini multimodal dependencies not available'
                })
            }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)})
        }

