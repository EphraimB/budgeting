const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const depositsRouter = require('./routes/depositsRouter');
const withdrawalsRouter = require('./routes/withdrawalsRouter');
const expensesRouter = require('./routes/expensesRouter');
const loansRouter = require('./routes/loansRouter');
const wishlistRouter = require('./routes/wishlistRouter');
const currentBalanceRouter = require('./routes/currentBalanceRouter');

const app = express();

app.use(bodyParser.json());

app.use('/', routes);
app.use('/accounts', accountsRouter);
app.use('/deposits', depositsRouter);
app.use('/withdrawals', withdrawalsRouter);
app.use('/expenses', expensesRouter);
app.use('/loans', loansRouter);
app.use('/wishlists', wishlistRouter);
app.use('/currentBalance', currentBalanceRouter);

module.exports = app;