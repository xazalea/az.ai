const app = require('../../packages/minimax-free-api/dist/index.js');

module.exports = (req, res) => {
    const handler = app.default || app;
    return handler(req, res);
};

