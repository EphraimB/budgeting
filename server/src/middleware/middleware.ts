import { type Request, type Response, type NextFunction } from 'express';
import { type QueryResultRow } from 'pg';
import dayjs from 'dayjs';
import { parseIntOrFallback, handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import {
    transactionHistoryQueries,
    expenseQueries,
    loanQueries,
    payrollQueries,
    wishlistQueries,
    transferQueries,
    currentBalanceQueries,
    accountQueries,
    taxesQueries,
    cronJobQueries,
    incomeQueries,
    commuteScheduleQueries,
    fareCappingQueries,
    jobQueries,
} from '../models/queryData.js';
import {
    type Income,
    type Expense,
    type Transfer,
    type Wishlist,
} from '../types/types.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sets queries
 */
export const setQueries = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        request.query.fromDate = dayjs().format('YYYY-MM-DD');
        request.query.toDate = dayjs().add(1, 'year').format('YYYY-MM-DD');

        if (!request.query.accountId) {
            if (request.query.id) {
                const { rows } = await client.query(
                    wishlistQueries.getWishlistsById,
                    [request.query.id],
                );
                request.query.account_id = rows[0].account_id;
            }
        }
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error setting queries');
        return;
    } finally {
        client.release(); // Release the client back to the pool
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
export const getTransactionsByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, fromDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const transactionsByAccount: Array<{
            accountId: number;
            transactions: any;
        }> = [];

        let transactions: any[] = []; // Initialize transactions as an empty array

        if (!accountId) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const { rows } = await client.query(accountQueries.getAccounts);

            await Promise.all(
                rows.map(async (row) => {
                    const { rows: transactionsResults } = await client.query(
                        transactionHistoryQueries.getTransactionsDateMiddleware,
                        [row.account_id, fromDate],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const accountTransactions = transactionsResults.map(
                        (transaction) => ({
                            ...transaction,
                            transaction_amount: parseFloat(
                                transaction.transaction_amount,
                            ),
                            transaction_tax_rate: parseFloat(
                                transaction.transaction_tax_rate,
                            ),
                        }),
                    );

                    transactionsByAccount.push({
                        accountId: row.account_id,
                        transactions: accountTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                transactionHistoryQueries.getTransactionsDateMiddleware,
                [accountId, fromDate],
            );

            // Map over results array and convert amount to a float for each Transaction object
            transactions = results.map((transaction) => ({
                ...transaction,
                transaction_amount: parseFloat(transaction.transaction_amount),
                transaction_tax_rate: parseFloat(
                    transaction.transaction_tax_rate,
                ),
            }));

            transactionsByAccount.push({
                accountId: parseInt(accountId as string),
                transactions,
            });
        }

        request.transaction = transactionsByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transactions');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all income or a single income if an id is provided
 */
export const getIncomeByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Fetch all taxes
        const { rows } = await client.query(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = rows.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const incomeByAccount: Array<{
            accountId: number;
            income: Income[];
        }> = [];

        if (!accountId) {
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: incomeResults } = await client.query(
                        incomeQueries.getIncomeMiddleware,
                        [account.account_id, toDate],
                    );

                    const incomeTransactions: Income[] = incomeResults.map(
                        (income) => {
                            const tax: QueryResultRow =
                                taxLookup[income.tax_id] !== undefined
                                    ? taxLookup[income.tax_id]
                                    : { rate: 0 };

                            return {
                                ...income,
                                tax_rate: parseFloat(tax.rate),
                                amount: parseFloat(income.income_amount),
                                income_amount: parseFloat(income.income_amount),
                            };
                        },
                    );

                    incomeByAccount.push({
                        accountId: account.account_id,
                        income: incomeTransactions,
                    });
                }),
            );
        } else {
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: incomeResults } = await client.query(
                incomeQueries.getIncomeMiddleware,
                [accountId, toDate],
            );

            const incomeTransactions: Income[] = incomeResults.map((income) => {
                const tax: QueryResultRow =
                    taxLookup[income.tax_id] !== undefined
                        ? taxLookup[income.tax_id]
                        : { rate: 0 };

                return {
                    ...income,
                    tax_rate: parseFloat(tax.rate),
                    amount: parseFloat(income.income_amount),
                    income_amount: parseFloat(income.income_amount),
                };
            });

            incomeByAccount.push({
                accountId: parseInt(accountId as string),
                income: incomeTransactions,
            });
        }

        request.income = incomeByAccount;

        next();
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error getting income');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all expenses or a single expense if an id is provided
 */
export const getExpensesByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Fetch all taxes
        const { rows } = await client.query(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = rows.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const expensesByAccount: Array<{
            accountId: number;
            expenses: Expense[];
        }> = [];

        if (!accountId) {
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: expenseResults } = await client.query(
                        expenseQueries.getExpensesMiddleware,
                        [account.account_id, toDate],
                    );

                    const expenseTransactions = expenseResults.map(
                        (expense: any) => {
                            const tax: QueryResultRow =
                                taxLookup[expense.tax_id] !== undefined
                                    ? taxLookup[expense.tax_id]
                                    : { tax_rate: 0 };

                            return {
                                ...expense,
                                tax_rate: parseFloat(tax.tax_rate),
                            };
                        },
                    );

                    expensesByAccount.push({
                        accountId: account.account_id,
                        expenses: expenseTransactions,
                    });
                }),
            );
        } else {
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: expenseResults } = await client.query(
                expenseQueries.getExpensesMiddleware,
                [accountId, toDate],
            );

            const expenseTransactions = expenseResults.map((expense) => {
                const tax: QueryResultRow =
                    taxLookup[expense.tax_id] !== undefined
                        ? taxLookup[expense.tax_id]
                        : { tax_rate: 0 };

                return {
                    ...expense,
                    tax_rate: parseFloat(tax.tax_rate),
                };
            });

            expensesByAccount.push({
                accountId: parseInt(accountId as string),
                expenses: expenseTransactions,
            });
        }

        request.expenses = expensesByAccount;

        next();
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error getting expenses');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param loan - Loan object
 * @returns - Loan object with parsed values
 */
