const pool = require('./db');

// Create account
const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query('INSERT INTO account (name, type, balance) VALUES ($1, $2)', [name, type, balance], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Account added with ID: ${results.insertId}`);
    });
}

// Update account
const updateAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    pool.query(
        'UPDATE account SET name = $1, type = $2, balance = $3 WHERE id = $4',
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

    pool.query('DELETE FROM account WHERE id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Account deleted with ID: ${id}`);
    });
}

// Create deposit
const createDeposit = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query('INSERT INTO deposit (account_id, amount, description) VALUES ($1, $2)', [account_id, amount, description], (error, results) => {
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
        'UPDATE deposit SET account_id = $1, amount = $2, description = $3 WHERE deposit_id = $4',
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

    pool.query('DELETE FROM deposit WHERE deposit_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit deleted with ID: ${id}`);
    });
}

// Create withdrawal
const createWithdrawal = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query('INSERT INTO withdrawal (account_id, amount, description) VALUES ($1, $2)', [account_id, amount, description], (error, results) => {
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
        'UPDATE withdrawal SET account_id = $1, amount = $2, description = $3 WHERE withdrawal_id = $4',
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

    pool.query('DELETE FROM withdrawal WHERE withdrawal_id = $1', [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal deleted with ID: ${id}`);
    });
}

// Export all functions
module.exports = { createAccount, updateAccount, deleteAccount, createDeposit, updateDeposit, deleteDeposit, createWithdrawal, updateWithdrawal, deleteWithdrawal };