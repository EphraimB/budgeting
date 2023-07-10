import { Request, Response } from 'express';
import { transferQueries, cronJobQueries } from '../models/queryData.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { Transfer } from '../types/types.js';

interface TransferInput {
    transfer_id: string;
    cron_job_id?: string;
    source_account_id: string;
    destination_account_id: string;
    transfer_amount: string;
    transfer_title: string;
    transfer_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
    transfer_begin_date: string;
    transfer_end_date: string;
    date_created: string;
    date_modified: string;
}

/**
 * 
 * @param transfer - The transfer object to parse
 * @returns The parsed transfer object
 */
const transfersParse = (transfer: TransferInput): Transfer => ({
    transfer_id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    frequency_type: parseInt(transfer.frequency_type),
    frequency_type_variable: parseInt(transfer.frequency_type_variable) || null,
    frequency_day_of_month: parseInt(transfer.frequency_day_of_month) || null,
    frequency_day_of_week: parseInt(transfer.frequency_day_of_week) || null,
    frequency_week_of_month: parseInt(transfer.frequency_week_of_month) || null,
    frequency_month_of_year: parseInt(transfer.frequency_month_of_year) || null,
    date_created: transfer.date_created,
    date_modified: transfer.date_modified
});

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * Sends a response with all transfers or a single transfer if an id is provided
 */
export const getTransfers = async (request: Request, response: Response): Promise<void> => {
    const { account_id, id } = request.query;

    try {
        let query: string;
        let params: any[];

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
            response.status(404).send('Transfer not found');
            return;
        }

        // Parse the data to the correct format
        const transfers = results.map(transfersParse);

        response.status(200).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'transfer' : (account_id ? 'transfers for given account_id' : 'transfers')}`);
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the newly created transfer
 */
export const createTransfer = async (request: Request, response: Response): Promise<void> => {
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

    try {
        const cronParams = {
            date: begin_date,
            account_id: source_account_id,
            destination_account_id,
            amount: -amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/dist/scripts/createTransaction.sh'
        };

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);
        const cronJobResult = await executeQuery(cronJobQueries.createCronJob, [uniqueId, cronDate]);

        const cronId: number = cronJobResult[0].cron_job_id;

        console.log('Cron job created ' + cronId);

        const transferResult = await executeQuery<TransferInput>(transferQueries.createTransfer, [
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
        const transfers: Transfer[] = transferResult.map(transfersParse);

        response.status(201).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the updated transfer
 */
export const updateTransfer = async (request: Request, response: Response): Promise<void> => {
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

    try {
        const cronParams = {
            date: begin_date,
            account_id: source_account_id,
            destination_account_id,
            amount: -amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/dist/scripts/createTransaction.sh'
        };

        const transferResults = await executeQuery(transferQueries.getTransfersById, [id]);

        if (transferResults.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        const cronId: number = parseInt(transferResults[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            console.error('Cron job not found');
        }

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

        await executeQuery(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);

        const updateResults = await executeQuery<TransferInput>(transferQueries.updateTransfer, [
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
        const transfers: Transfer[] = updateResults.map(transfersParse);

        response.status(200).json(transfers);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating transfer');
    }
};

/**
 * 
 * @param request - The request object
 * @param response - The response object
 * Sends a response with the deleted transfer
 */
export const deleteTransfer = async (request: Request, response: Response): Promise<void> => {
    try {
        const { id } = request.params;

        const transferResults = await executeQuery(transferQueries.getTransfersById, [id]);

        if (transferResults.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        await executeQuery(transferQueries.deleteTransfer, [id]);

        const cronId: number = parseInt(transferResults[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            console.error('Cron job not found');
        }

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        response.status(200).send('Transfer deleted successfully');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    }
};
