# WebAI-to-API (g4f) wrapper for Vercel
import json
import os
from pathlib import Path
import sys

# Add the WebAI-to-API package to the Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent / 'packages' / 'WebAI-to-API' / 'src'))

def handler(request, response):
    if request.method != 'POST':
        response.status = 405
        response.send(json.dumps({'error': 'Method not allowed'}))
        return

    try:
        body = json.loads(request.body)
        messages = body.get('messages', [])
        model = body.get('model', 'gpt-3.5-turbo')
        stream = body.get('stream', False)

        if not messages:
            response.status = 400
            response.send(json.dumps({'error': 'Missing messages'}))
            return

        # Try to use g4f if available
        try:
            import g4f
            from g4f.client import Client as G4FClient
            
            # Initialize g4f client
            client = G4FClient()
            
            # Convert messages format if needed
            chat_messages = []
            for msg in messages:
                chat_messages.append({
                    'role': msg.get('role', 'user'),
                    'content': msg.get('content', '')
                })
            
            # Make request to g4f
            g4f_response = client.chat.completions.create(
                model=model,
                messages=chat_messages,
                stream=stream
            )
            
            if stream:
                # Handle streaming response
                response.status = 200
                response.headers['Content-Type'] = 'text/event-stream'
                response.headers['Access-Control-Allow-Origin'] = '*'
                
                # For simplicity, collect all chunks and send as one response
                # In production, you'd want to stream properly
                full_content = ""
                for chunk in g4f_response:
                    if hasattr(chunk, 'choices') and chunk.choices:
                        delta = chunk.choices[0].delta
                        if hasattr(delta, 'content') and delta.content:
                            full_content += delta.content
                
                # Send as non-streaming response for Vercel compatibility
                response.send(json.dumps({
                    'id': f'chatcmpl-webai-{int(os.time())}',
                    'object': 'chat.completion',
                    'created': int(os.time()),
                    'model': model,
                    'choices': [{
                        'index': 0,
                        'message': {
                            'role': 'assistant',
                            'content': full_content
                        },
                        'finish_reason': 'stop'
                    }],
                    'usage': {
                        'prompt_tokens': 0,
                        'completion_tokens': 0,
                        'total_tokens': 0
                    }
                }))
            else:
                # Non-streaming response
                content = ""
                if hasattr(g4f_response, 'choices') and g4f_response.choices:
                    content = g4f_response.choices[0].message.content
                elif hasattr(g4f_response, 'content'):
                    content = g4f_response.content
                else:
                    content = str(g4f_response)
                
                response.status = 200
                response.send(json.dumps({
                    'id': f'chatcmpl-webai-{int(os.time())}',
                    'object': 'chat.completion',
                    'created': int(os.time()),
                    'model': model,
                    'choices': [{
                        'index': 0,
                        'message': {
                            'role': 'assistant',
                            'content': content
                        },
                        'finish_reason': 'stop'
                    }],
                    'usage': {
                        'prompt_tokens': 0,
                        'completion_tokens': 0,
                        'total_tokens': 0
                    }
                }))
                
        except ImportError:
            # Fallback: Use WebAI-to-API's FastAPI app if g4f is not available
            # This would require running the FastAPI app separately or using httpx to call it
            response.status = 503
            response.send(json.dumps({
                'error': 'g4f library not available. Please install g4f in the Python environment.',
                'details': 'WebAI-to-API requires g4f library to be installed.'
            }))
            
    except Exception as e:
        print(f"WebAI-to-API Error: {e}")
        response.status = 500
        response.send(json.dumps({'error': 'WebAI-to-API generation failed', 'details': str(e)}))

# Vercel Python runtime expects a 'handler' function
if __name__ == '__main__':
    class MockRequest:
        def __init__(self, method, headers, body):
            self.method = method
            self.headers = headers
            self.body = body

    class MockResponse:
        def __init__(self):
            self.status = 200
            self._data = None
            self.headers = {}

        def send(self, data):
            self._data = data

        def json(self):
            return json.loads(self._data)

    # Example usage for local testing
    mock_req = MockRequest(
        method='POST',
        headers={'Content-Type': 'application/json'},
        body=json.dumps({
            'model': 'gpt-3.5-turbo',
            'messages': [{'role': 'user', 'content': 'Hello, how are you?'}]
        })
    )
    mock_res = MockResponse()
    handler(mock_req, mock_res)
    print(mock_res.json())

