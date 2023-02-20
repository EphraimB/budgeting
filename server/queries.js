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

// Export all functions
module.exports = { createAccount, updateAccount };