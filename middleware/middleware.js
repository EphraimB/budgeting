import { transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

// Get deposits by account
export const getTransactionsByAccount = async (request, response, next) => {
    const { account_id, from_date } = request.query;

    try {
        const results = await executeQuery(transactionHistoryQueries.getTransactionsDateFiltered, [parseInt(account_id), from_date]);

        request.transaction = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting transactions');
    }
};

// Get expenses by account
export const getExpensesByAccount = async (request, response, next) => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(expenseQueries.getExpensesByAccount, [account_id, to_date]);

        request.expenses = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting expenses');
    }
};

// Get loans by account
export const getLoansByAccount = async (request, response, next) => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(loanQueries.getLoansByAccount, [parseInt(account_id), to_date]);

        request.loans = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting loans');
    }
};

// Get payrolls by account
export const getPayrollsMiddleware = async (request, response, next) => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(payrollQueries.getPayrollsMiddleware, [account_id, to_date]);

        request.payrolls = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting payrolls');
    }
};

// Get wishlists by account
export const getWishlistsByAccount = async (request, response, next) => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(wishlistQueries.getWishlistsByAccount, [parseInt(account_id), to_date]);

        request.wishlists = results;

        next();
    } catch (error) {
        handleError(response, 'Error getting wishlists');
    }
};

// Get transfers by account
export const getTransfersByAccount = async (request, response, next) => {
    const { account_id, to_date } = request.query;

    try {
        const results = await executeQuery(transferQueries.getTransfersByAccount, [parseInt(account_id), to_date]);

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