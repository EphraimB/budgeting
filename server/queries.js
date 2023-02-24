const pool = require('./db');
const { accountQueries } = require('./queryData');

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