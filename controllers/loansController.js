import pool from '../models/db.js';
import { loanQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../jobs/scheduleCronJob.js';
import deleteCronJob from '../jobs/deleteCronJob.js';

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
export const getLoans = (request, response) => {
    const { id } = request.query;

    const query = id ? loanQueries.getLoan : loanQueries.getLoans;
    const queryParams = id ? [id] : [];

    pool.query(query, queryParams, (error, results) => {
        if (error) {
            return response
                .status(400)
                .send({ errors: { msg: `Error getting ${id ? 'loan' : 'loans'}`, param: null, location: 'query' } });
        }

        // Parse the data to correct format and return an object
        const loans = results.rows.map(loan => parseLoan(loan));

        response.status(200).json(loans);
    });
};

// Create loan
export const createLoan = (request, response) => {
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

    const { cronDate, uniqueId } = scheduleCronJob(
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
    );

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, cronJobResults) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error creating cron job', param: null, location: 'query' } });
        }

        const cronId = cronJobResults.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        pool.query(
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
            ],
            (error, loanResults) => {
                if (error) {
                    return response.status(400).send({ errors: { msg: 'Error creating loan', param: null, location: 'query' } });
                }

                // Parse the data to the correct format and return an object
                const loans = loanResults.rows.map(loan => parseLoan(loan));

                response.status(201).send(loans);
            }
        );
    });
};

// Update loan
export const updateLoan = async (request, response) => {
    try {
        const { id } = request.params;
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

        const getLoanResults = await pool.query(loanQueries.getLoan, [id]);

        if (getLoanResults.rows.length === 0) {
            return response.status(200).send([]);
        }

        const cronId = getLoanResults.rows[0].cron_job_id;
        await deleteCronJob(cronId);

        const { uniqueId, cronDate } = scheduleCronJob(
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
        );

        await pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);
        const updateLoanResults = await pool.query(loanQueries.updateLoan, [
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
        const loans = updateLoanResults.rows.map(loan => parseLoan(loan));
        response.status(200).send(loans);
    } catch (error) {
        console.error(error);
        response.status(400).send({ errors: { msg: 'Error updating loan', param: null, location: 'query' } });
    }
};

// Delete loan
export const deleteLoan = async (request, response) => {
    try {
        const { id } = request.params;

        const getLoanResults = await pool.query(loanQueries.getLoan, [id]);

        if (getLoanResults.rows.length === 0) {
            return response.status(200).send("Loan doesn't exist");
        }

        const cronId = getLoanResults.rows[0].cron_job_id;
        await pool.query(loanQueries.deleteLoan, [id]);

        if (cronId) {
            await deleteCronJob(cronId);
            await pool.query(cronJobQueries.deleteCronJob, [cronId]);
        }

        response.status(200).send("Loan deleted successfully");
    } catch (error) {
        console.error(error);
        response.status(400).send({ errors: { msg: 'Error deleting loan', param: null, location: 'query' } });
    }
};