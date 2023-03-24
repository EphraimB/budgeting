const fs = require('fs');
const path = require('path');

const pluginsDir = './plugins';

const pluginMiddleware = (pluginName) => {
    // Check if the plugin middleware exists
    const pluginMiddlewarePath = path.join(pluginsDir, pluginName, 'middleware.js');
    if (fs.existsSync(pluginMiddlewarePath)) {
        const pluginMiddleware = require(pluginMiddlewarePath);
        return pluginMiddleware;
    } else {
        // If the plugin middleware doesn't exist, return a no-op middleware function
        return (request, response, next) => {
            request[pluginName] = {};
            next();
        };
    }
};

module.exports = pluginMiddleware;
