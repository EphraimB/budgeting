import { type NextFunction, type Request, type Response } from 'express';
import { transferQueries, cronJobQueries } from '../models/queryData.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
    scheduleQuery,
    unscheduleQuery,
} from '../utils/helperFunctions.js';
import { type Transfer } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';

/**
 *
 * @param transfer - The transfer object to parse
 * @returns The parsed transfer object
 */
const transfersParse = (transfer: Record<string, string>): Transfer => ({
    id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date ?? null,
    frequency_type: parseInt(transfer.frequency_type),
    frequency_type_variable: parseIntOrFallback(
        transfer.frequency_type_variable,
    ),
    frequency_day_of_month: parseIntOrFallback(transfer.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(transfer.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(
        transfer.frequency_week_of_month,
    ),
    frequency_month_of_year: parseIntOrFallback(
        transfer.frequency_month_of_year,
    ),
    date_created: transfer.date_created,
    date_modified: transfer.date_modified,
});

/**
 *
 * @param request - The request object
 * @param response - The response object
 * Sends a response with all transfers or a single transfer if an id is provided
 */
export const getTransfers = async (
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
            query = transferQueries.getTransfersByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = transferQueries.getTransfersById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = transferQueries.getTransfersByAccountId;
            params = [account_id];
        } else {
            query = transferQueries.getAllTransfers;
            params = [];
        }

        const results = await executeQuery(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            results.length === 0
        ) {
            response.status(404).send('Transfer not found');
            return;
        }

        // Parse the data to the correct format
        const transfers = results.map(transfersParse);

        response.status(200).json(transfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'transfer'
                    : account_id !== null && account_id !== undefined
                    ? 'transfers for given account_id'
                    : 'transfers'
            }`,
        );
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the newly created transfer
 */
export const createTransfer = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
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
        end_date,
    } = request.body;

    try {
        const transferResult = await executeQuery(
            transferQueries.createTransfer,
            [
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
            ],
        );

        // Parse the data to correct format and return an object
        const transfers: Transfer[] = transferResult.map(transfersParse);

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

        const unique_id = `transfer-${transfers[0].id}`;

        await scheduleQuery(
            unique_id,
            cronDate,
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${source_account_id}, ${-amount}, ${taxRate}, '${title}', '${description}')`,
        );

        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                unique_id,
                cronDate,
            ])
        )[0].cron_job_id;

        await executeQuery(transferQueries.updateTransferWithCronJobId, [
            cronId,
            transfers[0].id,
        ]);

        request.transfer_id = transfers[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created transfer
 */
export const createTransferReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { transfer_id } = request;

    try {
        const transfer = await executeQuery(transferQueries.getTransfersById, [
            transfer_id,
        ]);

        const modifiedTransfers = transfer.map(transfersParse);

        response.status(201).json(modifiedTransfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the updated transfer
 */
export const updateTransfer = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id: number = parseInt(request.params.id);
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
        end_date,
    } = request.body;

    try {
        const transferResults = await executeQuery(
            transferQueries.getTransfersById,
            [id],
        );

        if (transferResults.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        const cronId: number = parseInt(transferResults[0].cron_job_id);

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
            `INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${source_account_id}, ${-amount}, ${taxRate}, '${title}', '${description}')`,
        );

        await executeQuery(cronJobQueries.updateCronJob, [
            unique_id,
            cronDate,
            cronId,
        ]);

        await executeQuery(transferQueries.updateTransfer, [
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
            id,
        ]);

        request.transfer_id = id;

        next();

        // response.status(200).json(transfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating transfer');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated transfer
 */
export const updateTransferReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { transfer_id } = request;

    try {
        const transfers = await executeQuery(transferQueries.getTransfersById, [
            transfer_id,
        ]);

        const modifiedTransfers = transfers.map(transfersParse);

        response.status(200).json(modifiedTransfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfer');
    }
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Sends a response with the deleted transfer
 */
export const deleteTransfer = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { id } = request.params;

        const transferResults = await executeQuery(
            transferQueries.getTransfersById,
            [id],
        );

        if (transferResults.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        await executeQuery(transferQueries.deleteTransfer, [id]);

        const cronId: number = parseInt(transferResults[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        await unscheduleQuery(results[0].unique_id);

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the deleted transfer
 */
export const deleteTransferReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Transfer deleted successfully');
};
