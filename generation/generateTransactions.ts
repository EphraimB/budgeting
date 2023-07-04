import { Request, Response, NextFunction } from 'express';
import { generateDailyExpenses, generateWeeklyExpenses, generateMonthlyExpenses, generateYearlyExpenses } from './generateExpenses.js';
import { generateDailyLoans, generateWeeklyLoans, generateMonthlyLoans, generateYearlyLoans } from './generateLoans.js';
import generatePayrollTransactions from './generatePayrolls.js';
import { generateDailyTransfers, generateWeeklyTransfers, generateMonthlyTransfers, generateYearlyTransfers } from './generateTransfers.js';
import generateWishlists from './generateWishlists.js';
import calculateBalances from './calculateBalances.js';

interface Transaction {
    transaction_id: number;
    account_id: number;
    transaction_amount: number;
    transaction_type: string;
    transaction_title: string;
    transaction_description: string;
    transaction_date: string;
    date_created: string;
    date_modified: string;
}

interface Expense {
    expense_id: number;
    account_id: number;
    expense_amount: number;
    expense_title: string;
    expense_description: string;
    expense_date: string;
    frequency_type: number;
    date_created: string;
    date_modified: string;
}

interface Loan {
    loan_id: number;
    account_id: number;
    cron_job_id?: number;
    loan_amount: number;
    loan_plan_amount: number;
    loan_recipient: string;
    loan_title: string;
    loan_description: string;
    frequency_type: number;
    frequency_type_variable: number;
    frequency_day_of_month: number;
    frequency_day_of_week: number;
    frequency_week_of_month: number;
    frequency_month: number;
    loan_begin_date: string;
    loan_end_date: string;
    date_created: string;
    date_modified: string;
}

interface Payroll {
    payroll_id: number;
    account_id: number;
    payroll_amount: number;
    payroll_title: string;
    payroll_description: string;
    payroll_date: string;
    date_created: string;
    date_modified: string;
}

interface Wishlist {
    wishlist_id: number;
    account_id: number;
    wishlist_amount: number;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_date: string;
    date_created: string;
    date_modified: string;
}

interface Transfer {
    transfer_id: number;
    account_id: number;
    transfer_amount: number;
    transfer_title: string;
    transfer_description: string;
    transfer_date: string;
    frequency_type: number;
    date_created: string;
    date_modified: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        transaction: Transaction[];
        expenses: Expense[];
        loans: Loan[];
        payrolls: Payroll[];
        wishlists: Wishlist[];
        transfers: Transfer[];
        currentBalance: number;
    }
}

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Generates transactions for the given account and date range
 */
const generateTransactions = (request: Request, response: Response, next: NextFunction): void => {
    const fromDate = new Date(request.query.from_date as string);
    const toDate = new Date(request.query.to_date as string);
    const currentBalance = request.currentBalance;
    const account_id = parseInt(request.query.account_id as string);
    const transactions: any[] = [];
    const skippedTransactions: any[] = [];

    transactions.push(
        ...request.transaction.map(transaction => ({
            transaction_id: transaction.transaction_id,
            title: transaction.transaction_title,
            description: transaction.transaction_description,
            date: transaction.date_created,
            date_modified: transaction.date_modified,
            amount: transaction.transaction_amount
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

    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    calculateBalances(transactions.concat(skippedTransactions), currentBalance);

    request.wishlists.forEach(wishlist => {
        generateWishlists(transactions, skippedTransactions, wishlist, fromDate);

        transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        calculateBalances(transactions.concat(skippedTransactions), currentBalance);
    });

    request.transactions = transactions;
    request.currentBalance = currentBalance;

    next();
};

export default generateTransactions;
