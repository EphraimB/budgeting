const generateTransactions = (request, response, next) => {
    const generateDailyExpenses = require('./generateExpenses/generateDailyExpenses.js');
    const generateWeeklyExpenses = require('./generateExpenses/generateWeeklyExpenses.js');
    const generateMonthlyExpenses = require('./generateExpenses/generateMonthlyExpenses.js');
    const generateYearlyExpenses = require('./generateExpenses/generateYearlyExpenses.js');
    const generateDailyLoans = require('./generateLoans/generateDailyLoans.js');
    const generateWeeklyLoans = require('./generateLoans/generateWeeklyLoans.js');
    const generateMonthlyLoans = require('./generateLoans/generateMonthlyLoans.js');
    const generateYearlyLoans = require('./generateLoans/generateYearlyLoans.js');
    const calculateBalances = require('./calculateBalances.js');
    const accountId = parseInt(request.body.account_id);
    const fromDate = new Date(request.body.from_date);
    const toDate = new Date(request.body.to_date);
    const currentBalance = request.currentBalance;
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
            amount: parseFloat(deposit.deposit_amount)
        })),
        ...request.withdrawals.map(withdrawal => ({
            withdrawal_id: withdrawal.withdrawal_id,
            date: withdrawal.date_created,
            date_modified: withdrawal.date_modified,
            title: withdrawal.withdrawal_title,
            description: withdrawal.withdrawal_description,
            amount: parseFloat(-withdrawal.withdrawal_amount)
        }))
    );

    request.expenses.forEach(expense => {
        if (expense.frequency_type === 0) {
            generateDailyExpenses(transactions, expense, toDate);
        } else if (expense.frequency_type === 1) {
            generateWeeklyExpenses(transactions, expense, toDate);
        } else if (expense.frequency_type === 2) {
            generateMonthlyExpenses(transactions, expense, toDate);
        } else if (expense.frequency_type === 3) {
            generateYearlyExpenses(transactions, expense, toDate);
        }
    });

    request.loans.forEach(loan => {
        if (loan.frequency_type === 0) {
            generateDailyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 1) {
            generateWeeklyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 2) {
            generateMonthlyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 3) {
            generateYearlyLoans(transactions, loan, toDate)
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