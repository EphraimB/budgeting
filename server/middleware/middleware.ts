import { type Request, type Response, type NextFunction } from 'express';
import { type QueryResultRow } from 'pg';
import dayjs, { type Dayjs } from 'dayjs';
import {
    parseIntOrFallback,
    handleError,
    executeQuery,
    unscheduleQuery,
    scheduleQuery,
} from '../utils/helperFunctions.js';
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
} from '../models/queryData.js';
import {
    type Income,
    type Expense,
    type Loan,
    type Payroll,
    type Transfer,
    type Wishlist,
} from '../types/types.js';
import determineCronValues from '../crontab/determineCronValues.js';

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
    try {
        request.query.from_date = dayjs().format('YYYY-MM-DD');
        request.query.to_date = dayjs().add(1, 'year').format('YYYY-MM-DD');

        if (
            request.query.account_id === undefined ||
            request.query.account_id === null
        ) {
            if (request.query.id !== undefined && request.query.id !== null) {
                const results = await executeQuery(
                    wishlistQueries.getWishlistsById,
                    [request.query.id],
                );
                request.query.account_id = results[0].account_id;
            }
        }
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error setting queries');
        return;
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
    const { account_id, from_date } = request.query;

    try {
        const transactionsByAccount: Array<{
            account_id: number;
            transactions: any;
        }> = [];

        let transactions: any[] = []; // Initialize transactions as an empty array

        if (account_id === null || account_id === undefined) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const transactionsResults = await executeQuery(
                        transactionHistoryQueries.getTransactionsDateMiddleware,
                        [account.account_id, from_date],
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
                        account_id: account.account_id,
                        transactions: accountTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(
                transactionHistoryQueries.getTransactionsDateMiddleware,
                [account_id, from_date],
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
                account_id: parseInt(account_id as string),
                transactions,
            });
        }

        request.transaction = transactionsByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transactions');
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
    const { account_id, to_date } = request.query;

    try {
        // Fetch all taxes
        const allTaxes = await executeQuery(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = allTaxes.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const incomeByAccount: Array<{
            account_id: number;
            income: Income[];
        }> = [];

        if (account_id === null || account_id === undefined) {
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const incomeResults = await executeQuery(
                        incomeQueries.getIncomeMiddleware,
                        [account.account_id, to_date],
                    );

                    const incomeTransactions: Income[] = incomeResults.map(
                        (income) => {
                            const tax: QueryResultRow =
                                taxLookup[income.tax_id] !== undefined
                                    ? taxLookup[income.tax_id]
                                    : { tax_rate: 0 };

                            return {
                                ...income,
                                tax_rate: parseFloat(tax.tax_rate),
                                amount: parseFloat(income.income_amount),
                                income_amount: parseFloat(income.income_amount),
                            };
                        },
                    );

                    incomeByAccount.push({
                        account_id: account.account_id,
                        income: incomeTransactions,
                    });
                }),
            );
        } else {
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const incomeResults = await executeQuery(
                incomeQueries.getIncomeMiddleware,
                [account_id, to_date],
            );

            const incomeTransactions: Income[] = incomeResults.map((income) => {
                const tax: QueryResultRow =
                    taxLookup[income.tax_id] !== undefined
                        ? taxLookup[income.tax_id]
                        : { tax_rate: 0 };

                return {
                    ...income,
                    tax_rate: parseFloat(tax.tax_rate),
                    amount: parseFloat(income.income_amount),
                    income_amount: parseFloat(income.income_amount),
                };
            });

            incomeByAccount.push({
                account_id: parseInt(account_id as string),
                income: incomeTransactions,
            });
        }

        request.income = incomeByAccount;

        next();
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error getting income');
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
    const { account_id, to_date } = request.query;

    try {
        // Fetch all taxes
        const allTaxes = await executeQuery(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = allTaxes.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const expensesByAccount: Array<{
            account_id: number;
            expenses: Expense[];
        }> = [];

        if (!account_id) {
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const expenseResults = await executeQuery(
                        expenseQueries.getExpensesMiddleware,
                        [account.account_id, to_date],
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
                                amount: parseFloat(expense.amount),
                                subsidized: parseFloat(expense.subsidized),
                            };
                        },
                    );

                    expensesByAccount.push({
                        account_id: account.account_id,
                        expenses: expenseTransactions,
                    });
                }),
            );
        } else {
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const expenseResults = await executeQuery(
                expenseQueries.getExpensesMiddleware,
                [account_id, to_date],
            );

            const expenseTransactions = expenseResults.map((expense) => {
                const tax: QueryResultRow =
                    taxLookup[expense.tax_id] !== undefined
                        ? taxLookup[expense.tax_id]
                        : { tax_rate: 0 };

                return {
                    ...expense,
                    tax_rate: parseFloat(tax.tax_rate),
                    amount: parseFloat(expense.amount),
                    subsidized: parseFloat(expense.subsidized),
                };
            });

            expensesByAccount.push({
                account_id: parseInt(account_id as string),
                expenses: expenseTransactions,
            });
        }

        request.expenses = expensesByAccount;

        next();
    } catch (error) {
        logger.error(error);
        handleError(response, 'Error getting expenses');
    }
};

