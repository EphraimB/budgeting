const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const depositsRouter = require('./routes/depositsRouter');
const withdrawalsRouter = require('./routes/withdrawalsRouter');
const expensesRouter = require('./routes/expensesRouter');
const loansRouter = require('./routes/loansRouter');
const wishlistRouter = require('./routes/wishlistRouter');
const transactionsRouter = require('./routes/transactionsRouter');

const app = express();

app.use(bodyParser.json());

app.use('/api/', routes);
app.use('/api/accounts', accountsRouter);
app.use('/api/deposits', depositsRouter);
app.use('/api/withdrawals', withdrawalsRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/wishlists', wishlistRouter);
app.use('/api/transactions', transactionsRouter);

module.exports = app;