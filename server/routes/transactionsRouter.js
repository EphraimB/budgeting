const express = require('express');
const router = express.Router();
const { getCurrentBalance } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/:id/:type/:months', getCurrentBalance, (request, response) => {
    const id = parseInt(request.params.id);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = request.currentBalance;



    response.json({ account_id: id, currentBalance: currentBalance, transactions: { type: type, months: months } });
});

module.exports = router;