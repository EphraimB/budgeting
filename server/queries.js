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

// Export all functions
module.exports = { createAccount };