const parseLoan = (loan: Record<string, string>): any => ({
    loanId: parseInt(loan.loan_id),
    accountId: parseInt(loan.account_id),
    taxId: parseIntOrFallback(loan.tax_id),
    loanAmount: parseFloat(loan.loan_amount),
    loanPlanAmount: parseFloat(loan.loan_plan_amount),
    loanRecipient: loan.loan_recipient,
    loanTitle: loan.loan_title,
    loanDescription: loan.loan_description,
    frequencyType: parseInt(loan.frequency_type),
    frequencyTypeVariable: parseInt(loan.frequency_type_variable),
    frequencyDayOfMonth: parseIntOrFallback(loan.frequency_day_of_month),
    frequencyDayOfWeek: parseIntOrFallback(loan.frequency_day_of_week),
    frequencyWeekOfMonth: parseIntOrFallback(loan.frequency_week_of_month),
    frequencyMonthOfYear: parseIntOrFallback(loan.frequency_month_of_year),
    loanInterestRate: parseFloat(loan.loan_interest_rate),
    loanInterestFrequencyType: parseInt(loan.loan_interest_frequency_type),
    loanSubsidized: parseFloat(loan.loan_subsidized),
    loanBeginDate: loan.loan_begin_date,
    loanEndDate: loan.loan_end_date ?? null,
    dateCreated: loan.date_created,
    dateModified: loan.date_modified,
});

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all loans or a single loan if an id is provided
 */
export const getLoansByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const loansByAccount: Array<{ accountId: number; loan: any }> = [];

        if (!accountId) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: loanResults } = await client.query(
                        loanQueries.getLoansMiddleware,
                        [account.account_id, toDate],
                    );

                    // Map over results array and convert amount to a float for each Loan object
                    const loansTransactions = loanResults.map((loan) =>
                        parseLoan(loan),
                    );

                    loansByAccount.push({
                        accountId: account.account_id,
                        loan: loansTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                loanQueries.getLoansMiddleware,
                [accountId, toDate],
            );

            // Map over results array and convert amount to a float for each Loan object
            const loansTransactions = results.map((loan) => parseLoan(loan));

            loansByAccount.push({
                accountId: parseInt(accountId as string),
                loan: loansTransactions,
            });
        }

        request.loans = loansByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting loans');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all payrolls or a single payroll if an id is provided
 */
