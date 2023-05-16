import pool from './db.js';
import { accountQueries, transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries, cronJobQueries } from './queryData.js';
import scheduleCronJob from './jobs/scheduleCronJob.js';
import deleteCronJob from './jobs/deleteCronJob.js';
import getPayrollsForMonth from './getPayrolls.js';

const parseAccounts = account => ({
    account_id: parseInt(account.account_id),
    account_name: account.account_name,
    account_type: parseInt(account.account_type),
    account_balance: parseFloat(account.account_balance),
    date_created: account.date_created,
    date_modified: account.date_modified,
});

// Get all accounts
const getAccounts = (request, response) => {
    const id = parseInt(request.query.id);

    const query = id ? accountQueries.getAccount : accountQueries.getAccounts;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting accounts", "param": null, "location": "query" } });
        }

        const accounts = results.rows.map(account => parseAccounts(account));
        response.status(200).json(accounts);
    });
};

// Create account
const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query(accountQueries.createAccount, [name, type, balance], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating account", "param": null, "location": "query" } });
        }

        const accounts = results.rows.map(account => parseAccounts(account));
        response.status(201).json(accounts);
    });
};

// Update account
const updateAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    pool.query(accountQueries.updateAccount, [name, type, balance, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating account", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const accounts = results.rows.map(account => parseAccounts(account));

        response.status(200).send(accounts);
    });
};

// Delete account
const deleteAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.deleteAccount, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting account", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted account");
    });
};

const parseTransactions = transactionHistory => ({
    transaction_id: parseInt(transactionHistory.transaction_id),
    account_id: parseInt(transactionHistory.account_id),
    transaction_amount: parseFloat(transactionHistory.transaction_amount),
    transaction_title: transactionHistory.account_type,
    transaction_description: transactionHistory.transaction_description,
    date_created: transactionHistory.date_created,
    date_modified: transactionHistory.date_modified,
});

// Get deposits by account
const getTransactionsByAccount = (request, response, next) => {
    const { account_id, from_date } = request.query;

    pool.query(transactionHistoryQueries.getTransactionsDateFiltered, [parseInt(account_id), from_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
        }

        request.transaction = results.rows;

        next();
    });
}

// Get all transactions
const getTransactions = (request, response) => {
    const { id } = request.query;

    const query = id ? transactionHistoryQueries.getTransaction : transactionHistoryQueries.getTransactions;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
        }

        const transactionHistory = results.rows.map(transactionHistory => parseTransactions(transactionHistory));
        response.status(200).json(transactionHistory);
    });
};

// Create transaction
const createTransaction = (request, response) => {
    const { account_id, title, amount, description } = request.body;

    pool.query(transactionHistoryQueries.createTransaction, [account_id, amount, title, description], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating transaction", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const transactionHistory = results.rows.map(transactionHistory => (parseTransactions(transactionHistory)));

        return response.status(201).json(transactionHistory);
    });
}

// Update transaction
const updateTransaction = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description } = request.body;

    pool.query(transactionHistoryQueries.updateTransaction, [account_id, amount, title, description, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating transaction", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const transactionHistory = results.rows.map(transactionHistory => (parseTransactions(transactionHistory)));

        response.status(200).send(transactionHistory);
    });
}

// Delete transaction
const deleteTransaction = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(transactionHistoryQueries.deleteTransaction, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting transaction", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted transaction");
    });
}

const parseExpenses = expense => ({
    expense_id: parseInt(expense.expense_id),
    account_id: parseInt(expense.account_id),
    expense_amount: parseFloat(expense.expense_amount),
    expense_title: expense.expense_title,
    expense_description: expense.expense_description,
    frequency_type: expense.frequency_type,
    frequency_type_variable: expense.frequency_type_variable,
    frequency_day_of_month: expense.frequency_day_of_month,
    frequency_day_of_week: expense.frequency_day_of_week,
    frequency_week_of_month: expense.frequency_week_of_month,
    frequency_month_of_year: expense.frequency_month_of_year,
    expense_begin_date: expense.expense_begin_date,
    expense_end_date: expense.expense_end_date,
    date_created: expense.date_created,
    date_modified: expense.date_modified,
});

