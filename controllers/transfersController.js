import pool from '../config/db.js';
import { transferQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../jobs/scheduleCronJob.js';
import deleteCronJob from '../jobs/deleteCronJob.js';

const transfersParse = transfer => ({
    transfer_id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    frequency_type: parseInt(transfer.frequency_type),
    frequency_type_variable: parseInt(transfer.frequency_type_variable),
    frequency_day_of_month: parseInt(transfer.frequency_day_of_month),
    frequency_day_of_week: parseInt(transfer.frequency_day_of_week),
    frequency_week_of_month: parseInt(transfer.frequency_week_of_month),
    frequency_month_of_year: parseInt(transfer.frequency_month_of_year),
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    date_created: transfer.date_created,
    date_updated: transfer.date_updated,
});

// Get transfers
export const getTransfers = (request, response) => {
    const { account_id, id } = request.query;
    const query = id ? transferQueries.getTransfer : transferQueries.getTransfers;
    const queryArgs = id ? [account_id, id] : [account_id];

    pool.query(query, queryArgs, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting transfers', param: null, location: 'query' } });
        }

        // Parse the data to the correct format
        const transfers = results.rows.map(transfer => transfersParse(transfer));

        response.status(200).json(transfers);
    });
};

// Create transfer
export const createTransfer = (request, response) => {
    const { source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    const negativeAmount = -amount;

    const { cronDate, uniqueId } = scheduleCronJob(begin_date, source_account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id);

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
        const cronId = results.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        pool.query(transferQueries.createTransfer, [cronId, source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating transfer", "param": null, "location": "query" } });
            }

            // Parse the data to correct format and return an object
            const transfers = results.rows.map(transfer => transfersParse(transfer));

            response.status(201).send(transfers);
        });
    });
};

// Update transfer
export const updateTransfer = async (request, response) => {
    const { id } = request.params;
    const {
        source_account_id,
        destination_account_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date
    } = request.body;

    const negativeAmount = -amount;

    try {
        // Check if the transfer exists
        const results = await pool.query(transferQueries.getTransfer, [source_account_id, id]);

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            await deleteCronJob(cronId);

            const { uniqueId, cronDate } = scheduleCronJob(
                begin_date,
                source_account_id,
                negativeAmount,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                destination_account_id
            );

            await pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);

            const transferResults = await pool.query(transferQueries.updateTransfer, [
                source_account_id,
                destination_account_id,
                amount,
                title,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                begin_date,
                end_date,
                id
            ]);

            // Parse the data to correct format and return an object
            const transfers = transferResults.rows.map(transfer => transfersParse(transfer));

            response.status(200).send(transfers);
        }
    } catch (error) {
        response.status(400).send({ errors: { msg: 'Error updating transfer', param: null, location: 'query' } });
    }
};

// Delete transfer
export const deleteTransfer = async (request, response) => {
    const { account_id } = request.query;
    const { id } = request.params;

    try {
        const transferResults = await pool.query(transferQueries.getTransfer, [account_id, id]);

        if (transferResults.rows.length > 0) {
            const cronId = transferResults.rows[0].cron_job_id;

            await pool.query(transferQueries.deleteTransfer, [id]);

            if (cronId) {
                await deleteCronJob(cronId);
                await pool.query(cronJobQueries.deleteCronJob, [cronId]);
            }

            response.status(200).send("Transfer deleted successfully");
        } else {
            response.status(200).send("Transfer doesn't exist");
        }
    } catch (error) {
        response.status(400).send({ errors: { msg: "Error deleting transfer", param: null, location: "query" } });
    }
};