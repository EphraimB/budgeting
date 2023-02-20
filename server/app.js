const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const depositsRouter = require('./routes/depositsRouter');
const withdrawalsRouter = require('./routes/withdrawalsRouter');

const app = express();

app.use(bodyParser.json());

app.use('/', routes);
app.use('/accounts', accountsRouter);
app.use('/deposits', depositsRouter);
app.use('/withdrawals', withdrawalsRouter);

module.exports = app;