import { type NextFunction, type Request, type Response } from 'express';
import { loanQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';
import {
    handleError,
    executeQuery,
    parseOrFallback,
} from '../utils/helperFunctions.js';
import { type Loan } from '../types/types.js';

interface LoanInput {
    account_id: string;
    loan_id: string;
    cron_job_id?: string;
    interest_cron_job_id?: string;
    loan_amount: string;
    loan_plan_amount: string;
    loan_recipient: string;
    loan_title: string;
    loan_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
    loan_interest_rate: string;
    loan_interest_frequency_type: string;
    loan_subsidized: string;
    loan_fully_paid_back: string;
    loan_begin_date: string;
    loan_end_date: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param loan - Loan object
 * @returns - Loan object with parsed values
 */
const parseLoan = (loan: LoanInput): Loan => ({
    loan_id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    loan_amount: parseFloat(loan.loan_amount),
    loan_plan_amount: parseFloat(loan.loan_plan_amount),
    loan_recipient: loan.loan_recipient,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    frequency_type: parseInt(loan.frequency_type),
    frequency_type_variable: parseOrFallback(loan.frequency_type_variable),
    frequency_day_of_month: parseOrFallback(loan.frequency_day_of_month),
    frequency_day_of_week: parseOrFallback(loan.frequency_day_of_week),
    frequency_week_of_month: parseOrFallback(loan.frequency_week_of_month),
    frequency_month_of_year: parseOrFallback(loan.frequency_month_of_year),
    loan_interest_rate: parseFloat(loan.loan_interest_rate),
    loan_interest_frequency_type: parseInt(loan.loan_interest_frequency_type),
    loan_subsidized: parseFloat(loan.loan_subsidized),
    loan_fully_paid_back: loan.loan_fully_paid_back,
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date ?? null,
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

        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = loanQueries.getLoansByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = loanQueries.getLoansById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = loanQueries.getLoansByAccountId;
            params = [account_id];
        } else {
            query = loanQueries.getAllLoans;
            params = [];
        }

        const rows: LoanInput[] = await executeQuery(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            rows.length === 0
        ) {
            response.status(404).send('Loan not found');
            return;
        }

        const loans: Loan[] = rows.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);
            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.loan_fully_paid_back =
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== null &&
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== undefined
                    ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                    : null;

            return parsedLoan;
        });

        response.status(200).json(loans);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'loan'
                    : account_id !== null && account_id !== undefined
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
    } = request.body as Record<string, string>;

    try {
        const loanResults = await executeQuery<LoanInput>(
            loanQueries.createLoan,
            [
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
            ],
        );

        const loans: Loan[] = loanResults.map((loan) => parseLoan(loan));

        const cronParams: any = {
            date: begin_date,
            account_id,
            id: loans[0].loan_id,
            amount:
                -parseFloat(plan_amount) +
                parseFloat(plan_amount) * parseFloat(subsidized),
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/dist/scripts/createTransaction.sh',
            type: 'loan',
        };

        const nextDate: Date = new Date(begin_date);

        if (parseInt(interest_frequency_type) === 0) {
            // Daily
            nextDate.setDate(nextDate.getDate() + 1);
        } else if (parseInt(interest_frequency_type) === 1) {
            // Weekly
            nextDate.setDate(nextDate.getDate() + 7);
        } else if (parseInt(interest_frequency_type) === 2) {
            // Monthly
            nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (parseInt(interest_frequency_type) === 3) {
            // Yearly
            nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        const interestCronParams: any = {
            date: nextDate.toISOString(),
            account_id,
            id: loans[0].loan_id,
            amount: interest_rate,
            title: title + ' interest',
            description: description + ' interest',
            frequency_type: interest_frequency_type,
            frequency_type_variable: null,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            scriptPath: '/app/dist/scripts/applyInterest.sh',
            type: 'loan_interest',
        };

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                uniqueId,
                cronDate,
            ])
        )[0].cron_job_id;

        const { cronDate: interestCronDate, uniqueId: interestUniqueId } =
            await scheduleCronJob(interestCronParams);

        const interestCronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                interestUniqueId,
                interestCronDate,
            ])
        )[0].cron_job_id;

        console.log('Cron job created ' + cronId.toString());
        console.log('Interest cron job created ' + interestCronId.toString());

        await executeQuery(loanQueries.updateLoanWithCronJobId, [
            cronId,
            interestCronId,
            loans[0].loan_id,
        ]);

        request.loan_id = loans[0].loan_id;

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        const loans = await executeQuery<LoanInput>(loanQueries.getLoansById, [
            loan_id,
        ]);

        const modifiedLoans: Loan[] = loans.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);
            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.loan_fully_paid_back =
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== null &&
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== undefined
                    ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                    : null;

            return parsedLoan;
        });

        response.status(201).json(modifiedLoans);
    } catch (error) {
        console.error(error); // Log the error on the server side
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
    } = request.body as Record<string, string>;

    const cronParams = {
        date: begin_date,
        id,
        account_id,
        amount:
            -parseFloat(plan_amount) +
            parseFloat(plan_amount) * parseFloat(subsidized),
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        scriptPath: '/app/dist/scripts/createTransaction.sh',
        type: 'loan',
    };

    const nextDate: Date = new Date(begin_date);

    if (parseInt(interest_frequency_type) === 0) {
        // Daily
        nextDate.setDate(nextDate.getDate() + 1);
    } else if (parseInt(interest_frequency_type) === 1) {
        // Weekly
        nextDate.setDate(nextDate.getDate() + 7);
    } else if (parseInt(interest_frequency_type) === 2) {
        // Monthly
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (parseInt(interest_frequency_type) === 3) {
        // Yearly
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    const interestCronParams: any = {
        date: nextDate.toISOString(),
        account_id,
        id,
        amount: interest_rate,
        title: title + ' interest',
        description: description + ' interest',
        frequency_type: interest_frequency_type,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        scriptPath: '/app/dist/scripts/applyInterest.sh',
        type: 'loan_interest',
    };

    try {
        const getLoanResults = await executeQuery<LoanInput>(
            loanQueries.getLoansById,
            [id],
        );

        if (getLoanResults.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(getLoanResults[0].cron_job_id ?? '');
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            console.error('Cron job not found');
        }

        const interestCronId: number = parseInt(
            getLoanResults[0].interest_cron_job_id ?? '',
        );
        const interestResults = await executeQuery(cronJobQueries.getCronJob, [
            interestCronId,
        ]);

        if (interestResults.length > 0) {
            await deleteCronJob(interestResults[0].unique_id);
        } else {
            console.error('Interest cron job not found');
        }

        const { uniqueId, cronDate } = await scheduleCronJob(cronParams);

        console.log(uniqueId);

        await executeQuery(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        const { uniqueId: interestUniqueId, cronDate: interestCronDate } =
            await scheduleCronJob(interestCronParams);

        await executeQuery(cronJobQueries.updateCronJob, [
            interestUniqueId,
            interestCronDate,
            interestCronId,
        ]);
        await executeQuery<LoanInput>(loanQueries.updateLoan, [
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
        console.error(error); // Log the error on the server side
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
        const loans = await executeQuery<LoanInput>(loanQueries.getLoansById, [
            loan_id,
        ]);

        const modifiedLoans: Loan[] = loans.map((loan) => {
            // parse loan first
            const parsedLoan = parseLoan(loan);
            // then add fully_paid_back field in request.fullyPaidBackDates
            parsedLoan.loan_fully_paid_back =
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== null &&
                request.fullyPaidBackDates[parseInt(loan.loan_id)] !== undefined
                    ? request.fullyPaidBackDates[parseInt(loan.loan_id)]
                    : null;

            return parsedLoan;
        });

        response.status(200).json(modifiedLoans);
    } catch (error) {
        console.error(error); // Log the error on the server side
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

        const getLoanResults = await executeQuery<LoanInput>(
            loanQueries.getLoansById,
            [id],
        );

        if (getLoanResults.length === 0) {
            response.status(404).send('Loan not found');
            return;
        }

        const cronId: number = parseInt(getLoanResults[0].cron_job_id ?? '');
        await executeQuery(loanQueries.deleteLoan, [id]);

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            console.error('Cron job not found');
        }

        const interestCronId: number = parseInt(
            getLoanResults[0].interest_cron_job_id ?? '',
        );
        const interestResults = await executeQuery(cronJobQueries.getCronJob, [
            interestCronId,
        ]);

        if (interestResults.length > 0) {
            await deleteCronJob(interestResults[0].unique_id);
        } else {
            console.error('Interest cron job not found');
        }

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        await executeQuery(cronJobQueries.deleteCronJob, [interestCronId]);

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
