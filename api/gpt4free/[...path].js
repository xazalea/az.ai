// gpt4free-ts wrapper
// This will initialize the app on first call
let handlerInstance = null;

module.exports = (req, res) => {
    if (!handlerInstance) {
        try {
            // Import and initialize
            const { registerApp } = require('../../packages/gpt4free-ts/dist/router.js');
            handlerInstance = registerApp();
        } catch (error) {
            console.error('gpt4free-ts initialization error:', error);
            return res.status(500).json({ error: 'Failed to initialize gpt4free-ts', details: error.message });
        }
    }
    
    if (handlerInstance && typeof handlerInstance === 'function') {
        return handlerInstance(req, res);
    }
    
    res.status(500).json({ error: 'gpt4free-ts handler not properly configured' });
};

