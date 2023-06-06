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
export const getTransfers = async (request, response) => {
    try {
        const { account_id, id } = request.query;

        const query = id ? transferQueries.getTransfer : transferQueries.getTransfers;
        const queryArgs = id ? [account_id, id] : [account_id];

        const results = await executeQuery(query, queryArgs);

        // Parse the data to the correct format
        const transfers = results.map(transfersParse);

        response.status(200).json(transfers);
    } catch (error) {
        handleError(response, 'Error getting transfers');
    }
};

// Create transfer
export const createTransfer = async (request, response) => {
    try {
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

        const { cronDate, uniqueId } = await scheduleCronJob(
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

        const cronJobResult = await executeQuery(cronJobQueries.createCronJob, [uniqueId, cronDate]);

        const cronId = cronJobResult[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        const transferResult = await executeQuery(transferQueries.createTransfer, [
            cronId, 
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
        ]);

        // Parse the data to correct format and return an object
        const transfers = transferResult.map(transfersParse);

        response.status(201).send(transfers);
    } catch (error) {
        handleError(response, 'Error creating transfer');
    }
};

// Update transfer
export const updateTransfer = async (request, response) => {
    try {
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

        const transferResults = await executeQuery(transferQueries.getTransfer, [source_account_id, id]);

        if (transferResults.length === 0) {
            return response.status(200).send([]);
        }

        const cronId = transferResults[0].cron_job_id;
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

        await executeQuery(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);

        const updateResults = await executeQuery(transferQueries.updateTransfer, [
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
        const transfers = updateResults.map(transfersParse);

        response.status(200).send(transfers);
    } catch (error) {
        handleError(response, 'Error updating transfer');
    }
};

// Delete transfer
export const deleteTransfer = async (request, response) => {
    try {
        const { account_id } = request.query;
        const { id } = request.params;

        const transferResults = await executeQuery(transferQueries.getTransfer, [account_id, id]);

        if (transferResults.length > 0) {
            const cronId = transferResults[0].cron_job_id;

            await executeQuery(transferQueries.deleteTransfer, [id]);

            if (cronId) {
                await deleteCronJob(cronId);
                await executeQuery(cronJobQueries.deleteCronJob, [cronId]);
            }

            response.status(200).send("Transfer deleted successfully");
        } else {
            response.status(200).send("Transfer doesn't exist");
        }
    } catch (error) {
        handleError(response, "Error deleting transfer");
    }
};