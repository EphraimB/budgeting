const express = require('express');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/:accountId/:type/:months', getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, (request, response) => {
    const accountId = parseInt(request.params.accountId);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = request.currentBalance;
    const transactions = [];

    if (accountId < 1) {
        response.status(400).send('Invalid account id');
    } else if (type < 0 || type > 1) {
        response.status(400).send('Invalid transaction type');
    } else if (months < 1) {
        response.status(400).send('Invalid number of months');
    }

    if (type === 0) {
        transactions.push(request.deposits
            .map(deposit => ({
                deposit_id: deposit.deposit_id,
                date_created: deposit.date_created,
                date_modified: deposit.date_modified,
                type: 1,
                amount: deposit.deposit_amount
            }))
            .concat(request.withdrawals
                .map(withdrawal => ({
                    withdrawal_id: withdrawal.withdrawal_id,
                    date_created: withdrawal.date_created,
                    date_modified: withdrawal.date_modified,
                    type: 0,
                    amount: withdrawal.withdrawal_amount
                }))
            ));
        transactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    }

    response.json({ account_id: accountId, currentBalance: currentBalance, transactions });
});

module.exports = router;