// Get expenses by account
const getExpensesByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(expenseQueries.getExpensesByAccount, [account_id, to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
        }

        request.expenses = results.rows;

        next();
    });
}

// Get all expenses
const getExpenses = (request, response) => {
    const { id } = request.query;

    const query = id ? expenseQueries.getExpense : expenseQueries.getExpenses;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
        }

        const expenses = results.rows.map(expense => parseExpenses(expense));
        response.status(200).send(expenses);
    });
};

// Create expense
const createExpense = async (request, response) => {
    try {
        const {
            account_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date
        } = request.body;

        const negativeAmount = -amount;
        const { cronDate, uniqueId } = scheduleCronJob(
            begin_date,
            account_id,
            negativeAmount,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year
        );

        const cronJobResult = await pool.query(cronJobQueries.createCronJob, [
            uniqueId,
            cronDate
        ]);
        const cronId = cronJobResult.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        const expenseResult = await pool.query(expenseQueries.createExpense, [
            account_id,
            cronId,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date
        ]);

        const expenses = expenseResult.rows.map(expense => parseExpenses(expense));

        response.status(201).send(expenses);
    } catch (error) {
        response.status(400).send({
            errors: { msg: 'Error creating expense', param: null, location: 'query' }
        });
    }
};

// Update expense
const updateExpense = async (request, response) => {
    try {
        const id = parseInt(request.params.id);
        const {
            account_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date
        } = request.body;

        const expenseResult = await pool.query(expenseQueries.getExpense, [id]);
        if (expenseResult.rows.length === 0) {
            return response.status(200).send([]);
        }

        const cronId = expenseResult.rows[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = scheduleCronJob(
            begin_date,
            account_id,
            amount,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year
        );

        await pool.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId
        ]);

        const updateResult = await pool.query(expenseQueries.updateExpense, [
            account_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
            id
        ]);

        const expenses = updateResult.rows.map(expense => parseExpenses(expense));

        response.status(200).send(expenses);
    } catch (error) {
        response.status(400).send({
            errors: { msg: 'Error updating expense', param: null, location: 'query' }
        });
    }
};

// Delete expense
const deleteExpense = async (request, response) => {
    try {
        const { id } = request.params;

        const expenseResult = await pool.query(expenseQueries.getExpense, [id]);
        if (expenseResult.rows.length === 0) {
            return response.status(200).send("Expense doesn't exist");
        }

        const cronId = expenseResult.rows[0].cron_job_id;
        const deleteExpenseResult = await pool.query(expenseQueries.deleteExpense, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await pool.query(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Expense deleted successfully");
    } catch (error) {
        response.status(400).send({ errors: { msg: 'Error deleting expense', param: null, location: 'query' } });
    }
};

const parseLoan = loan => ({
    loan_id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    loan_amount: parseFloat(loan.loan_amount),
    loan_plan_amount: parseFloat(loan.loan_plan_amount),
    loan_recipient: loan.loan_recipient,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    frequency_type: loan.frequency_type,
    frequency_type_variable: loan.frequency_type_variable,
    frequency_day_of_month: loan.frequency_day_of_month,
    frequency_day_of_week: loan.frequency_day_of_week,
    frequency_week_of_month: loan.frequency_week_of_month,
    frequency_month_of_year: loan.frequency_month_of_year,
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
});

// Get loans by account
const getLoansByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(loanQueries.getLoansByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting loans", "param": null, "location": "query" } });
        }

        request.loans = results.rows;

        next();
    });
}

// Get all loans
const getLoans = (request, response) => {
    const { id } = request.query;

    const query = id ? loanQueries.getLoan : loanQueries.getLoans;
    const queryParams = id ? [id] : [];

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            return response
                .status(400)
                .send({ errors: { msg: `Error getting ${id ? 'loan' : 'loans'}`, param: null, location: 'query' } });
        }

        // Parse the data to correct format and return an object
        const loans = results.rows.map(loan => parseLoan(loan));

        response.status(200).json(loans);
    });
};

