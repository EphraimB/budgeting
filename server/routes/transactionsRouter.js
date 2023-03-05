const express = require('express');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/:accountId/:type/:months', getCurrentBalance, getDepositsByAccount, (request, response) => {
    const accountId = parseInt(request.params.accountId);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = request.currentBalance;
    let transactions = {};

    if (accountId < 1) {
        response.status(400).send('Invalid account id');
    } else if (type < 0 || type > 1) {
        response.status(400).send('Invalid transaction type');
    } else if (months < 1) {
        response.status(400).send('Invalid number of months');
    }

    if (type === 0) {
        transactions = {
            deposits: request.deposits,
        };
    }

    response.json({ account_id: accountId, currentBalance: currentBalance, transactions });
});

module.exports = router;