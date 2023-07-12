import { Request, Response, NextFunction } from 'express';
import { generateDailyExpenses, generateWeeklyExpenses, generateMonthlyExpenses, generateYearlyExpenses } from './generateExpenses.js';
import { generateDailyLoans, generateWeeklyLoans, generateMonthlyLoans, generateYearlyLoans } from './generateLoans.js';
import generatePayrollTransactions from './generatePayrolls.js';
import { generateDailyTransfers, generateWeeklyTransfers, generateMonthlyTransfers, generateYearlyTransfers } from './generateTransfers.js';
import generateWishlists from './generateWishlists.js';
import calculateBalances from './calculateBalances.js';
import { Account, CurrentBalance, Expense, GeneratedTransaction, Transaction } from '../types/types.js';
import { executeQuery } from '../utils/helperFunctions.js';
import { accountQueries } from '../models/queryData.js';

const generate = async (request: Request, response: Response, next: NextFunction, account_id: number, transactions: GeneratedTransaction[], skippedTransactions: GeneratedTransaction[], currentBalance: any): Promise<void> => {
    const fromDate: Date = new Date(request.query.from_date as string);
    const toDate: Date = new Date(request.query.to_date as string);

    request.transaction
        .filter((tran) => tran.account_id === account_id)
        .forEach((account) =>
            account.transactions.forEach((transaction: Transaction) =>
                transactions.push({
                    transaction_id: transaction.transaction_id,
                    title: transaction.transaction_title,
                    description: transaction.transaction_description,
                    date: new Date(transaction.date_created),
                    date_modified: new Date(transaction.date_modified),
                    amount: transaction.transaction_amount,
                })
            )
        );

    request.expenses
        .filter((exp) => exp.account_id === account_id)
        .forEach((account) => {
            account.expenses.forEach((expense: Expense) => {
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
}

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Generates transactions for the given account and date range
 */
const generateTransactions = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const account_id: number = parseInt(request.query.account_id as string);
    const currentBalance: any = request.currentBalance;
    const allTransactions: any[] = [];
    const transactions: GeneratedTransaction[] = [];
    const allSkippedTransactions: GeneratedTransaction[][] = [];
    const skippedTransactions: GeneratedTransaction[] = [];

    if (!account_id) {
        const accountResults = await executeQuery(accountQueries.getAccounts, []);

        accountResults.forEach((account: Account) => {
            generate(request, response, next, account.account_id, transactions, skippedTransactions, currentBalance
                .find((balance: CurrentBalance) => balance.account_id === account.account_id)
                .account_balance);

            allTransactions.push({ account_id, transactions });
        });
    } else {
        generate(request, response, next, account_id, transactions, skippedTransactions, currentBalance
            .find((balance: CurrentBalance) => balance.account_id === account_id)
            .account_balance);
    }

    request.transactions = transactions;

    next();
};

export default generateTransactions;