// Create loan
const createLoan = (request, response) => {
    const {
        account_id,
        amount,
        plan_amount,
        recipient,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
    } = request.body;

    const negativePlanAmount = -plan_amount;

    const { cronDate, uniqueId } = scheduleCronJob(
        begin_date,
        account_id,
        negativePlanAmount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year
    );

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, cronJobResults) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error creating cron job', param: null, location: 'query' } });
        }

        const cronId = cronJobResults.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        pool.query(
            loanQueries.createLoan,
            [
                account_id,
                cronId,
                amount,
                plan_amount,
                recipient,
                title,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                begin_date,
            ],
            (error, loanResults) => {
                if (error) {
                    return response.status(400).send({ errors: { msg: 'Error creating loan', param: null, location: 'query' } });
                }

                // Parse the data to the correct format and return an object
                const loans = loanResults.rows.map(loan => parseLoan(loan));

                response.status(201).send(loans);
            }
        );
    });
};

// Update loan
const updateLoan = async (request, response) => {
    try {
        const { id } = request.params;
        const {
            account_id,
            amount,
            plan_amount,
            recipient,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
        } = request.body;

        const negativePlanAmount = -plan_amount;

        const getLoanResults = await pool.query(loanQueries.getLoan, [id]);

        if (getLoanResults.rows.length === 0) {
            return response.status(200).send([]);
        }

        const cronId = getLoanResults.rows[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = scheduleCronJob(
            begin_date,
            account_id,
            negativePlanAmount,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year
        );

        await pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);
        const updateLoanResults = await pool.query(loanQueries.updateLoan, [
            account_id,
            amount,
            plan_amount,
            recipient,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
            id,
        ]);

        // Parse the data to the correct format and return an object
        const loans = updateLoanResults.rows.map(loan => parseLoan(loan));
        response.status(200).send(loans);
    } catch (error) {
        console.error(error);
        response.status(400).send({ errors: { msg: 'Error updating loan', param: null, location: 'query' } });
    }
};

// Delete loan
const deleteLoan = async (request, response) => {
    try {
        const { id } = request.params;

        const getLoanResults = await pool.query(loanQueries.getLoan, [id]);

        if (getLoanResults.rows.length === 0) {
            return response.status(200).send("Loan doesn't exist");
        }

        const cronId = getLoanResults.rows[0].cron_job_id;
        await pool.query(loanQueries.deleteLoan, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await pool.query(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Loan deleted successfully");
    } catch (error) {
        console.error(error);
        response.status(400).send({ errors: { msg: 'Error deleting loan', param: null, location: 'query' } });
    }
};

const payrollsParse = payroll => ({
    start_date: payroll.start_date,
    end_date: payroll.end_date,
    work_days: parseInt(payroll.work_days),
    gross_pay: parseFloat(payroll.gross_pay),
    net_pay: parseFloat(payroll.net_pay),
    hours_worked: parseFloat(payroll.hours_worked),
});

// Get payrolls by account
const getPayrollsMiddleware = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(payrollQueries.getPayrollsMiddleware, [account_id, to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        request.payrolls = results.rows;

        next();
    });
}
// Get all payrolls
const getPayrolls = (request, response) => {
    const employee_id = parseInt(request.query.employee_id);

    pool.query(payrollQueries.getPayrolls, [employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const payrolls = results.rows.map(payroll => payrollsParse(payroll));

        const returnObj = {
            employee_id,
            payrolls: payrolls,
        }
        response.status(200).send(returnObj);
    });
}

const payrollTaxesParse = payrollTax => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate),
});

// Get payroll taxes
const getPayrollTaxes = (request, response) => {
    const { employee_id, id } = request.query;

    const query = id ? payrollQueries.getPayrollTax : payrollQueries.getPayrollTaxes;
    const queryParameters = id ? [employee_id, id] : [employee_id];

    pool.query(query, queryParameters, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll taxes', param: null, location: 'query' } });
        }

        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_taxes: payrollTaxes,
        };

        response.status(200).send(returnObj);
    });
};

// Create payroll tax
const createPayrollTax = (request, response) => {
    const { employee_id, name, rate } = request.body;

    pool.query(payrollQueries.createPayrollTax, [employee_id, name, rate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(201).send(payrollTaxes);
    });
};

// Update payroll tax
const updatePayrollTax = (request, response) => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    pool.query(payrollQueries.updatePayrollTax, [name, rate, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).send(payrollTaxes);
    });
};

// Delete payroll tax
const deletePayrollTax = (request, response) => {
    const { id } = request.params;
    const { employee_id } = request.query;

    pool.query(payrollQueries.deletePayrollTax, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send("Successfully deleted payroll tax");
    });
}

