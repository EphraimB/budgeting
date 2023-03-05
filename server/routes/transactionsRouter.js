const express = require('express');
const router = express.Router();
const { getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, getLoansByAccount, getWishlistsByAccount } = require('../queries.js');

// Generate the transactions based on current balance, expenses, and loans
router.get('/:accountId/:type/:months', getCurrentBalance, getDepositsByAccount, getWithdrawalsByAccount, getExpensesByAccount, (request, response) => {
    const accountId = parseInt(request.params.accountId);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = parseFloat(request.currentBalance.substring(1));
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
                amount: parseFloat(deposit.deposit_amount.substring(1)),
                balance: parseFloat(deposit.deposit_amount.substring(1)) + currentBalance
            }))
            .concat(request.withdrawals
                .map(withdrawal => ({
                    withdrawal_id: withdrawal.withdrawal_id,
                    date_created: withdrawal.date_created,
                    date_modified: withdrawal.date_modified,
                    type: 0,
                    amount: parseFloat(withdrawal.withdrawal_amount.substring(1)),
                    balance: currentBalance - parseFloat(withdrawal.withdrawal_amount.substring(1))
                }))
            ));
        transactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    } else if (type === 1) {
        // TODO: Generate the transactions based on current balance, expenses, and loans and output it in the deposits and withdrawals format
        transactions.push(request.expenses
            .map(expense => ({
                expense_id: expense.expense_id,
                date_created: expense.date_created,
                date_modified: expense.date_modified,
                expense_begin_date: expense.expense_begin_date,
                date: new Date(new Date().getFullYear(), new Date().getMonth(), expense.expense_begin_date.getDate(), expense.expense_begin_date.getHours(), expense.expense_begin_date.getMinutes(), expense.expense_begin_date.getSeconds()),
                type: 1,
                amount: parseFloat(expense.expense_amount.substring(1)),
                balance: currentBalance - parseFloat(expense.expense_amount.substring(1))
            }))
        );
        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    response.json({ account_id: accountId, currentBalance: currentBalance, transactions });
});

module.exports = router;