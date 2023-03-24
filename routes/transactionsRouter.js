const express = require('express');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getLoansByAccount, getTransfersByAccount } = require('../queries.js');
const { query } = require('express-validator');
const validateRequest = require('../validateRequest.js');
const pluginMiddleware = require('../plugin-middleware');

// Define the plugins directory
const pluginsDir = './plugins';

// Generate the transactions based on current balance, expenses, and loans
router.get('/', [
    query('account_id').exists().withMessage('Account ID is required').isInt({ min: 0 }).withMessage('Account ID must be an integer'),
    query('from_date').exists().withMessage('From date is required').isDate().withMessage('From date must be a date in YYYY-MM-DD format'),
    query('to_date').exists().withMessage('To date is required').isDate().withMessage('To date must be a date in YYYY-MM-DD format'),
    validateRequest,
    // Add the expenses plugin middleware to the middleware chain
    pluginMiddleware('expenses'),
    getCurrentBalance,
    getDepositsByAccount,
    getWithdrawalsByAccount,
    getLoansByAccount,
    getTransfersByAccount,
    // Modify generateTransactions to call the generateTransactions function with the 'expenses' plugin name
    generateTransactions('expenses'),
    (request, response) => {
        response.json({ account_id: parseInt(request.query.account_id), currentBalance: request.currentBalance, transactions: request.transactions });
    }
]);

module.exports = router;