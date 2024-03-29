import { type NextFunction, type Request, type Response } from 'express';
import { loanQueries, cronJobQueries } from '../models/queryData.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
    nextTransactionFrequencyDate,
    scheduleQuery,
    unscheduleQuery,
} from '../utils/helperFunctions.js';
import { type Loan } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import dayjs, { Dayjs } from 'dayjs';

/**
 *
 * @param loan - Loan object
 * @returns - Loan object with parsed values
 */
const parseLoan = (loan: Record<string, string>): Loan => ({
    id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    amount: parseFloat(loan.loan_amount),
    plan_amount: parseFloat(loan.loan_plan_amount),
    recipient: loan.loan_recipient,
    title: loan.loan_title,
    description: loan.loan_description,
    frequency_type: parseInt(loan.frequency_type),
    frequency_type_variable: parseInt(loan.frequency_type_variable),
    frequency_day_of_month: parseIntOrFallback(loan.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(loan.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(loan.frequency_week_of_month),
    frequency_month_of_year: parseIntOrFallback(loan.frequency_month_of_year),
    interest_rate: parseFloat(loan.loan_interest_rate),
    interest_frequency_type: parseInt(loan.loan_interest_frequency_type),
    subsidized: parseFloat(loan.loan_subsidized),
    fully_paid_back: loan.loan_fully_paid_back,
    begin_date: loan.loan_begin_date,
    end_date: loan.loan_end_date ?? null,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
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
    const { account_id, id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = loanQueries.getLoansByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = loanQueries.getLoansById;
            params = [id];
        } else if (account_id) {
            query = loanQueries.getLoansByAccountId;
            params = [account_id];
        } else {
            query = loanQueries.getAllLoans;
            params = [];
        }

        const rows = await executeQuery(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const loans: Loan[] = rows.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);

            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fully_paid_back = request.fullyPaidBackDates[
                parseInt(loan.loan_id)
            ]
                ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                : null;

            return parsedLoan;
        });

        loans.map((loan: Loan) => {
            const nextExpenseDate = nextTransactionFrequencyDate(loan);

            loan.next_date = nextExpenseDate;
        });

        response.status(200).json(loans);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'loan'
                    : account_id
                    ? 'loans for given account_id'
                    : 'loans'
            }`,
        );
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
        account_id,
        amount,
        plan_amount,
        recipient,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        interest_rate,
        interest_frequency_type,
        subsidized,
        begin_date,
    } = request.body;

    try {
        const loanResults = await executeQuery(loanQueries.createLoan, [
            account_id,
            amount,
            plan_amount,
            recipient,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            interest_rate,
            interest_frequency_type,
            subsidized,
            begin_date,
        ]);

        const loans: Loan[] = loanResults.map((loan) => parseLoan(loan));

        const jobDetails = {
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            date: begin_date,
        };

        const cronDate = determineCronValues(jobDetails);

        const taxRate = 0;

        const unique_id = `loan-${loans[0].id}`;

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${
                -parseFloat(plan_amount) +
                parseFloat(plan_amount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')`,
        );

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                unique_id,
                cronDate,
            ])
        )[0].cron_job_id;

        const nextDate: Dayjs = dayjs(begin_date);

        if (parseInt(interest_frequency_type) === 0) {
            // Daily
            nextDate.add(1, 'day');
        } else if (parseInt(interest_frequency_type) === 1) {
            // Weekly
            nextDate.add(1, 'week');
        } else if (parseInt(interest_frequency_type) === 2) {
            // Monthly
            nextDate.add(1, 'month');
        } else if (parseInt(interest_frequency_type) === 3) {
            // Yearly
            nextDate.add(1, 'year');
        }

        const jobDetailsInterest = {
            frequency_type: interest_frequency_type,
            date: begin_date,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        const interest_unique_id = `loan_interest-${loans[0].id}`;

        await scheduleQuery(
            interest_unique_id,
            cronDateInterest,
            `UPDATE loans SET loan_amount = loan_amount + (loan_amount * ${interest_rate}) WHERE loan_id = ${loans[0].id}`,
        );

        const interestCronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                interest_unique_id,
                cronDateInterest,
            ])
        )[0].cron_job_id;

        await executeQuery(loanQueries.updateLoanWithCronJobId, [
            cronId,
            interestCronId,
            loans[0].id,
        ]);

        request.loan_id = loans[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating loan');
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
    const { loan_id } = request;

    try {
        const loans = await executeQuery(loanQueries.getLoansById, [loan_id]);

        const modifiedLoans: Loan[] = loans.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);
            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fully_paid_back = request.fullyPaidBackDates[
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
        account_id,
        amount,
        plan_amount,
        recipient,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        interest_rate,
        interest_frequency_type,
        subsidized,
        begin_date,
    } = request.body;

    try {
        const getLoanResults = await executeQuery(loanQueries.getLoansById, [
            id,
        ]);

        if (getLoanResults.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(getLoanResults[0].cron_job_id);
        const interestCronId: number = parseInt(
            getLoanResults[0].interest_cron_job_id,
        );

        const jobDetails = {
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            date: begin_date,
        };

        const cronDate = determineCronValues(jobDetails);

        const [{ unique_id }] = await executeQuery(cronJobQueries.getCronJob, [
            cronId,
        ]);

        const taxRate = 0;

        await unscheduleQuery(unique_id);

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${account_id}, ${
                -parseFloat(plan_amount) +
                parseFloat(plan_amount) * parseFloat(subsidized)
            }, ${taxRate}, '${title}', '${description}')`,
        );

        const [{ unique_id: interestUniqueId }] = await executeQuery(
            cronJobQueries.getCronJob,
            [interestCronId],
        );

        await executeQuery(cronJobQueries.updateCronJob, [
            unique_id,
            cronDate,
            cronId,
        ]);

        const modifiedLoan: Loan[] = getLoanResults.map(
            (loan: Record<string, string>) => parseLoan(loan),
        );

        modifiedLoan.map((loan: Loan) => {
            const nextLoanDate = nextTransactionFrequencyDate(loan);

            loan.next_date = nextLoanDate;
        });

        const jobDetailsInterest = {
            frequency_type: interest_frequency_type,
            date: begin_date,
        };

        const cronDateInterest = determineCronValues(jobDetailsInterest);

        await unscheduleQuery(interestUniqueId);

        await scheduleQuery(
            interestUniqueId,
            cronDateInterest,
            `UPDATE loans SET loan_amount = loan_amount + (loan_amount * ${interest_rate}) WHERE loan_id = ${id}`,
        );

        await executeQuery(cronJobQueries.updateCronJob, [
            unique_id,
            cronDate,
            cronId,
        ]);

        await executeQuery(cronJobQueries.updateCronJob, [
            unique_id,
            cronDateInterest,
            interestCronId,
        ]);

        await executeQuery(loanQueries.updateLoan, [
            account_id,
            amount,
            plan_amount,
            recipient,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            interest_rate,
            interest_frequency_type,
            subsidized,
            begin_date,
            id,
        ]);

        request.loan_id = id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating loan');
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
    const { loan_id } = request;

    try {
        const loans = await executeQuery(loanQueries.getLoansById, [loan_id]);

        const modifiedLoans: Loan[] = loans.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);

            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.fully_paid_back = request.fullyPaidBackDates[
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
    try {
        const { id } = request.params;

        const getLoanResults = await executeQuery(loanQueries.getLoansById, [
            id,
        ]);

        if (getLoanResults.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(getLoanResults[0].cron_job_id);

        await executeQuery(loanQueries.deleteLoan, [id]);

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        await unscheduleQuery(results[0].unique_id);

        const interestCronId: number = parseInt(
            getLoanResults[0].interest_cron_job_id,
        );
        const interestResults = await executeQuery(cronJobQueries.getCronJob, [
            interestCronId,
        ]);

        await unscheduleQuery(interestResults[0].unique_id);

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        await executeQuery(cronJobQueries.deleteCronJob, [interestCronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting loan');
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