const payrollDatesParse = payrollDate => ({
    payroll_date_id: parseInt(payrollDate.payroll_date_id),
    payroll_start_day: parseInt(payrollDate.payroll_start_day),
    payroll_end_day: parseInt(payrollDate.payroll_end_day),
});

// Get payroll dates
const getPayrollDates = (request, response) => {
    const { employee_id, id } = request.query;
    const query = id ? payrollQueries.getPayrollDate : payrollQueries.getPayrollDates;
    const params = id ? [employee_id, id] : [employee_id];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll dates', param: null, location: 'query' } });
        }

        // Parse the data to the correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_dates: payrollDates,
        };
        response.status(200).send(returnObj);
    });
};

// Create payroll date
const createPayrollDate = (request, response) => {
    const { employee_id, start_day, end_day } = request.body;

    pool.query(payrollQueries.createPayrollDate, [employee_id, start_day, end_day], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        }
        response.status(201).send(returnObj);
    });
};

// Update payroll date
const updatePayrollDate = (request, response) => {
    const { id } = request.params;
    const { employee_id, start_day, end_day } = request.body;

    pool.query(payrollQueries.updatePayrollDate, [start_day, end_day, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        }

        response.status(200).send(returnObj);
    });
};

// Delete payroll date
const deletePayrollDate = (request, response) => {
    const { employee_id } = request.query;
    const { id } = request.params;

    pool.query(payrollQueries.deletePayrollDate, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send("Successfully deleted payroll date");
    });
};

const employeeParse = employee => ({
    employee_id: parseInt(employee.employee_id),
    name: employee.name,
    hourly_rate: parseFloat(employee.hourly_rate),
    regular_hours: parseInt(employee.regular_hours),
    vacation_days: parseInt(employee.vacation_days),
    sick_days: parseInt(employee.sick_days),
    work_schedule: employee.work_schedule,
});

// Get employee
const getEmployee = (request, response) => {
    const { id } = request.query;
    const query = id ? payrollQueries.getEmployee : payrollQueries.getEmployees;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting employee', param: null, location: 'query' } });
        }

        // Parse the data to the correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Create employee
const createEmployee = (request, response) => {
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating employee", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(201).send(employees);
    });
};

// Update employee
const updateEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating employee", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Delete employee
const deleteEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);

    // Check if there are any associated payroll dates or payroll taxes
    pool.query(payrollQueries.getPayrollDates, [employee_id], (error, payrollDatesResults) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll dates', param: null, location: 'query' } });
        }

        const hasPayrollDates = payrollDatesResults.rows.length > 0;

        pool.query(payrollQueries.getPayrollTaxes, [employee_id], (error, payrollTaxesResults) => {
            if (error) {
                return response.status(400).send({ errors: { msg: 'Error getting payroll taxes', param: null, location: 'query' } });
            }

            const hasPayrollTaxes = payrollTaxesResults.rows.length > 0;

            if (hasPayrollDates || hasPayrollTaxes) {
                return response.status(400).send({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
            } else {
                pool.query(payrollQueries.deleteEmployee, [employee_id], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { msg: 'Error deleting employee', param: null, location: 'query' } });
                    }

                    getPayrollsForMonth(employee_id);

                    response.status(200).send('Successfully deleted employee');
                });
            }
        });
    });
};

const wishlistsParse = (wishlist) => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    date_created: wishlist.date_created,
    date_updated: wishlist.date_updated,
});

// Get wishlists by account
const getWishlistsByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(wishlistQueries.getWishlistsByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting wishlists", "param": null, "location": "query" } });
        }

        request.wishlists = results.rows;

        next();
    });
}

// Get all wishlists
const getWishlists = (request, response) => {
    const { id } = request.query;

    if (!id) {
        pool.query(wishlistQueries.getWishlists, (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting wishlists", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

            response.status(200).send(wishlists);
        });
    } else {
        pool.query(wishlistQueries.getWishlist, [id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting wishlist", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

            response.status(200).send(wishlists);
        });
    }
}

// Create wishlist
const createWishlist = (request, response) => {
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(201).send(wishlists);
    });
}

