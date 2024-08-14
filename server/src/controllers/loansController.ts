import { type NextFunction, type Request, type Response } from 'express';
import { loanQueries, cronJobQueries } from '../models/queryData.js';
import {
    handleError,
    parseIntOrFallback,
    nextTransactionFrequencyDate,
} from '../utils/helperFunctions.js';
import { type Loan } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import dayjs, { Dayjs } from 'dayjs';
import pool from '../config/db.js';

/**
 *
 * @param loan - Loan object
 * @returns - Loan object with parsed values
 */
const parseLoan = (loan: Record<string, string>): Loan => ({
    id: parseInt(loan.loan_id),
    accountId: parseInt(loan.account_id),
    amount: parseFloat(loan.loan_amount),
    planAmount: parseFloat(loan.loan_plan_amount),
    recipient: loan.loan_recipient,
    title: loan.loan_title,
    description: loan.loan_description,
    frequencyType: parseInt(loan.frequency_type),
    frequencyTypeVariable: parseInt(loan.frequency_type_variable),
    frequencyDayOfMonth: parseIntOrFallback(loan.frequency_day_of_month),
    frequencyDayOfWeek: parseIntOrFallback(loan.frequency_day_of_week),
    frequencyWeekOfMonth: parseIntOrFallback(loan.frequency_week_of_month),
    frequencyMonthOfYear: parseIntOrFallback(loan.frequency_month_of_year),
    interestRate: parseFloat(loan.loan_interest_rate),
    interestFrequencyType: parseInt(loan.loan_interest_frequency_type),
    subsidized: parseFloat(loan.loan_subsidized),
    fullyPaidBack: loan.loan_fully_paid_back,
    beginDate: loan.loan_begin_date,
    endDate: loan.loan_end_date ?? null,
    dateCreated: loan.date_created,
    dateModified: loan.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all loans
 */
export const getLoans = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && accountId) {
            query = loanQueries.getLoansByIdAndAccountId;
            params = [id, accountId];
        } else if (id) {
            query = loanQueries.getLoansById;
            params = [id];
        } else if (accountId) {
            query = loanQueries.getLoansByAccountId;
            params = [accountId];
        } else {
            query = loanQueries.getAllLoans;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const loans: Loan[] = rows.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);

            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fullyPaidBack = request.fullyPaidBackDates[
                parseInt(loan.loan_id)
            ]
                ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                : null;

            return parsedLoan;
        });

        loans.map((loan: Loan) => {
            const nextExpenseDate = nextTransactionFrequencyDate(loan);

            loan.nextDate = nextExpenseDate;
        });

        response.status(200).json(loans);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id ? 'loan' : accountId ? 'loans for given account id' : 'loans'
            }`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to create a new loan
 */
export const createLoan = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const {
        accountId,
        amount,
        planAmount,
        recipient,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        interestRate,
        interestFrequencyType,
        subsidized,
        beginDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows: loanResults } = await client.query(
            loanQueries.createLoan,
            [
                accountId,
                amount,
                planAmount,
                recipient,
                title,
                description,
                frequencyType,
                frequencyTypeVariable,
                frequencyDayOfMonth,
                frequencyDayOfWeek,
                frequencyWeekOfMonth,
                frequencyMonthOfYear,
                interestRate,
                interestFrequencyType,
                subsidized,
                beginDate,
            ],
        );

        const loans: Loan[] = loanResults.map((loan) => parseLoan(loan));

        const jobDetails = {
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            date: beginDate,
        };

        const cronDate = determineCronValues(jobDetails);

        const taxRate = 0;

        const uniqueId = `loan-${loans[0].id}`;

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${accountId}, ${
                -parseFloat(planAmount) +
                parseFloat(planAmount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: cronIdResult } = await client.query(
            cronJobQueries.createCronJob,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResult[0].cron_job_id;

        const nextDate: Dayjs = dayjs(beginDate);

        if (parseInt(interestFrequencyType) === 0) {
            // Daily
            nextDate.add(1, 'day');
        } else if (parseInt(interestFrequencyType) === 1) {
            // Weekly
            nextDate.add(1, 'week');
        } else if (parseInt(interestFrequencyType) === 2) {
            // Monthly
            nextDate.add(1, 'month');
        } else if (parseInt(interestFrequencyType) === 3) {
            // Yearly
            nextDate.add(1, 'year');
        }

        const jobDetailsInterest = {
            frequency_type: interestFrequencyType,
            date: beginDate,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        const interestUniqueId = `loan_interest-${loans[0].id}`;

        await client.query(`
            SELECT cron.schedule('${interestUniqueId}', '${cronDateInterest}',
            $$UPDATE loans SET loan_amount = loan_amount + (loan_amount * ${interestRate}) WHERE loan_id = ${loans[0].id}$$)`);

        const { rows: interestCronIdResult } = await client.query(
            cronJobQueries.createCronJob,
            [interestUniqueId, cronDateInterest],
        );

        const interestCronId: number = interestCronIdResult[0].cron_job_id;

        await client.query(loanQueries.updateLoanWithCronJobId, [
            cronId,
            interestCronId,
            loans[0].id,
        ]);

        await client.query('COMMIT;');

        request.loanId = loans[0].id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created loan
 */
export const createLoanReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { loanId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows: loans } = await client.query(loanQueries.getLoansById, [
            loanId,
        ]);

        const modifiedLoans: Loan[] = loans.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);
            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fullyPaidBack = request.fullyPaidBackDates[
                parseInt(loan.loan_id)
            ]
                ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                : null;

            return parsedLoan;
        });

        response.status(201).json(modifiedLoans);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a loan
 */
export const updateLoan = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const {
        accountId,
        amount,
        planAmount,
        recipient,
        title,
        description,
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        interestRate,
        interestFrequencyType,
        subsidized,
        beginDate,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(loanQueries.getLoansById, [id]);

        if (rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);
        const interestCronId: number = parseInt(rows[0].interest_cron_job_id);

        const jobDetails = {
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            date: beginDate,
        };

        const cronDate = determineCronValues(jobDetails);

        const { rows: uniqueIdResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        const uniqueId = uniqueIdResults[0].unique_id;

        const taxRate = 0;

        await client.query('BEGIN;');

        await client.query(`SELECT cron.unschedule('${uniqueId}')`);

        await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${accountId}, ${
                -parseFloat(planAmount) +
                parseFloat(planAmount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')$$)`);

        const { rows: interestUniqueIdResults } = await client.query(
            cronJobQueries.getCronJob,
            [interestCronId],
        );

        const interestUniqueId = interestUniqueIdResults[0].interestUniqueId;

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        const modifiedLoan: Loan[] = rows.map((loan: Record<string, string>) =>
            parseLoan(loan),
        );

        modifiedLoan.map((loan: Loan) => {
            const nextLoanDate = nextTransactionFrequencyDate(loan);

            loan.nextDate = nextLoanDate;
        });

        const jobDetailsInterest = {
            frequencyType: interestFrequencyType,
            date: beginDate,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        await client.query(`SELECT cron.unschedule('${interestUniqueId}')`);

        await client.query(`
            SELECT cron.schedule('${interestUniqueId}', '${cronDateInterest}',
            $$UPDATE loans SET loan_amount = loan_amount + (loan_amount * ${interestRate}) WHERE loan_id = ${id}$$)`);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDateInterest,
            interestCronId,
        ]);

        await client.query(loanQueries.updateLoan, [
            accountId,
            amount,
            planAmount,
            recipient,
            title,
            description,
            frequencyType,
            frequencyTypeVariable,
            frequencyDayOfMonth,
            frequencyDayOfWeek,
            frequencyWeekOfMonth,
            frequencyMonthOfYear,
            interestRate,
            interestFrequencyType,
            subsidized,
            beginDate,
            id,
        ]);

        await client.query('COMMIT;');

        request.loanId = id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated loan
 */
export const updateLoanReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { loanId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(loanQueries.getLoansById, [loanId]);

        const modifiedLoans: Loan[] = rows.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);

            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fullyPaidBack = request.fullyPaidBackDates[
                parseInt(loan.loan_id)
            ]
                ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                : null;

            return parsedLoan;
        });

        response.status(200).json(modifiedLoans);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a DELETE request to the database to delete a loan
 */
export const deleteLoan = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(loanQueries.getLoansById, [id]);

        if (rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

        await client.query('BEGIN;');

        await client.query(loanQueries.deleteLoan, [id]);

        const { rows: results } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        await client.query(`SELECT cron.unschedule('${results[0].unique_id}')`);

        const interestCronId: number = parseInt(rows[0].interest_cron_job_id);
        const { rows: interestResults } = await client.query(
            cronJobQueries.getCronJob,
            [interestCronId],
        );

        await client.query(
            `SELECT cron.unschedule('${interestResults[0].unique_id}')`,
        );

        await client.query(cronJobQueries.deleteCronJob, [cronId]);
        await client.query(cronJobQueries.deleteCronJob, [interestCronId]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting loan');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the deleted loan
 */
export const deleteLoanReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Loan deleted successfully');
};
