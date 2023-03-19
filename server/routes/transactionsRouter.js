const express = require('express');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, getLoansByAccount, getWishlistsByAccount } = require('../queries.js');
const { query } = require('express-validator');
const validateRequest = require('../validateRequest.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/', [
    query('account_id').exists().withMessage('Account ID is required').isInt({ min: 0 }).withMessage('Account ID must be an integer'),
    query('from_date').exists().withMessage('From date is required').isDate().withMessage('From date must be a date in YYYY-MM-DD format'),
    query('to_date').exists().withMessage('To date is required').isDate().withMessage('To date must be a date in YYYY-MM-DD format'),
    validateRequest,
], getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, getLoansByAccount, generateTransactions, (request, response) => {
    response.json({ account_id: request.accountId, currentBalance: request.currentBalance, transactions: request.transactions });
});

module.exports = router;