// Update wishlist
const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(200).send(wishlists);
    });
}

// Delete wishlist
const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting wishlist", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted wishlist item");
    });
}

const transfersParse = (transfer) => ({
    transfer_id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    frequency_type: parseInt(transfer.frequency_type),
    frequency_type_variable: parseInt(transfer.frequency_type_variable),
    frequency_day_of_month: parseInt(transfer.frequency_day_of_month),
    frequency_day_of_week: parseInt(transfer.frequency_day_of_week),
    frequency_week_of_month: parseInt(transfer.frequency_week_of_month),
    frequency_month_of_year: parseInt(transfer.frequency_month_of_year),
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    date_created: transfer.date_created,
    date_updated: transfer.date_updated,
});

// Get transfers by account
const getTransfersByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(transferQueries.getTransfersByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transfers", "param": null, "location": "query" } });
        }

        request.transfers = results.rows;

        next();
    });
}

// Get transfers
const getTransfers = (request, response) => {
    const { account_id, id } = request.query;

    if (!id) {
        pool.query(transferQueries.getTransfers, [account_id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transfers", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const transfers = results.rows.map(transfer => transfersParse(transfer));

            response.status(200).json(transfers);
        });
    } else {
        pool.query(transferQueries.getTransfer, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transfer", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const transfers = results.rows.map(transfer => transfersParse(transfer));

            response.status(200).json(transfers);
        });
    }
}

// Create transfer
const createTransfer = (request, response) => {
    const { source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    const negativeAmount = -amount;

    const { cronDate, uniqueId } = scheduleCronJob(begin_date, source_account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id);

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
        const cronId = results.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        pool.query(transferQueries.createTransfer, [cronId, source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating transfer", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const transfers = results.rows.map(transfer => transfersParse(transfer));

            response.status(201).send(transfers);
        });
    });
}

// Update transfer
const updateTransfer = (request, response) => {
    const { id } = request.params;
    const { source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    const negativeAmount = -amount;

    // Get expense id to see if it exists
    pool.query(transferQueries.getTransfer, [source_account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transfer", "param": null, "location": "query" } });
        }

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            deleteCronJob(cronId).then(() => {
                const { uniqueId, cronDate } = scheduleCronJob(begin_date, source_account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id);

                pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { "msg": "Error updating cron job", "param": null, "location": "query" } });
                    }

                    pool.query(transferQueries.updateTransfer, [source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date, id], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error updating transfer", "param": null, "location": "query" } });
                        }

                        // Parse the data to correct format and return an object
                        const transfers = results.rows.map(transfer => transfersParse(transfer));

                        response.status(200).send(transfers);
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        };
    });
}

// Delete transfer
const deleteTransfer = (request, response) => {
    const { account_id } = request.query;
    const { id } = request.params;

    pool.query(transferQueries.getTransfer, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error selecting transfer", "param": null, "location": "query" } });
        }

        if (results.rows.length > 0) {
            const cronId = results.rows[0].cron_job_id;

            pool.query(transferQueries.deleteTransfer, [id], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error deleting transfer", "param": null, "location": "query" } });
                }

                if (cronId) {
                    deleteCronJob(cronId);

                    pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error deleting cron job", "param": null, "location": "query" } });
                        }
                    });
                }

                response.status(200).send("Transfer deleted successfully");
            });
        } else {
            response.status(200).send("Transfer doesn't exist");
        }
    });
}

// Get current balance of account based on deposits and withdrawals
const getCurrentBalance = (request, response, next) => {
    const account_id = parseInt(request.query.account_id);

    pool.query(currentBalanceQueries.getCurrentBalance, [account_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting current balance", "param": null, "location": "query" } });
        }

        const currentBalance = parseFloat(results.rows[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    });
}

// Export all functions
export {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getTransactionsByAccount,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getExpensesByAccount,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getLoansByAccount,
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    getPayrollsMiddleware,
    getPayrolls,
    getPayrollTaxes,
    createPayrollTax,
    updatePayrollTax,
    deletePayrollTax,
    getPayrollDates,
    createPayrollDate,
    updatePayrollDate,
    deletePayrollDate,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getWishlistsByAccount,
    getWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    getTransfersByAccount,
    getTransfers,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    getCurrentBalance
};