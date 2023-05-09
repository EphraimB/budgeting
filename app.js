const express = require('express');
const fs = require('fs');
const Bree = require('bree');
const Cabin = require('cabin');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/routes');
const accountsRouter = require('./routes/accountsRouter');
const transactionRouter = require('./routes/transactionRouter');
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
const getJobs = require('./getJobs');

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

const bree = new Bree({
  logger: new Cabin(),
  root: cronjobsDir
});

async function startBree() {
  try {
    const jobs = await getJobs();
    bree.config.jobs = jobs;
    console.log(`Bree configured with ${bree.config.jobs}`);
    await bree.start();
  } catch (error) {
    console.log(error);
  }
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
app.use('/api/transaction', transactionRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/payroll', payrollRouter);
app.use('/api/payroll/dates', payrollDatesRouter);
app.use('/api/payroll/taxes', payrollTaxesRouter);
app.use('/api/payroll/employee', payrollEmployeeRouter);
app.use('/api/wishlists', wishlistRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/transactions', transactionsRouter);

module.exports = {
  app,
  bree
};