/**
 *
 * @param loan - Loan object
 * @returns - Loan object with parsed values
 */
const parseLoan = (loan: Record<string, string>): any => ({
    loan_id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    tax_id: parseIntOrFallback(loan.tax_id),
    loan_amount: parseFloat(loan.loan_amount),
    loan_plan_amount: parseFloat(loan.loan_plan_amount),
    loan_recipient: loan.loan_recipient,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    frequency_type: parseInt(loan.frequency_type),
    frequency_type_variable: parseIntOrFallback(loan.frequency_type_variable),
    frequency_day_of_month: parseIntOrFallback(loan.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(loan.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(loan.frequency_week_of_month),
    frequency_month_of_year: parseIntOrFallback(loan.frequency_month_of_year),
    loan_interest_rate: parseFloat(loan.loan_interest_rate),
    loan_interest_frequency_type: parseInt(loan.loan_interest_frequency_type),
    loan_subsidized: parseFloat(loan.loan_subsidized),
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date ?? null,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
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
    const { account_id, to_date } = request.query;

    try {
        const loansByAccount: Array<{ account_id: number; loan: any }> = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const loanResults = await executeQuery(
                        loanQueries.getLoansMiddleware,
                        [account.account_id, to_date],
                    );

                    // Map over results array and convert amount to a float for each Loan object
                    const loansTransactions = loanResults.map((loan) =>
                        parseLoan(loan),
                    );

                    const loansTransactionsWithAmount = loansTransactions.map(
                        (loan) => ({
                            ...loan,
                            amount: parseFloat(
                                loan.loan_plan_amount as unknown as string,
                            ),
                        }),
                    );

                    loansByAccount.push({
                        account_id: account.account_id,
                        loan: loansTransactionsWithAmount,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(loanQueries.getLoansMiddleware, [
                account_id,
                to_date,
            ]);

            // Map over results array and convert amount to a float for each Loan object
            const loansTransactions = results.map((loan) => parseLoan(loan));

            const loansTransactionsWithAmount = loansTransactions.map(
                (loan) => ({
                    ...loan,
                    amount: parseFloat(
                        loan.loan_plan_amount as unknown as string,
                    ),
                }),
            );

            loansByAccount.push({
                account_id: parseInt(account_id as string),
                loan: loansTransactionsWithAmount,
            });
        }

        request.loans = loansByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
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
export const getPayrollsMiddleware = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { account_id, to_date } = request.query as Record<string, string>;

    try {
        const payrollsByAccount: Array<{
            employee_id: number;
            payroll: Payroll[];
        }> = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const payrollResults = await executeQuery(
                        payrollQueries.getPayrollsMiddleware,
                        [account.employee_id, to_date],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const payrollTransactions = payrollResults.map(
                        (payroll) => ({
                            ...payroll,
                            net_pay: parseFloat(payroll.net_pay),
                            gross_pay: parseFloat(payroll.gross_pay),
                        }),
                    );

                    payrollsByAccount.push({
                        employee_id: account.employee_id,
                        payroll: payrollTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            // Get employee_id from account_id
            const employeeResults = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            const employee_id = employeeResults[0].employee_id;

            const results = await executeQuery(
                payrollQueries.getPayrollsMiddleware,
                [employee_id, to_date],
            );

            // Map over results array and convert net_pay to a float for each Payroll object
            const payrollsTransactions = results.map((payroll) => ({
                ...payroll,
                net_pay: parseFloat(payroll.net_pay),
                gross_pay: parseFloat(payroll.gross_pay),
            }));

            payrollsByAccount.push({
                employee_id: parseInt(employee_id as string),
                payroll: payrollsTransactions,
            });
        }

        request.payrolls = payrollsByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
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
export const getWishlistsByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { account_id, to_date } = request.query;

    try {
        // Fetch all taxes
        const allTaxes = await executeQuery(taxesQueries.getTaxes);

        // Create an object where key is the tax id and value is the tax object
        const taxLookup = allTaxes.reduce(
            (acc, curr) => ({ ...acc, [curr.tax_id]: curr }),
            {},
        );

        const wishlistsByAccount: Array<{
            account_id: number;
            wishlist: Wishlist[];
        }> = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const wishlistResults = await executeQuery(
                        wishlistQueries.getWishlistsMiddleware,
                        [account.account_id, to_date],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const wishlistTransactions = wishlistResults.map(
                        (wishlist) => {
                            const tax: QueryResultRow =
                                taxLookup[wishlist.tax_id] !== undefined
                                    ? taxLookup[wishlist.tax_id]
                                    : { tax_rate: 0 };

                            return {
                                ...wishlist,
                                tax_rate: parseFloat(tax.tax_rate),
                                amount: parseFloat(wishlist.wishlist_amount),
                                wishlist_amount: parseFloat(
                                    wishlist.wishlist_amount,
                                ),
                            };
                        },
                    );

                    wishlistsByAccount.push({
                        account_id: account.account_id,
                        wishlist: wishlistTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(
                wishlistQueries.getWishlistsMiddleware,
                [account_id, to_date],
            );

            // Map over results array and convert amount to a float for each Wishlist object
            const wishlistsTransactions = results.map((wishlist) => {
                const tax: QueryResultRow =
                    taxLookup[wishlist.tax_id] !== undefined
                        ? taxLookup[wishlist.tax_id]
                        : { tax_rate: 0 };

                return {
                    ...wishlist,
                    tax_rate: parseFloat(tax.tax_rate),
                    amount: parseFloat(wishlist.wishlist_amount),
                    wishlist_amount: parseFloat(wishlist.wishlist_amount),
                };
            });

            wishlistsByAccount.push({
                account_id: parseInt(account_id as string),
                wishlist: wishlistsTransactions,
            });
        }

        request.wishlists = wishlistsByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
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
export const getTransfersByAccount = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { account_id, to_date } = request.query as Record<string, string>;

    try {
        const transferByAccount: Array<{
            account_id: number;
            transfer: Transfer[];
        }> = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const transferResults = await executeQuery(
                        transferQueries.getTransfersMiddleware,
                        [account.account_id, to_date],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const transferTransactions = transferResults.map(
                        (transfer) => ({
                            ...transfer,
                            amount: parseFloat(transfer.transfer_amount),
                        }),
                    );

                    transferByAccount.push({
                        account_id: account.account_id,
                        transfer: transferTransactions,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(
                transferQueries.getTransfersMiddleware,
                [account_id, to_date],
            );

            // Map over results array and convert amount to a float for each Transfer object
            const transferTransactions = results.map((transfer) => ({
                ...transfer,
                amount: parseFloat(transfer.transfer_amount),
            }));

            transferByAccount.push({
                account_id: parseInt(account_id),
                transfer: transferTransactions,
            });
        }

        request.transfers = transferByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfers');
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
    const { account_id } = request.query as Record<string, string>;

    try {
        const commuteExpensesByAccount: Array<{
            account_id: number;
            commute_expenses: object;
            fare_capping: object;
        }> = [];

        if (!account_id) {
            // If account_id is null, fetch all accounts and make request.transactions an array of transactions
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            await Promise.all(
                accountResults.map(async (account) => {
                    const commuteExpensesResults = await executeQuery(
                        commuteScheduleQueries.getCommuteSchedulesByAccountId,
                        [account.account_id],
                    );

                    // Map over results array and convert amount to a float for each Transaction object
                    const commuteExpensesTransactions =
                        commuteExpensesResults.map((commute_expense) => ({
                            ...commute_expense,
                            fare_amount: parseFloat(
                                commute_expense.fare_amount,
                            ),
                        }));

                    const fareCappingResults = await executeQuery(
                        fareCappingQueries.getFareCapping,
                        [account.account_id],
                    );

                    const fareCapping = fareCappingResults.map(
                        (fare_capping) => ({
                            ...fare_capping,
                            fare_cap: parseFloat(fare_capping.fare_cap),
                            current_spent: parseFloat(
                                fare_capping.current_spent,
                            ),
                            fare_cap_duration: parseInt(
                                fare_capping.fare_cap_duration,
                            ),
                        }),
                    );

                    commuteExpensesByAccount.push({
                        account_id: account.account_id,
                        commute_expenses: commuteExpensesTransactions,
                        fare_capping: fareCapping,
                    });
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(
                commuteScheduleQueries.getCommuteSchedulesByAccountId,
                [account_id],
            );

            // Map over results array and convert amount to a float for each Commute Expense object
            const commuteExpensesTransactions = results.map(
                (commute_expense) => ({
                    ...commute_expense,
                    fare_amount: parseFloat(commute_expense.fare_amount),
                }),
            );

            const fareCappingResults = await executeQuery(
                fareCappingQueries.getFareCapping,
                [account_id],
            );

            const fareCapping = fareCappingResults.map((fare_capping) => ({
                ...fare_capping,
                fare_cap: parseFloat(fare_capping.fare_cap),
                current_spent: parseFloat(fare_capping.current_spent),
                fare_cap_duration: parseInt(fare_capping.fare_cap_duration),
            }));

            commuteExpensesByAccount.push({
                account_id: parseInt(account_id),
                commute_expenses: commuteExpensesTransactions,
                fare_capping: fareCapping,
            });
        }

        request.commuteExpenses = commuteExpensesByAccount;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting commute expenses');
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
    const { account_id } = request.query as { account_id: string };

    try {
        let currentBalance: Array<{
            account_id: number;
            account_balance: number;
        }> = [];

        if (!account_id) {
            const accountResults = await executeQuery(
                accountQueries.getAccounts,
            );

            currentBalance = await Promise.all(
                accountResults.map(async (account) => {
                    const currentBalanceResults = await executeQuery(
                        currentBalanceQueries.getCurrentBalance,
                        [account.account_id],
                    );

                    return {
                        account_id: account.account_id,
                        account_balance: parseFloat(
                            currentBalanceResults[0].account_balance,
                        ),
                    };
                }),
            );
        } else {
            // Check if account exists and if it doesn't, send a response with an error message
            const accountExists = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (accountExists.length === 0) {
                response
                    .status(404)
                    .send(`Account with ID ${account_id} not found`);
                return;
            }

            const results = await executeQuery(
                currentBalanceQueries.getCurrentBalance,
                [account_id],
            );

            currentBalance = [
                {
                    account_id: parseInt(account_id),
                    account_balance: parseFloat(results[0].account_balance),
                },
            ];
        }

        request.currentBalance = currentBalance;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
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
export const updateWishlistCron = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // Get all wishlists
        const wishlistsResults = await executeQuery(
            wishlistQueries.getAllWishlists,
            [],
        );

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        // First, delete all necessary cron jobs
        for (const wslst of wishlistsResults) {
            const cronId = wslst.cron_job_id;
            const results = await executeQuery(cronJobQueries.getCronJob, [
                cronId,
            ]);

            if (results.length > 0) {
                await unscheduleQuery(results[0].unique_id);
            } else {
                logger.error('Cron job not found');
            }
        }

        // Then, schedule all necessary cron jobs
        for (const wslst of wishlistsResults) {
            const cronId = wslst.cron_job_id;
            const taxId = wslst.tax_id;

            // Get tax amount from tax_id in taxes table
            const taxRate: number =
                taxId !== null && taxId !== undefined
                    ? (await executeQuery(taxesQueries.getTax, [taxId]))[0]
                          .tax_rate
                    : 0;

            const jobDetails = {
                date: transactionMap[wslst.wishlist_id],
            };

            if (jobDetails.date !== null && jobDetails.date !== undefined) {
                const cronDate = determineCronValues(
                    jobDetails as { date: string },
                );

                const unique_id = `wishlist-${wslst.wishlist_id}`;

                await scheduleQuery(
                    unique_id,
                    cronDate,
                    `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${
                        wslst.account_id
                    }, ${-wslst.wishlist_amount}, ${taxRate}, '${
                        wslst.wishlist_title
                    }', '${wslst.wishlist_description}')`,
                );

                await executeQuery(cronJobQueries.updateCronJob, [
                    unique_id,
                    cronDate,
                    cronId,
                ]);
            }
        }

        // Move on to the next middleware or route handler
        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
    }
};
