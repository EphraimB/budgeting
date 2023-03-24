const express = require('express');

function loadPluginRoutes(pluginName) {
    // Import the routes from the plugin module
    const pluginRoutes = require(`${pluginsDir}/${pluginName}/routes`);

    // Create a new router for the plugin routes
    const router = express.Router();

    // Add the plugin routes to the router
    pluginRoutes(router);

    // Return the router as middleware
    return router;
}

module.exports = loadPluginRoutes;