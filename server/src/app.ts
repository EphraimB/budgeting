import express, {
    type Express,
    type Request,
    type Response,
    type NextFunction,
} from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { logger } from './config/winston.js';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/routes.js';
import accountsRouter from './routes/accountsRouter.js';
import transactionHistoryRouter from './routes/transactionHistoryRouter.js';
import expensesRouter from './routes/expensesRouter.js';
import commuteSystemsRouter from './routes/commuteSystemRouter.js';
import commuteStationsRouter from './routes/commuteStationsRouter.js';
import commuteScheduleRouter from './routes/commuteScheduleRouter.js';
import commuteHistoryRouter from './routes/commuteHistoryRouter.js';
import fareDetailsRouter from './routes/fareDetailsRouter.js';
import commuteOverviewRouter from './routes/commuteOverviewRouter.js';
import loansRouter from './routes/loansRouter.js';
import payrollRouter from './routes/payrollRouter.js';
import payrollDatesRouter from './routes/payrollDatesRouter.js';
import payrollTaxesRouter from './routes/payrollTaxesRouter.js';
import jobsRouter from './routes/jobsRouter.js';
import wishlistRouter from './routes/wishlistRouter.js';
import transferRouter from './routes/transfersRouter.js';
import transactionsRouter from './routes/transactionsRouter.js';
import taxesRouter from './routes/taxesRouter.js';
import incomeRouter from './routes/incomeRouter.js';
import fs from 'fs';
import path from 'path';

const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), './swagger.json'), 'utf8'),
);

const app: Express = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/api/', routes);
app.use('/api/accounts', accountsRouter);
app.use('/api/transactions/history', transactionHistoryRouter);
app.use('/api/expenses/commute/systems', commuteSystemsRouter);
app.use('/api/expenses/commute/history', commuteHistoryRouter);
app.use('/api/expenses/commute/stations', commuteStationsRouter);
app.use('/api/expenses/commute/fares', fareDetailsRouter);
app.use('/api/expenses/commute/schedule', commuteScheduleRouter);
app.use('/api/expenses/commute', commuteOverviewRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/loans', loansRouter);
app.use('/api/jobs/payroll/dates', payrollDatesRouter);
app.use('/api/jobs/payroll/taxes', payrollTaxesRouter);
app.use('/api/jobs/payroll', payrollRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/wishlists', wishlistRouter);
app.use('/api/transfers', transferRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/taxes', taxesRouter);
app.use('/api/income', incomeRouter);

// Global error handling middleware
app.use((err: any, _: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    res.status(500).json({ error: 'Internal server error' });

    next();
});

export default app;
