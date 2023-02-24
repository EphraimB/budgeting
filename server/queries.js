const pool = require('./db');

// Get all accounts
const getAccounts = (request, response) => {
    pool.query('SELECT accounts.account_id, accounts.account_name, accounts.account_type, accounts.account_balance + deposit_amount - withdrawal_amount AS account_balance, accounts.date_created, accounts.date_modified FROM accounts JOIN deposits ON accounts.account_id=deposits.account_id JOIN withdrawals ON accounts.account_id=withdrawals.account_id ORDER BY accounts.account_id ASC', (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get account by id
const getAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const sql = 'SELECT accounts.account_id, accounts.account_name, accounts.account_type, accounts.account_balance + deposit_amount - withdrawal_amount AS account_balance, accounts.date_created, accounts.date_modified FROM accounts JOIN deposits ON accounts.account_id=deposits.account_id JOIN withdrawals ON accounts.account_id=withdrawals.account_id WHERE accounts.account_id = $1';
    
    pool.query(sql, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });

    return sql;
}

// Create account
const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query('INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
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
        'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4',
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

    pool.query('DELETE FROM accounts WHERE account_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Account deleted with ID: ${id}`);
    });
}

// Create deposit
const createDeposit = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query('INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES ($1, $2, $3)', [account_id, amount, description], (error, results) => {
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

    pool.query(
        'UPDATE deposits SET account_id = $1, deposit_amount = $2, deposit_description = $3 WHERE deposit_id = $4',
        [account_id, amount, description, id],
        (error, results) => {
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

    pool.query('DELETE FROM deposits WHERE deposit_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit deleted with ID: ${id}`);
    });
}

// Create withdrawal
const createWithdrawal = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query('INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES ($1, $2, $3)', [account_id, amount, description], (error, results) => {
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

    pool.query(
        'UPDATE withdrawals SET account_id = $1, withdrawal_amount = $2, withdrawal_description = $3 WHERE withdrawal_id = $4',
        [account_id, amount, description, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Withdrawal modified with ID: ${id}`);
        }
    );
}

// Delete withdrawal
const deleteWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query('DELETE FROM withdrawals WHERE withdrawal_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal deleted with ID: ${id}`);
    });
}

// Export all functions
module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount, createDeposit, updateDeposit, deleteDeposit, createWithdrawal, updateWithdrawal, deleteWithdrawal };