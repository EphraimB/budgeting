import express from 'express';
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import bodyParser from 'body-parser';
import routes from './routes/routes.js';
import accountsRouter from './routes/accountsRouter.js';
import transactionHistoryRouter from './routes/transactionHistoryRouter.js';
import expensesRouter from './routes/expensesRouter.js';
import loansRouter from './routes/loansRouter.js';
import payrollRouter from './routes/payrollRouter.js';
import payrollDatesRouter from './routes/payrollDatesRouter.js';
import payrollTaxesRouter from './routes/payrollTaxesRouter.js';
import payrollEmployeeRouter from './routes/payrollEmployeeRouter.js';
import wishlistRouter from './routes/wishlistRouter.js';
import transferRouter from './routes/transfersRouter.js';
import transactionsRouter from './routes/transactionsRouter.js';
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');
import swaggerUi from 'swagger-ui-express';
const swaggerDocument = require('./swagger.json');
import { bree, startBree } from './breeManager.js';

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

export default app;