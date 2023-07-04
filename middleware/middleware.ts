import { Request, Response, NextFunction } from 'express';
import { transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

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
    frequency_type: string;
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
    }
}

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all transactions or a single transaction if an id is provided
 */
export const getTransactionsByAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, from_date } = request.query;

    try {
        const results = await executeQuery(transactionHistoryQueries.getTransactionsDateMiddleware, [account_id, from_date]);

        request.transaction = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting transactions');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all expenses or a single expense if an id is provided
 */
export const getExpensesByAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(expenseQueries.getExpensesMiddleware, [account_id, to_date]);

        request.expenses = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting expenses');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all loans or a single loan if an id is provided
 */
export const getLoansByAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(loanQueries.getLoansMiddleware, [account_id, to_date]);

        request.loans = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting loans');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all payrolls or a single payroll if an id is provided
 */
export const getPayrollsMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(payrollQueries.getPayrollsMiddleware, [account_id, to_date]);

        request.payrolls = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting payrolls');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all wishlists or a single wishlist if an id is provided
 */
export const getWishlistsByAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(wishlistQueries.getWishlistsMiddleware, [account_id, to_date]);

        request.wishlists = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting wishlists');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all transfers or a single transfer if an id is provided
 */
export const getTransfersByAccount = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(transferQueries.getTransfersMiddleware, [account_id, to_date]);

        request.transfers = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting transfers');
    }
};

// Get current balance of account based on deposits and withdrawals
export const getCurrentBalance = async (request, response, next) => {
    const account_id = parseInt(request.query.account_id);

    try {
        const results = await executeQuery(currentBalanceQueries.getCurrentBalance, [account_id]);

        const currentBalance = parseFloat(results[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    } catch (error) {
        handleError(response, 'Error getting current balance');
    }
};
