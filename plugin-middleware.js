const path = require('path');

const pluginsDir = './plugins';

function pluginMiddleware(pluginName) {
    // Load the plugin module dynamically based on the plugin name parameter
    const pluginModulePath = path.join(pluginsDir, `${pluginName}-plugin`, 'middleware.js');
    const pluginModule = require(pluginModulePath);

    return (request, response, next) => {
        request[pluginName] = {};
        pluginModule(request, response, () => {
            next();
        });
    };
}

module.exports = pluginMiddleware;
