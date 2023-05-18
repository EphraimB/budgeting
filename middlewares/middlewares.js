import pool from '../db.js';
import { transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries } from '../queryData.js';

// Get deposits by account
export const getTransactionsByAccount = (request, response, next) => {
    const { account_id, from_date } = request.query;

    pool.query(transactionHistoryQueries.getTransactionsDateFiltered, [parseInt(account_id), from_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
        }

        request.transaction = results.rows;

        next();
    });
};

// Get expenses by account
export const getExpensesByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(expenseQueries.getExpensesByAccount, [account_id, to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
        }

        request.expenses = results.rows;

        next();
    });
};

// Get loans by account
export const getLoansByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(loanQueries.getLoansByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting loans", "param": null, "location": "query" } });
        }

        request.loans = results.rows;

        next();
    });
};

// Get payrolls by account
export const getPayrollsMiddleware = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(payrollQueries.getPayrollsMiddleware, [account_id, to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        request.payrolls = results.rows;

        next();
    });
};

// Get wishlists by account
export const getWishlistsByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(wishlistQueries.getWishlistsByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting wishlists", "param": null, "location": "query" } });
        }

        request.wishlists = results.rows;

        next();
    });
};

// Get transfers by account
export const getTransfersByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(transferQueries.getTransfersByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transfers", "param": null, "location": "query" } });
        }

        request.transfers = results.rows;

        next();
    });
};

// Get current balance of account based on deposits and withdrawals
export const getCurrentBalance = (request, response, next) => {
    const account_id = parseInt(request.query.account_id);

    pool.query(currentBalanceQueries.getCurrentBalance, [account_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting current balance", "param": null, "location": "query" } });
        }

        const currentBalance = parseFloat(results.rows[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    });
};