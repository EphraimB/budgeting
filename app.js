const express = require('express');
const fs = require('fs');
const path = require('path');
const { Bree } = require('bree');
const jobsFilePath = '/jobs.json';
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
const swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

const app = express();

app.use(bodyParser.json());

app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

if (fs.existsSync(jobsFilePath)) {
    const jobsFilePath = path.join(__dirname, '..', 'jobs.json');

    // Read the job definitions from the JSON file
    const jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));

    // Create a new Bree instance with the job definitions
    const bree = new Bree({ jobs });
}

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

module.exports = app;