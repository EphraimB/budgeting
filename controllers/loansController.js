import { loanQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../bree/jobs/scheduleCronJob.js';
import deleteCronJob from '../bree/jobs/deleteCronJob.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const parseLoan = loan => ({
    loan_id: parseInt(loan.loan_id),
    account_id: parseInt(loan.account_id),
    loan_amount: parseFloat(loan.loan_amount),
    loan_plan_amount: parseFloat(loan.loan_plan_amount),
    loan_recipient: loan.loan_recipient,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    frequency_type: loan.frequency_type,
    frequency_type_variable: loan.frequency_type_variable,
    frequency_day_of_month: loan.frequency_day_of_month,
    frequency_day_of_week: loan.frequency_day_of_week,
    frequency_week_of_month: loan.frequency_week_of_month,
    frequency_month_of_year: loan.frequency_month_of_year,
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
});

// Get all loans
export const getLoans = async (request, response) => {
    const { id } = request.query;

    try {
        const query = id ? loanQueries.getLoan : loanQueries.getLoans;
        const queryParams = id ? [id] : [];
        const rows = await executeQuery(query, queryParams);

        if (id && rows.length === 0) {
            return response.status(404).send('Loan not found');
        }

        const loans = rows.map(loan => parseLoan(loan));
        response.status(200).json(loans);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'loan' : 'loans'}`);
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
        begin_date,
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
                begin_date,
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
            begin_date,
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
            id,
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
            return response.status(200).send("Loan doesn't exist");
        }

        const cronId = getLoanResults[0].cron_job_id;
        await executeQuery(loanQueries.deleteLoan, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Loan deleted successfully");
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting loan');
    }
};