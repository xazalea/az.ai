// ChatGPTAPIFree wrapper - Express app
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.disable('etag');
app.disable('x-powered-by');
app.use(express.json());

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Simple proxy handler - ChatGPTAPIFree style
const handlePost = async (req, res) => {
  try {
    const upstreamUrl = 'https://api.openai.com/v1/chat/completions';
    const authHeader = req.get('Authorization') || req.headers.authorization;
    
    const requestHeader = {
      'Content-Type': 'application/json',
      'Authorization': authHeader || 'Bearer free',
      'User-Agent': 'curl/7.64.1',
    };
    
    const resUpstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: requestHeader,
      body: JSON.stringify(req.body),
    });

    if (!resUpstream.ok) {
      const text = await resUpstream.text();
      return res.status(resUpstream.status).set(corsHeaders).type('text/plain').send(`OpenAI API responded:\n\n${text}`);
    }

    const contentType = resUpstream.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.set(corsHeaders);
    
    if (req.body.stream) {
      res.setHeader('Connection', 'keep-alive');
      resUpstream.body.pipe(res);
    } else {
      const data = await resUpstream.json();
      res.json(data);
    }
  } catch (error) {
    res.status(500).set(corsHeaders).type('text/plain').send(error.message);
  }
};

app.options('/v1/chat/completions', (req, res) => {
  res.setHeader('Access-Control-Max-Age', '1728000').set(corsHeaders).sendStatus(204);
});

app.post('/v1/chat/completions', handlePost);

module.exports = app;

