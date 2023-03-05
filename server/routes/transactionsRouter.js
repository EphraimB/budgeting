const express = require('express');
const router = express.Router();
const { getCurrentBalance } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/:id/:type/:months', getCurrentBalance, (request, response) => {
    const id = parseInt(request.params.id);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = request.currentBalance;

    if (id < 1) {
        response.status(400).send('Invalid account id');
    } else if (type < 1 || type > 2) {
        response.status(400).send('Invalid transaction type');
    } else if (months < 1) {
        response.status(400).send('Invalid number of months');
    }

    response.json({ account_id: id, currentBalance: currentBalance, transactions: { type: type, months: months } });
});

module.exports = router;