const app = require('../../packages/qwen-free-api/dist/index.js');

module.exports = (req, res) => {
    const handler = app.default || app;
    return handler(req, res);
};