export const getPayrollsMiddleware = async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    const { accountId, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const payrollsByAccount = [];

        if (!accountId) {
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: jobResults } = await client.query(
                        jobQueries.getJobsByAccountId,
                        [account.account_id],
                    );

                    const jobsPayrolls = await Promise.all(
                        jobResults.map(async (job) => {
                            const { rows: payrollResults } = await client.query(
                                payrollQueries.getPayrollsMiddleware,
                                [job.job_id, toDate],
                            );

                            return {
                                jobId: job.job_id,
                                jobName: job.job_name,
                                payrolls: payrollResults.map((payroll) => ({
                                    ...payroll,
                                    netPay: parseFloat(payroll.net_pay),
                                    grossPay: parseFloat(payroll.gross_pay),
                                })),
                            };
                        }),
                    );

                    const returnObj = {
                        accountId: parseInt(account.account_id as string),
                        jobs: jobsPayrolls,
                    };

                    payrollsByAccount.push(returnObj);
                }),
            );
        } else {
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                return response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
            }

            const { rows: jobResults } = await client.query(
                jobQueries.getJobsByAccountId,
                [accountId],
            );

            const jobsPayrolls = await Promise.all(
                jobResults.map(async (job) => {
                    const { rows: payrollResults } = await client.query(
                        payrollQueries.getPayrollsMiddleware,
                        [job.job_id, toDate],
                    );

                    return {
                        jobId: job.job_id,
                        jobName: job.job_name,
                        payrolls: payrollResults.map((payroll) => ({
                            ...payroll,
                            netPay: parseFloat(payroll.net_pay),
                            grossPay: parseFloat(payroll.gross_pay),
                        })),
                    };
                }),
            );

            const returnObj = {
                accountId: parseInt(accountId as string),
                jobs: jobsPayrolls,
            };

            payrollsByAccount.push(returnObj);
        }

        request.payrolls = payrollsByAccount;

        next();
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error getting payrolls');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all wishlists or a single wishlist if an id is provided
 */
