import { Request, Response, NextFunction } from 'express';
import { transactionHistoryQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries, accountQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { Expense, Loan, Payroll, Transfer, Wishlist } from '../types/types.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';
import { cronJobQueries } from '../models/queryData.js';

interface WishlistInput {
    wishlist_id: any;
    account_id: string;
    cron_job_id: string;
    wishlist_amount: string;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_url_link: string;
    wishlist_priority: string;
    wishlist_date_available: string;
    wishlist_date_can_purchase: string;
    date_created: string;
    date_modified: string;
}

/**
 * 
 * @param wishlist - Wishlist object
 * @returns - Wishlist object with parsed values
 */
const wishlistsParse = (wishlist: WishlistInput): Wishlist => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    account_id: parseInt(wishlist.account_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    wishlist_date_can_purchase: wishlist.wishlist_date_can_purchase,
    date_created: wishlist.date_created,
    date_modified: wishlist.date_modified
});

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sets queries
 */
export const setQueries = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    request.query.from_date = new Date().toISOString().slice(0, 10);

    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    request.query.to_date = date.toISOString().slice(0, 10);

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
        const transactionsByAccount: { account_id: number, transactions: any }[] = [];

        let transactions: any[] = []; // Initialize transactions as an empty array

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const transactionsResults = await executeQuery(transactionHistoryQueries.getTransactionsDateMiddleware, [account.account_id, from_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const accountTransactions = transactionsResults.map(transaction => ({
                    ...transaction,
                    transaction_amount: parseFloat(transaction.transaction_amount),
                }));

                transactionsByAccount.push({ account_id: account.account_id, transactions: accountTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length === 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(transactionHistoryQueries.getTransactionsDateMiddleware, [account_id, from_date]);

            // Map over results array and convert amount to a float for each Transaction object
            transactions = results.map(transaction => ({
                ...transaction,
                transaction_amount: parseFloat(transaction.transaction_amount),
            }));

            transactionsByAccount.push({ account_id: parseInt(account_id as string), transactions });
        }

        request.transaction = transactionsByAccount;

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
        const expensesByAccount: { account_id: number, expenses: Expense[] }[] = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const expenseResults = await executeQuery(expenseQueries.getExpensesMiddleware, [account.account_id, to_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const expenseTransactions = expenseResults.map(expense => ({
                    ...expense,
                    amount: parseFloat(expense.expense_amount),
                }));

                expensesByAccount.push({ account_id: account.account_id, expenses: expenseTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(expenseQueries.getExpensesMiddleware, [account_id, to_date]);

            // Map over results array and convert amount to a float for each Expense object
            const expenseTransactions = results.map(expense => ({
                ...expense,
                amount: parseFloat(expense.expense_amount),
            }));

            expensesByAccount.push({ account_id: parseInt(account_id as string), expenses: expenseTransactions });
        }

        request.expenses = expensesByAccount;

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
        const loansByAccount: { account_id: number, loan: Loan[] }[] = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const loanResults = await executeQuery(loanQueries.getLoansMiddleware, [account.account_id, to_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const loanTransactions = loanResults.map(loan => ({
                    ...loan,
                    amount: parseFloat(loan.loan_plan_amount),
                }));

                loansByAccount.push({ account_id: account.account_id, loan: loanTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(loanQueries.getLoansMiddleware, [account_id, to_date]);

            // Map over results array and convert amount to a float for each Loan object
            const loansTransactions = results.map(loan => ({
                ...loan,
                amount: parseFloat(loan.loan_plan_amount),
            }));

            loansByAccount.push({ account_id: parseInt(account_id as string), loan: loansTransactions });
        }

        request.loans = loansByAccount;

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
        const payrollsByAccount: { employee_id: number, payroll: Payroll[] }[] = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const payrollResults = await executeQuery(payrollQueries.getPayrollsMiddleware, [account.employee_id, to_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const payrollTransactions = payrollResults.map(payroll => ({
                    ...payroll,
                    net_pay: parseFloat(payroll.net_pay),
                }));

                payrollsByAccount.push({ employee_id: account.employee_id, payroll: payrollTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            // Get employee_id from account_id
            const employeeResults = await executeQuery(accountQueries.getAccount, [account_id]);

            const employee_id = employeeResults[0].employee_id;

            const results = await executeQuery(payrollQueries.getPayrollsMiddleware, [employee_id, to_date]);

            // Map over results array and convert net_pay to a float for each Payroll object
            const payrollsTransactions = results.map(payroll => ({
                ...payroll,
                net_pay: parseFloat(payroll.net_pay),
            }));

            payrollsByAccount.push({ employee_id: parseInt(employee_id as string), payroll: payrollsTransactions });
        }

        request.payrolls = payrollsByAccount;

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
        const wishlistsByAccount: { account_id: number, wishlist: Wishlist[] }[] = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const wishlistResults = await executeQuery(wishlistQueries.getWishlistsMiddleware, [account.account_id, to_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const wishlistTransactions = wishlistResults.map(wishlist => ({
                    ...wishlist,
                    amount: parseFloat(wishlist.wishlist_amount),
                }));

                wishlistsByAccount.push({ account_id: account.account_id, wishlist: wishlistTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(wishlistQueries.getWishlistsMiddleware, [account_id, to_date]);

            // Map over results array and convert amount to a float for each Wishlist object
            const wishlistsTransactions = results.map(wishlist => ({
                ...wishlist,
                amount: parseFloat(wishlist.wishlist_amount),
            }));

            wishlistsByAccount.push({ account_id: parseInt(account_id as string), wishlist: wishlistsTransactions });
        }

        request.wishlists = wishlistsByAccount;

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
        const transferByAccount: { account_id: number, transfer: Transfer[] }[] = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(accountQueries.getAccounts);

            await Promise.all(accountResults.map(async (account) => {
                const transferResults = await executeQuery(transferQueries.getTransfersMiddleware, [account.account_id, to_date]);

                // Map over results array and convert amount to a float for each Transaction object
                const transferTransactions = transferResults.map(transfer => ({
                    ...transfer,
                    amount: parseFloat(transfer.transfer_amount),
                }));

                transferByAccount.push({ account_id: account.account_id, transfer: transferTransactions });
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(transferQueries.getTransfersMiddleware, [account_id, to_date]);

            // Map over results array and convert amount to a float for each Transfer object
            const transferTransactions = results.map(transfer => ({
                ...transfer,
                amount: parseFloat(transfer.transfer_amount),
            }));

            transferByAccount.push({ account_id: parseInt(account_id as string), transfer: transferTransactions });
        }

        request.transfers = transferByAccount;

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
        let currentBalance: { account_id: number, account_balance: number }[] = [];

        if (!account_id) {
            const accountResults = await executeQuery(accountQueries.getAccounts);

            currentBalance = await Promise.all(accountResults.map(async (account) => {
                const currentBalanceResults = await executeQuery(currentBalanceQueries.getCurrentBalance, [account.account_id]);

                return { account_id: account.account_id, account_balance: parseFloat(currentBalanceResults[0].account_balance) };
            }));
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(accountQueries.getAccount, [account_id as string]);

            if (accountExists.length == 0) {
                response.status(404).send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(currentBalanceQueries.getCurrentBalance, [account_id as string]);

            currentBalance = [{ account_id: parseInt(account_id as string), account_balance: parseFloat(results[0].account_balance) }];
        }

        request.currentBalance = currentBalance;

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting current balance');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Updates a cron job for a wishlist middleware
 */
export const updateWishlistCron = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    try {
        // Get all wishlists
        const wishlistsResults = await executeQuery(wishlistQueries.getAllWishlists, []);

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        // Process each wishlist
        for (const wslst of wishlistsResults) {
            const cronId = wslst.cron_job_id;

            const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);
            if (results.length > 0) {
                await deleteCronJob(results[0].unique_id);
            } else {
                console.error('Cron job not found');
                // Avoid sending a response in the middle of the loop
                continue;
            }

            const cronParams = {
                date: transactionMap[wslst.wishlist_id],
                account_id: wslst.account_id,
                id: wslst.wishlist_id,
                amount: -wslst.wishlist_amount,
                title: wslst.wishlist_title,
                description: wslst.wishlist_description,
                scriptPath: '/app/dist/scripts/createTransaction.sh',
                type: 'wishlist'
            };

            console.log(cronParams);

            if (!cronParams.date !== null) {
                const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

                await executeQuery(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);
            }
        }

        // Move on to the next middleware or route handler
        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
    }
};
