const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const transactionHistoryRouter = require('./routes/transactionHistoryRouter');
const expensesRouter = require('./routes/expensesRouter');
const loansRouter = require('./routes/loansRouter');
const payrollRouter = require('./routes/payrollRouter');
const payrollDatesRouter = require('./routes/payrollDatesRouter');
const payrollTaxesRouter = require('./routes/payrollTaxesRouter');
const payrollEmployeeRouter = require('./routes/payrollEmployeeRouter');
const wishlistRouter = require('./routes/wishlistRouter');
const transferRouter = require('./routes/transfersRouter');
const transactionsRouter = require('./routes/transactionsRouter');
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');
const swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');
const { bree, startBree } = require('./breeManager'); // Import the bree instance and startBree function

const app = express();

app.use(bodyParser.json());

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

if (!fs.existsSync(cronjobsDir)) {
  fs.mkdirSync(cronjobsDir);
}


startBree()
  .then(() => {
    console.log(`Bree started with ${bree.config.jobs}`);
  })
  .catch((error) => {
    console.error('Failed to start Bree:', error);
  });

app.use('/api/', routes);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactionHistory', transactionHistoryRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/payroll/dates', payrollDatesRouter);
app.use('/api/payroll/taxes', payrollTaxesRouter);
app.use('/api/payroll/employee', payrollEmployeeRouter);
app.use('/api/wishlists', wishlistRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/transactions', transactionsRouter);

module.exports = app