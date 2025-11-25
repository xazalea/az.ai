"""
Removerized Background Removal API
Removes background from images using AI
"""

import json
import sys
import base64
from pathlib import Path
from io import BytesIO

def handler(request):
    """Vercel Python serverless function handler for background removal"""
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
        
        image = body.get('image')  # Base64 encoded image
        image_url = body.get('image_url')  # URL to image
        
        if not image and not image_url:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Missing image or image_url'})
            }
        
        try:
            import requests
            from PIL import Image
            import numpy as np
            
            # Get image data
            if image:
                # Decode base64
                if ',' in image:
                    image = image.split(',')[1]
                image_data = base64.b64decode(image)
            else:
                # Download from URL
                response = requests.get(image_url, timeout=30)
                image_data = response.content
            
            # Load image
            img = Image.open(BytesIO(image_data))
            
            # Note: The actual background removal library (@imgly/background-removal-js) 
            # is JavaScript-based and requires browser environment or Node.js
            # For Python, we'll use an alternative approach or proxy to a service
            
            # For now, return a note that this requires client-side processing
            # or integration with a Python-based background removal library
            return {
                'statusCode': 501,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Background removal requires client-side processing',
                    'note': 'Removerized uses @imgly/background-removal-js which requires browser/Node.js environment. Consider using a Python alternative like rembg or integrating the JS library in a Node.js serverless function.',
                    'alternatives': [
                        'Use rembg Python library',
                        'Create Node.js serverless function for @imgly/background-removal-js',
                        'Use external API service'
                    ]
                })
            }
            
        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Background removal failed',
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

