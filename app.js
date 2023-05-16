import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
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
import { bree, startBree } from './breeManager.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const require = createRequire(import.meta.url);
const swaggerDocument = require('./swagger.json');
const cronjobsDir = path.join(__dirname, 'jobs/cron-jobs');

if (!fs.existsSync(cronjobsDir)) {
  fs.mkdirSync(cronjobsDir);
}

const app = express();

app.use(bodyParser.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

startBree()
  .then(() => {
    console.log(`Bree started with ${bree.config.jobs}`);
  })
  .catch((error) => {
    console.error('Failed to start Bree:', error);
  });

// Routes
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

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;