// Accept a plugin name as an argument
function generateTransactions(pluginName) {
    return (request, response, next) => {
        const plugins = request.plugins;
        const pluginNames = Object.keys(plugins);

        for (const pluginName of pluginNames) {
            const plugin = plugins[pluginName];
            // Do something with the plugin object
        }

        const generateDailyLoans = require('./generateLoans/generateDailyLoans.js');
        const generateWeeklyLoans = require('./generateLoans/generateWeeklyLoans.js');
        const generateMonthlyLoans = require('./generateLoans/generateMonthlyLoans.js');
        const generateYearlyLoans = require('./generateLoans/generateYearlyLoans.js');
        const generateDailyTransfers = require('./generateTransfers/generateDailyTransfers.js');
        const generateWeeklyTransfers = require('./generateTransfers/generateWeeklyTransfers.js');
        const generateMonthlyTransfers = require('./generateTransfers/generateMonthlyTransfers.js');
        const generateYearlyTransfers = require('./generateTransfers/generateYearlyTransfers.js');
        const calculateBalances = require('./calculateBalances.js');
        const toDate = new Date(request.query.to_date);
        const currentBalance = request.currentBalance;
        const account_id = parseInt(request.query.account_id);
        const transactions = [];

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

        request.transfers.forEach(transfer => {
            if (transfer.frequency_type === 0) {
                generateDailyTransfers(transactions, transfer, toDate, account_id)
            } else if (transfer.frequency_type === 1) {
                generateWeeklyTransfers(transactions, transfer, toDate, account_id)
            } else if (transfer.frequency_type === 2) {
                generateMonthlyTransfers(transactions, transfer, toDate, account_id)
            } else if (transfer.frequency_type === 3) {
                generateYearlyTransfers(transactions, transfer, toDate, account_id)
            }
        });

        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        calculateBalances(transactions, currentBalance);

        request.transactions = transactions;
        request.currentBalance = currentBalance;

        next();
    }
}

module.exports = generateTransactions;