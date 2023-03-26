const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const depositsRouter = require('./routes/depositsRouter');
const withdrawalsRouter = require('./routes/withdrawalsRouter');
const loansRouter = require('./routes/loansRouter');
const wishlistRouter = require('./routes/wishlistRouter');
const transferRouter = require('./routes/transfersRouter');
const transactionsRouter = require('./routes/transactionsRouter');
const pluginMiddleware = require('./plugin-middleware');
const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

const app = express();

// Define the plugins directory
const pluginsDir = './plugins';

// Read the plugin directories and mount the routes for each plugin
fs.readdirSync(pluginsDir).forEach(plugin => {
    const pluginDir = path.join(__dirname, pluginsDir, plugin);
    const pluginRouterPath = path.join(pluginDir, 'router.js');
    if (fs.existsSync(pluginRouterPath)) {
        const pluginRouter = require(pluginRouterPath);
        app.use(`/api/${plugin.replace('-plugin', '')}`, pluginRouter);
    }
});

app.use(bodyParser.json());

app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.use('/', routes);
app.use('/api/accounts', accountsRouter);
app.use('/api/deposits', depositsRouter);
app.use('/api/withdrawals', withdrawalsRouter);
// app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/wishlists', wishlistRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/transactions', transactionsRouter);

module.exports = app;