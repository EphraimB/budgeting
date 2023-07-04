import { Request, Response } from 'express';
import { loanQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../bree/jobs/scheduleCronJob.js';
import deleteCronJob from '../bree/jobs/deleteCronJob.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface LoanInput {
    account_id: string;
    loan_id: string;
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
    loan_begin_date: string;
    loan_end_date: string;
    date_created: string;
    date_modified: string;
}

interface LoanOutput {
    loan_id: number;
    account_id: number;
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
    frequency_month_of_year: number;
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
const parseLoan = (loan: LoanInput): LoanOutput => ({
    loan_id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    loan_amount: parseFloat(loan.loan_amount),
    loan_plan_amount: parseFloat(loan.loan_plan_amount),
    loan_recipient: loan.loan_recipient,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    frequency_type: loan.frequency_type,
    frequency_type_variable: parseInt(loan.frequency_type_variable),
    frequency_day_of_month: parseInt(loan.frequency_day_of_month),
    frequency_day_of_week: parseInt(loan.frequency_day_of_week),
    frequency_week_of_month: parseInt(loan.frequency_week_of_month),
    frequency_month_of_year: parseInt(loan.frequency_month_of_year),
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date,
    date_created: loan.date_created,
    date_modified: loan.date_modified
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all loans
 */
export const getLoans = async (request: Request, response: Response) => {
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

        const rows: LoanInput[] = await executeQuery(query, params);

        if ((id || account_id) && rows.length === 0) {
            return response.status(404).send('Loan not found');
        }

        const loans: LoanOutput[] = rows.map(loan => parseLoan(loan));
        response.status(200).json(loans);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'loan' : (account_id ? 'loans for given account_id' : 'loans')}`);
    }
};

// Create loan
export const createLoan = async (request, response) => {
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
        begin_date
    } = request.body;

    const negativePlanAmount = -plan_amount;

    const { cronDate, uniqueId } = await scheduleCronJob({
        begin_date,
        account_id,
        negativePlanAmount,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year
    });

    try {
        const cronJobResults = await executeQuery(cronJobQueries.createCronJob, [uniqueId, cronDate]);
        const cronId = cronJobResults[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        const loanResults = await executeQuery(
            loanQueries.createLoan,
            [
                account_id,
                cronId,
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
                begin_date
            ]
        );

        const loans = loanResults.map(loan => parseLoan(loan));
        response.status(201).json(loans);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, error.message.includes('cron job') ? 'Error creating cron job' : 'Error creating loan');
    }
};

// Update loan
export const updateLoan = async (request, response) => {
    const { id } = request.params;

    try {
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
            begin_date
        } = request.body;

        const negativePlanAmount = -plan_amount;

        const getLoanResults = await executeQuery(loanQueries.getLoan, [id]);

        if (getLoanResults.length === 0) {
            return response.status(404).send('Loan not found');
        }

        const cronId = getLoanResults[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = await scheduleCronJob({
            begin_date,
            account_id,
            negativePlanAmount,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year
        });

        await executeQuery(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);
        const updateLoanResults = await executeQuery(loanQueries.updateLoan, [
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
            begin_date,
            id
        ]);

        // Parse the data to the correct format and return an object
        const loans = updateLoanResults.map(loan => parseLoan(loan));
        response.status(200).json(loans);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating loan');
    }
};

// Delete loan
export const deleteLoan = async (request, response) => {
    try {
        const { id } = request.params;

        const getLoanResults = await executeQuery(loanQueries.getLoan, [id]);

        if (getLoanResults.length === 0) {
            return response.status(404).send('Loan not found');
        }

        const cronId = getLoanResults[0].cron_job_id;
        await executeQuery(loanQueries.deleteLoan, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send('Loan deleted successfully');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting loan');
    }
};
