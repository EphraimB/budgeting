const express = require('express');
const generateTransactions = require('../generateTransactions.js');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, getLoansByAccount, getWishlistsByAccount } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/', getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, generateTransactions, (request, response) => {
    response.json({ account_id: request.accountId, currentBalance: request.currentBalance, previousTransactions: request.previousTransactions, futureTransactions: request.futureTransactions });
});

module.exports = router;