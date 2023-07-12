import { Request, Response, NextFunction } from 'express';
import { transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries, accountQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sets queries
 */
export const setQueries = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    request.query.from_date = new Date().toISOString().slice(0, 10);
    request.query.to_date = new Date(+new Date() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (!request.query.account_id) {
        if (request.query.id) {
            const results = await executeQuery(wishlistQueries.getWishlistsById, [request.query.id]);
            request.query.account_id = results[0].account_id;
        }
    }

    next();
};

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
        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);
            const transactionsByAccount: { account_id: string, transactions: any }[] = [];

            for (const account of accountResults) {
                const transactionsResults = await executeQuery(transactionHistoryQueries.getTransactionsDateMiddleware, [account.account_id, from_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const transactions = transactionsResults.map(transaction => ({
                    ...transaction,
                    transaction_amount: parseFloat(transaction.transaction_amount),
                }));

                transactionsByAccount.push({ account_id: account.account_id, transactions });
            }

            request.transactions = transactionsByAccount;

            console.log(request.transactions);
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length === 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(transactionHistoryQueries.getTransactionsDateMiddleware, [account_id, from_date]);

            // Map over results array and convert amount to a float for each Transaction object
            const transactions = results.map(transaction => ({
                ...transaction,
                transaction_amount: parseFloat(transaction.transaction_amount),
            }));

            request.transactions = [{ account_id, transactions }];

            console.log(request.transactions);
        }

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        // Check if account exists and if it doesn't, send a response with an error message
        const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

        if (accountExists.length == 0) {
            response.status(404).send('Account not found');
            return;
        }

        const results = await executeQuery(expenseQueries.getExpensesMiddleware, [account_id, to_date]);

        // Map over results array and convert amount to a float for each Expense object
        request.expenses = results.map(expense => ({
            ...expense,
            amount: parseFloat(expense.expense_amount),
        }));

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        // Check if account exists and if it doesn't, send a response with an error message
        const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

        if (accountExists.length == 0) {
            response.status(404).send('Account not found');
            return;
        }

        const results = await executeQuery(loanQueries.getLoansMiddleware, [account_id, to_date]);

        // Map over results array and convert amount to a float for each Loan object
        request.loans = results.map(loan => ({
            ...loan,
            amount: parseFloat(loan.loan_plan_amount),
        }));

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        // Check if account exists and if it doesn't, send a response with an error message
        const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

        if (accountExists.length == 0) {
            response.status(404).send('Account not found');
            return;
        }

        const results = await executeQuery(payrollQueries.getPayrollsMiddleware, [account_id, to_date]);

        // Map over results array and convert net_pay to a float for each Payroll object
        request.payrolls = results.map(payroll => ({
            ...payroll,
            net_pay: parseFloat(payroll.net_pay),
        }));

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        // Check if account exists and if it doesn't, send a response with an error message
        const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

        if (accountExists.length == 0) {
            response.status(404).send('Account not found');
            return;
        }

        const results = await executeQuery(wishlistQueries.getWishlistsMiddleware, [account_id, to_date]);

        // Map over results array and convert amount to a float for each Wishlist object
        request.wishlists = results.map(wishlist => ({
            ...wishlist,
            amount: parseFloat(wishlist.wishlist_amount),
        }));

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        // Check if account exists and if it doesn't, send a response with an error message
        const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

        if (accountExists.length == 0) {
            response.status(404).send('Account not found');
            return;
        }

        const results = await executeQuery(transferQueries.getTransfersMiddleware, [account_id, to_date]);

        // Map over results array and convert amount to a float for each Transfer object
        request.transfers = results.map(transfer => ({
            ...transfer,
            amount: parseFloat(transfer.transfer_amount),
        }));

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfers');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the current balance of an account
 */
export const getCurrentBalance = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const { account_id } = request.query;

    try {
        const currentBalance: any = [];

        if (!account_id) {
            const accountResults = await executeQuery(accountQueries.getAccounts);

            accountResults.forEach(async (account) => {
                const currentBalanceResults = await executeQuery(currentBalanceQueries.getCurrentBalance, [account.account_id]);

                currentBalance.push({ account_id, currentBalance: parseFloat(currentBalanceResults[0].account_balance) });
            });
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send('Account not found');
                return;
            }

            const results = await executeQuery(currentBalanceQueries.getCurrentBalance, [account_id]);

            currentBalance.push({ account_id, currentBalance: parseFloat(results[0].account_balance) });
        }

        request.currentBalance = currentBalance;

        console.log(request.currentBalance);

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting current balance');
    }
};
