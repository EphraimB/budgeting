const fs = require('fs');

const pluginMiddleware = (app) => {
    const pluginsDir = './plugins';

    // Loop through all the plugins in the plugins directory
    fs.readdirSync(pluginsDir).forEach((plugin) => {
        // Load the plugin's routes
        const pluginRoutes = require(`${pluginsDir}/${plugin}/routes`);

        // Connect to the plugin's database
        const pluginDb = require(`${pluginsDir}/${plugin}/db`);

        // Add the plugin routes to the main app
        app.use(pluginRoutes);

        // Expose the plugin database to the main app
        app.set(plugin, pluginDb);
    });
};

module.exports = pluginMiddleware;
