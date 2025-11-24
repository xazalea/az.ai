// free-gpt3.5-2api is already Vercel-compatible via Go
// This is just a passthrough route
module.exports = (req, res) => {
    // The Go handler is already set up in vercel.json
    // This file exists for documentation
    res.status(200).json({ 
        message: 'free-gpt3.5-2api is handled by Go runtime',
        endpoint: '/api/freegpt/v1/chat/completions'
    });
};

