const express = require('express');
const fs = require('fs');
const Bree = require('bree');
const Cabin = require('cabin');
const path = require('path');
const jobsFilePath = 'jobs.json';
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
const { getEmployees } = require('./queries');

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

let jobs = [];
const payrollCheckerjobs = [];

// Create the payroll checker job for each employee, query the database for the employee ids
// Define an async function to create payroll checker jobs
const createPayrollCheckerJobs = async () => {
    try {
        // Get all employees
        const employees = await getEmployees();

        console.log(`Employees: ${employees}`);

        employees.forEach((employee) => {
            console.log(`Creating payroll checker job for employee ${employee.employee_id}`);

            payrollCheckerjobs.push({
                name: `payroll-checker-employee-${employee.employee_id}`,
                cron: "0 0 1 * *",
                path: "/app/jobs/cronScriptCheckPayrolls.js",
                worker: {
                    workerData: {
                        employee_id: employee.employee_id,
                    },
                },
            });
        });
    } catch (error) {
        console.error(error);
    }
};

// Call the function to create payroll checker jobs
(async () => {
    await createPayrollCheckerJobs();
    console.log(`Payroll checker jobs: ${payrollCheckerjobs}`);
})();


if (fs.existsSync(jobsFilePath)) {
    // Read the job definitions from the JSON file
    jobs = JSON.parse(fs.readFileSync(jobsFilePath, 'utf8'));
}

// Add the payroll checker job to the jobs array
jobs.push(payrollCheckerjobs);

const bree = new Bree({
    logger: new Cabin(),
    root: cronjobsDir,
    jobs
});

(async () => {
    await bree.start();
})();

console.log(`Bree started with ${bree.config.jobs}`);

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