const generateTransactions = (request, response, next) => {
    const generateMonthlyExpenses = require('./generateMonthlyExpenses.js');
    const calculateBalances = require('./calculateBalances.js');
    const accountId = parseInt(request.body.account_id);
    const fromDate = new Date(request.body.from_date);
    const toDate = new Date(request.body.to_date);
    const currentBalance = parseFloat(request.currentBalance.substring(1));
    const transactions = [];

    if (accountId < 1) {
        return response.status(400).send('Invalid account id');
    } else if (fromDate > toDate) {
        return response.status(400).send('Invalid date range');
    }

    transactions.push(
        ...request.deposits.map(deposit => ({
            deposit_id: deposit.deposit_id,
            date: deposit.date_created,
            date_modified: deposit.date_modified,
            title: deposit.deposit_title,
            description: deposit.deposit_description,
            amount: parseFloat(deposit.deposit_amount.substring(1))
        })),
        ...request.withdrawals.map(withdrawal => ({
            withdrawal_id: withdrawal.withdrawal_id,
            date: withdrawal.date_created,
            date_modified: withdrawal.date_modified,
            title: withdrawal.withdrawal_title,
            description: withdrawal.withdrawal_description,
            amount: parseFloat(-withdrawal.withdrawal_amount.substring(1))
        }))
    );

    request.expenses.forEach(expense => {
        if (expense.frequency === 0) {
            generateMonthlyExpenses(transactions, expense, toDate);
        } else if (expense.frequency === 1) {
            // TODO: Generate yearly expenses
        } else if (expense.frequency === 2) {
            // TODO: Generate weekly expenses
        } else if (expense.frequency === 3) {
            // TODO: Generate daily expenses
        }
    });

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    calculateBalances(transactions, currentBalance);

    request.transactions = transactions;
    request.accountId = accountId;
    request.currentBalance = currentBalance;

    if (request.transactions.length < 1) {
        return response.status(200).send('No transactions found');
    }

    next();
}

module.exports = generateTransactions;