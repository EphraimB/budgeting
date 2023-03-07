const generateTransactions = (request, response, next) => {
    const generateExpenses = require('./generateExpenses.js');
    const accountId = parseInt(request.body.account_id);
    const fromDate = new Date(request.body.from_date);
    const toDate = new Date(request.body.to_date);
    const currentBalance = parseFloat(request.currentBalance.substring(1));
    const futureTransactions = [];
    const previousTransactions = [];
    let backBalance = currentBalance;
    let futureBalance = currentBalance;

    if (accountId < 1) {
        response.status(400).send('Invalid account id');
    } else if (fromDate > toDate) {
        response.status(400).send('Invalid date range');
    } else if (request.expenses.length < 1) {
        response.status(400).send('No expenses found');
    }

    if (fromDate < new Date()) {
        previousTransactions.push(request.deposits
            .map(deposit => ({
                deposit_id: deposit.deposit_id,
                date_created: deposit.date_created,
                date_modified: deposit.date_modified,
                title: deposit.deposit_title,
                description: deposit.deposit_description,
                amount: parseFloat(deposit.deposit_amount.substring(1)),
                balance: backBalance += parseFloat(deposit.deposit_amount.substring(1))
            }))
            .concat(request.withdrawals
                .map(withdrawal => ({
                    withdrawal_id: withdrawal.withdrawal_id,
                    date_created: withdrawal.date_created,
                    date_modified: withdrawal.date_modified,
                    title: withdrawal.withdrawal_title,
                    description: withdrawal.withdrawal_description,
                    amount: parseFloat(-withdrawal.withdrawal_amount.substring(1)),
                    balance: backBalance += parseFloat(withdrawal.withdrawal_amount.substring(1))
                }))
            ));
        previousTransactions.sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
    }

    if (toDate >= new Date()) {
        request.expenses.forEach(expense => {
            generateExpenses(futureTransactions, expense, futureBalance, toDate);
        });
        futureTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    futureTransactions.forEach(transaction => {
        futureBalance -= transaction.amount;

        transaction.balance = futureBalance;
    });

    request.previousTransactions = previousTransactions;
    request.futureTransactions = futureTransactions;;
    request.accountId = accountId;
    request.currentBalance = currentBalance;

    next();
}

module.exports = generateTransactions;