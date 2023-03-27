const express = require('express');
const fs = require('fs');
const path = require('path');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getLoansByAccount, getTransfersByAccount } = require('../queries.js');
const { query } = require('express-validator');
const validateRequest = require('../validateRequest.js');
const middlewareFiles = [];

// Require the plugin middleware
const pluginsDir = './plugins';

// Read the plugin directories and get the middleware for each plugin
fs.readdirSync(pluginsDir).forEach(plugin => {
    const pluginDir = path.join(__dirname, '..', pluginsDir, plugin);

    if (fs.existsSync(pluginDir)) {
        const middlewareFile = `${pluginDir}/middleware.js`;

        if (fs.existsSync(`${middlewareFile}`)) {
            const middleware = require(middlewareFile);
            middlewareFiles.push(middleware);
        };
    };
});

// Generate the transactions based on current balance, expenses, and loans
router.get('/', [
    query('account_id').exists().withMessage('Account ID is required').isInt({ min: 0 }).withMessage('Account ID must be an integer'),
    query('from_date').exists().withMessage('From date is required').isDate().withMessage('From date must be a date in YYYY-MM-DD format'),
    query('to_date').exists().withMessage('To date is required').isDate().withMessage('To date must be a date in YYYY-MM-DD format'),
    validateRequest
],
    getCurrentBalance,
    getDepositsByAccount,
    getWithdrawalsByAccount,
    ...middlewareFiles.map(middleware => middleware.middleware),
    getLoansByAccount,
    getTransfersByAccount,
    generateTransactions,
    (request, response) => {
        response.json({ account_id: parseInt(request.query.account_id), currentBalance: request.currentBalance, transactions: request.transactions });
    });

module.exports = router;
