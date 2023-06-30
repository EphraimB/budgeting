import { generateDailyExpenses, generateWeeklyExpenses, generateMonthlyExpenses, generateYearlyExpenses } from './generateExpenses.js';
import { generateDailyLoans, generateWeeklyLoans, generateMonthlyLoans, generateYearlyLoans } from './generateLoans.js';
import generatePayrollTransactions from './generatePayrolls.js';
import { generateDailyTransfers, generateWeeklyTransfers, generateMonthlyTransfers, generateYearlyTransfers } from './generateTransfers.js';
import generateWishlists from './generateWishlists.js';
import calculateBalances from './calculateBalances.js';

const generateTransactions = (request, response, next) => {
    const fromDate = new Date(request.query.from_date);
    const toDate = new Date(request.query.to_date);
    const currentBalance = request.currentBalance;
    const account_id = parseInt(request.query.account_id);
    const transactions = [];
    const skippedTransactions = [];

    transactions.push(
        ...request.transaction.map(transaction => ({
            transaction_id: transaction.transaction_id,
            title: transaction.transaction_title,
            description: transaction.transaction_description,
            date: transaction.date_created,
            date_modified: transaction.date_modified,
            amount: parseFloat(transaction.transaction_amount)
        }))
    );

    request.expenses.forEach(expense => {
        if (expense.frequency_type === 0) {
            generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);
        } else if (expense.frequency_type === 1) {
            generateWeeklyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);
        } else if (expense.frequency_type === 2) {
            generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);
        } else if (expense.frequency_type === 3) {
            generateYearlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);
        }
    });

    request.payrolls.forEach(payroll => {
        generatePayrollTransactions(transactions, skippedTransactions, payroll, fromDate);
    });

    request.loans.forEach(loan => {
        if (loan.frequency_type === 0) {
            generateDailyLoans(transactions, skippedTransactions, loan, toDate, fromDate);
        } else if (loan.frequency_type === 1) {
            generateWeeklyLoans(transactions, skippedTransactions, loan, toDate, fromDate);
        } else if (loan.frequency_type === 2) {
            generateMonthlyLoans(transactions, skippedTransactions, loan, toDate, fromDate);
        } else if (loan.frequency_type === 3) {
            generateYearlyLoans(transactions, skippedTransactions, loan, toDate, fromDate);
        }
    });

    request.transfers.forEach(transfer => {
        if (transfer.frequency_type === 0) {
            generateDailyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);
        } else if (transfer.frequency_type === 1) {
            generateWeeklyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);
        } else if (transfer.frequency_type === 2) {
            generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);
        } else if (transfer.frequency_type === 3) {
            generateYearlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);
        }
    });

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    calculateBalances(transactions.concat(skippedTransactions), currentBalance);

    request.wishlists.forEach(wishlist => {
        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

        calculateBalances(transactions.concat(skippedTransactions), currentBalance);
    });

    request.transactions = transactions;
    request.currentBalance = currentBalance;

    next();
};

export default generateTransactions;
