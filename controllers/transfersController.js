import { transferQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../bree/jobs/scheduleCronJob.js';
import deleteCronJob from '../bree/jobs/deleteCronJob.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const transfersParse = transfer => ({
    transfer_id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    frequency_type: transfer.frequency_type,
    frequency_type_variable: transfer.frequency_type_variable,
    frequency_day_of_month: transfer.frequency_day_of_month,
    frequency_day_of_week: transfer.frequency_day_of_week,
    frequency_week_of_month: transfer.frequency_week_of_month,
    frequency_month_of_year: transfer.frequency_month_of_year,
    date_created: transfer.date_created,
    date_modified: transfer.date_modified
});

// Get transfers
export const getTransfers = async (request, response) => {
    const { account_id, id } = request.query;

    try {
        let query;
        let params;

        if (id && account_id) {
            query = transferQueries.getTransfersByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = transferQueries.getTransfersById;
            params = [id];
        } else if (account_id) {
            query = transferQueries.getTransfersByAccountId;
            params = [account_id];
        } else {
            query = transferQueries.getAllTransfers;
            params = [];
        }

        const results = await executeQuery(query, params);

        if ((id || account_id) && results.length === 0) {
            return response.status(404).send('Transfer not found');
        }

        // Parse the data to the correct format
        const transfers = results.map(transfersParse);

        response.status(200).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'transfer' : (account_id ? 'transfers for given account_id' : 'transfers')}`);
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

        const { cronDate, uniqueId } = await scheduleCronJob({
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
        });

        const cronJobResult = await executeQuery(cronJobQueries.createCronJob, [uniqueId, cronDate]);

        const cronId = cronJobResult[0].cron_job_id;

        console.log('Cron job created ' + cronId);

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

        response.status(201).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
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

        const transferResults = await executeQuery(transferQueries.getTransfer, [id]);

        if (transferResults.length === 0) {
            return response.status(404).send('Transfer not found');
        }

        const cronId = transferResults[0].cron_job_id;
        await deleteCronJob(cronId);

        const { cronDate, uniqueId } = await scheduleCronJob({
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
        });

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

        response.status(200).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating transfer');
    }
};

// Delete transfer
export const deleteTransfer = async (request, response) => {
    try {
        const { id } = request.params;

        const transferResults = await executeQuery(transferQueries.getTransfer, [id]);

        if (transferResults.length === 0) {
            return response.status(404).send('Transfer not found');
        }

        const cronId = transferResults[0].cron_job_id;

        await executeQuery(transferQueries.deleteTransfer, [id]);

        await deleteCronJob(cronId);
        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        response.status(200).send('Transfer deleted successfully');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    }
};
