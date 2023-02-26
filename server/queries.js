const pool = require('./db');
const { accountQueries, depositQueries, withdrawalQueries } = require('./queryData');

// Get all accounts
const getAccounts = (request, response) => {
    pool.query(accountQueries.getAccounts, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get account by id
const getAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.getAccount, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create account
const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query(accountQueries.createAccount,
        [name, type, balance],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(201).json(results.rows);
        });
}

// Update account
const updateAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    pool.query(
        accountQueries.updateAccount,
        [name, type, balance, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Account modified with ID: ${id}`);
        }
    );
}

// Delete account
const deleteAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.deleteAccount, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Account deleted with ID: ${id}`);
    });
}

// Get all deposits
const getDeposits = (request, response) => {
    pool.query(depositQueries.getDeposits, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get deposit by id
const getDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.getDeposit, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create deposit
const createDeposit = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(depositQueries.createDeposit, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Deposit added with ID: ${results.insertId}`);
    });
}

// Update deposit
const updateDeposit = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(depositQueries.updateDeposit, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit modified with ID: ${id}`);
    }
    );
}

// Delete deposit
const deleteDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.deleteDeposit, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit deleted with ID: ${id}`);
    });
}

// Get all withdrawals
const getWithdrawals = (request, response) => {
    pool.query(withdrawalQueries.getWithdrawals, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get withdrawal by id
const getWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.getWithdrawal, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create withdrawal
const createWithdrawal = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(withdrawalQueries.createWithdrawal, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Withdrawal added with ID: ${results.insertId}`);
    });
}

// Update withdrawal
const updateWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(withdrawalQueries.updateWithdrawal, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal modified with ID: ${id}`);
    });
}

// Delete withdrawal
const deleteWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.deleteWithdrawal, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal deleted with ID: ${id}`);
    });
}

// Get all expenses
const getExpenses = (request, response) => {
    pool.query(expenseQueries.getExpenses, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get expense by id
const getExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.getExpense, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create expense
const createExpense = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(expenseQueries.createExpense, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Expense added with ID: ${results.insertId}`);
    });
}

// Update expense
const updateExpense = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(expenseQueries.updateExpense, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Expense modified with ID: ${id}`);
    });
}

// Delete expense
const deleteExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.deleteExpense, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Expense deleted with ID: ${id}`);
    });
}

// Get all loans
const getLoans = (request, response) => {
    pool.query(loanQueries.getLoans, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get loan by id
const getLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.getLoan, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create loan
const createLoan = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(loanQueries.createLoan, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Loan added with ID: ${results.insertId}`);
    });
}

// Update loan
const updateLoan = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(loanQueries.updateLoan, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Loan modified with ID: ${id}`);
    });
}

// Delete loan
const deleteLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.deleteLoan, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Loan deleted with ID: ${id}`);
    });
}

// Export all functions
module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount, getDeposits, getDeposit, createDeposit, updateDeposit, deleteDeposit, getWithdrawals, getWithdrawal, createWithdrawal, updateWithdrawal, deleteWithdrawal, getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getLoans, getLoan, createLoan, updateLoan, deleteLoan };