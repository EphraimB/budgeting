const generateTransactions = (request, response, next) => {
    const generateExpenses = require('./generateExpenses.js');
    const accountId = parseInt(request.params.accountId);
    const type = parseInt(request.params.type);
    const months = parseInt(request.params.months);
    const currentBalance = parseFloat(request.currentBalance.substring(1));
    const transactions = [];
    let balance = currentBalance;

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
                balance: balance += parseFloat(deposit.deposit_amount.substring(1))
            }))
            .concat(request.withdrawals
                .map(withdrawal => ({
                    withdrawal_id: withdrawal.withdrawal_id,
                    date_created: withdrawal.date_created,
                    date_modified: withdrawal.date_modified,
                    type: 0,
                    amount: parseFloat(withdrawal.withdrawal_amount.substring(1)),
                    balance: balance -= parseFloat(withdrawal.withdrawal_amount.substring(1))
                }))
            ));
        transactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    } else if (type === 1) {
        transactions.push(request.expenses
            .map(expense => ({
                title: expense.expense_title,
                description: expense.expense_description,
                date: expense.expense_begin_date <= new Date() ? new Date().setDate(expense.expense_begin_date) : expense.expense_begin_date,
                type: 0,
                amount: parseFloat(expense.expense_amount.substring(1)),
                balance: balance -= parseFloat(expense.expense_amount.substring(1)),
            }))
        );

        transactions.push(generateExpenses(request.expenses[0], balance, months));

        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    request.transactions = transactions;
    request.accountId = accountId;
    request.currentBalance = currentBalance;

    next();
}

module.exports = generateTransactions;