export const getWishlistsByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Fetch all taxes
        const { rows: allTaxes } = await client.query(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = allTaxes.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const wishlistsByAccount: Array<{
            accountId: number;
            wishlist: Wishlist[];
        }> = [];

        if (!accountId) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: wishlistResults } = await client.query(
                        wishlistQueries.getWishlistsMiddleware,
                        [account.account_id, toDate],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const wishlistTransactions = wishlistResults.map(
                        (wishlist) => {
                            const tax: QueryResultRow =
                                taxLookup[wishlist.tax_id] !== undefined
                                    ? taxLookup[wishlist.tax_id]
                                    : { rate: 0 };

                            return {
                                ...wishlist,
                                taxRate: parseFloat(tax.rate),
                                amount: parseFloat(wishlist.wishlist_amount),
                                wishlistAmount: parseFloat(
                                    wishlist.wishlist_amount,
                                ),
                            };
                        },
                    );

                    wishlistsByAccount.push({
                        accountId: account.account_id,
                        wishlist: wishlistTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                wishlistQueries.getWishlistsMiddleware,
                [accountId, toDate],
            );

            // Map over results array and convert amount to a float for each Wishlist object
            const wishlistsTransactions = results.map((wishlist) => {
                const tax: QueryResultRow =
                    taxLookup[wishlist.tax_id] !== undefined
                        ? taxLookup[wishlist.tax_id]
                        : { rate: 0 };

                return {
                    ...wishlist,
                    taxRate: parseFloat(tax.rate),
                    amount: parseFloat(wishlist.wishlist_amount),
                    wishlistAmount: parseFloat(wishlist.wishlist_amount),
                };
            });

            wishlistsByAccount.push({
                accountId: parseInt(accountId as string),
                wishlist: wishlistsTransactions,
            });
        }

        request.wishlists = wishlistsByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting wishlists');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all transfers or a single transfer if an id is provided
 */
export const getTransfersByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId, toDate } = request.query as Record<string, string>;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const transferByAccount: Array<{
            accountId: number;
            transfer: Transfer[];
        }> = [];

        if (!accountId) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: transferResults } = await client.query(
                        transferQueries.getTransfersMiddleware,
                        [account.account_id, toDate],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const transferTransactions = transferResults.map(
                        (transfer) => ({
                            ...transfer,
                            amount: parseFloat(transfer.transfer_amount),
                        }),
                    );

                    transferByAccount.push({
                        accountId: account.account_id,
                        transfer: transferTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                transferQueries.getTransfersMiddleware,
                [accountId, toDate],
            );

            // Map over results array and convert amount to a float for each Transfer object
            const transferTransactions = results.map((transfer) => ({
                ...transfer,
                amount: parseFloat(transfer.transfer_amount),
            }));

            transferByAccount.push({
                accountId: parseInt(accountId),
                transfer: transferTransactions,
            });
        }

        request.transfers = transferByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfers');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with all commute expenses or a single commute expense if an id is provided
 */
export const getCommuteExpensesByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId } = request.query as Record<string, string>;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const commuteExpensesByAccount: Array<{
            accountId: number;
            commuteExpenses: object;
            fareCapping: object;
        }> = [];

        if (!accountId) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: commuteExpensesResults } = await client.query(
                        commuteScheduleQueries.getCommuteSchedulesByAccountId,
                        [account.account_id],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const commuteExpensesTransactions =
                        commuteExpensesResults.map((commuteExpense) => ({
                            ...commuteExpense,
                            fare_amount: parseFloat(commuteExpense.fare_amount),
                        }));

                    const { rows: fareCappingResults } = await client.query(
                        fareCappingQueries.getFareCapping,
                        [account.account_id],
                    );

                    const fareCapping = fareCappingResults.map(
                        (fareCapping) => ({
                            ...fareCapping,
                            fareCap: parseFloat(fareCapping.fare_cap),
                            currentSpent: parseFloat(fareCapping.current_spent),
                            fare_cap_duration: parseInt(
                                fareCapping.fare_cap_duration,
                            ),
                        }),
                    );

                    commuteExpensesByAccount.push({
                        accountId: account.account_id,
                        commuteExpenses: commuteExpensesTransactions,
                        fareCapping: fareCapping,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                commuteScheduleQueries.getCommuteSchedulesByAccountId,
                [accountId],
            );

            // Map over results array and convert amount to a float for each Commute Expense object
            const commuteExpensesTransactions = results.map(
                (commuteExpense) => ({
                    ...commuteExpense,
                    fareAmount: parseFloat(commuteExpense.fare_amount),
                }),
            );

            const { rows: fareCappingResults } = await client.query(
                fareCappingQueries.getFareCapping,
                [accountId],
            );

            const fareCapping = fareCappingResults.map((fareCapping) => ({
                ...fareCapping,
                fareCap: parseFloat(fareCapping.fare_cap),
                currentSpent: parseFloat(fareCapping.current_spent),
                fareCapDuration: parseInt(fareCapping.fare_cap_duration),
            }));

            commuteExpensesByAccount.push({
                accountId: parseInt(accountId),
                commuteExpenses: commuteExpensesTransactions,
                fareCapping: fareCapping,
            });
        }

        request.commuteExpenses = commuteExpensesByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting commute expenses');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the current balance of an account
 */
export const getCurrentBalance = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { accountId } = request.query as { accountId: string };

    const client = await pool.connect(); // Get a client from the pool

    try {
        let currentBalance: Array<{
            accountId: number;
            accountBalance: number;
        }> = [];

        if (!accountId) {
            const { rows: accountResults } = await client.query(
                accountQueries.getAccounts,
            );

            currentBalance = await Promise.all(
                accountResults.map(async (account) => {
                    const { rows: currentBalanceResults } = await client.query(
                        currentBalanceQueries.getCurrentBalance,
                        [account.account_id],
                    );

                    return {
                        accountId: account.account_id,
                        accountBalance: parseFloat(
                            currentBalanceResults[0].account_balance,
                        ),
                    };
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const { rows: accountExists } = await client.query(
                accountQueries.getAccount,
                [accountId],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${accountId} not found`);
                return;
            }

            const { rows: results } = await client.query(
                currentBalanceQueries.getCurrentBalance,
                [accountId],
            );

            currentBalance = [
                {
                    accountId: parseInt(accountId),
                    accountBalance: parseFloat(results[0].account_balance),
                },
            ];
        }

        request.currentBalance = currentBalance;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting current balance');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Updates a cron job for a wishlist middleware
 */
export const updateWishlistCron = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        // Get all wishlists
        const { rows: wishlistsResults } = await client.query(
            wishlistQueries.getAllWishlists,
            [],
        );

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlistId] = transaction.date;
            });
        });

        // First, delete all necessary cron jobs
        for (const wslst of wishlistsResults) {
            const cronId = wslst.cron_job_id;
            const { rows: results } = await client.query(
                cronJobQueries.getCronJob,
                [cronId],
            );

            if (results.length > 0) {
                await client.query(
                    `SELECT cron.unschedule('${results[0].unique_id}')`,
                );
            } else {
                logger.error('Cron job not found');
            }
        }

        // Then, schedule all necessary cron jobs
        for (const wslst of wishlistsResults) {
            const cronId = wslst.cron_job_id;
            const taxId = wslst.tax_id;

            const { rows: taxRateResults } = await client.query(
                taxesQueries.getTax,
                [taxId],
            );

            // Get tax amount from tax_id in taxes table
            const taxRate: number = taxId ? taxRateResults[0].tax_rate : 0;

            const jobDetails = {
                date: transactionMap[wslst.wishlist_id],
            };

            if (jobDetails.date) {
                const cronDate = determineCronValues(
                    jobDetails as { date: string },
                );

                const uniqueId = `wishlist-${wslst.wishlist_id}`;

                await client.query(`
                    SELECT cron.schedule '${uniqueId}', '${cronDate}',
                    $$INSERT INTO transaction_history
                        (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
                        VALUES (${
                            wslst.account_id
                        }, ${-wslst.wishlist_amount}, ${taxRate}, '${
                            wslst.wishlist_title
                        }', '${wslst.wishlist_description}')$$`);

                await client.query(cronJobQueries.updateCronJob, [
                    uniqueId,
                    cronDate,
                    cronId,
                ]);
            }
        }

        // Move on to the next middleware or route handler
        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
