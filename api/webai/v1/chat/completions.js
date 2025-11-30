import { NextResponse } from 'next/server';
import { ChatCompletion } from 'g4f';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req) {
  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed', details: 'Only POST requests are supported' },
      { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    const body = await req.json();
    const { model, messages, stream = false } = body;

    if (!model || !messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Bad request', details: 'Model and messages array are required' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Create timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 30000); // 30 second timeout

    try {
      // Use g4f-ts to generate response
      const chatCompletion = new ChatCompletion();
      
      // Convert messages format - g4f-ts expects OpenAI format
      const conversation = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      // Generate response with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 30000);
      });

      const responsePromise = chatCompletion.create({
        model: model,
        messages: conversation,
        stream: stream,
      });

      // Race between response and timeout
      const response = await Promise.race([
        responsePromise,
        timeoutPromise
      ]);

      clearTimeout(timeoutId);

      // Handle streaming vs non-streaming
      if (stream) {
        // For streaming, we need to handle it differently
        // For now, collect all chunks
        let fullContent = '';
        if (response && typeof response === 'object' && 'next' in response) {
          // It's an async iterator
          for await (const chunk of response) {
            if (chunk.choices && chunk.choices[0]?.delta?.content) {
              fullContent += chunk.choices[0].delta.content;
            }
          }
        } else if (typeof response === 'string') {
          fullContent = response;
        } else if (response?.choices?.[0]?.message?.content) {
          fullContent = response.choices[0].message.content;
        }

        // Return non-streaming response for simplicity
        return NextResponse.json({
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: fullContent,
            },
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / 4,
            completion_tokens: fullContent.length / 4,
            total_tokens: (messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) + fullContent.length) / 4,
          },
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      } else {
        // Non-streaming response
        let content = '';
        
        if (typeof response === 'string') {
          content = response;
        } else if (response?.choices?.[0]?.message?.content) {
          content = response.choices[0].message.content;
        } else if (response?.content) {
          content = response.content;
        } else {
          // Try to extract content from various possible formats
          content = JSON.stringify(response);
        }

        if (!content) {
          throw new Error('No content in response');
        }

        return NextResponse.json({
          id: `chatcmpl-${Date.now()}`,
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: content,
            },
            finish_reason: 'stop',
          }],
          usage: {
            prompt_tokens: messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / 4,
            completion_tokens: content.length / 4,
            total_tokens: (messages.reduce((sum, m) => sum + (m.content?.length || 0), 0) + content.length) / 4,
          },
        }, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);

      // Handle timeout
      if (fetchError.name === 'AbortError' || fetchError.message?.includes('timeout') || fetchError.message?.includes('aborted')) {
        console.error(`[WebAI] Request timeout for model: ${model}`);
        return NextResponse.json(
          {
            error: 'Request timeout',
            details: 'The request took too long to complete (over 30 seconds). Please try again with a different model.',
            model: model,
          },
          {
            status: 504,
            headers: { 'Access-Control-Allow-Origin': '*' }
          }
        );
      }

      // Handle other errors
      console.error(`[WebAI] Error for model: ${model}`, fetchError);
      return NextResponse.json(
        {
          error: 'Model error',
          details: fetchError.message || 'Failed to generate response',
          model: model,
          errorType: fetchError.name || 'UnknownError',
        },
        {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        }
      );
    }
  } catch (error) {
    console.error('[WebAI] Top-level error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        details: error.message || 'An unexpected error occurred',
        errorType: error.name || 'UnknownError',
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}

