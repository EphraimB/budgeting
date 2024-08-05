import { type NextFunction, type Request, type Response } from 'express';
import { transferQueries, cronJobQueries } from '../models/queryData.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
    scheduleQuery,
    unscheduleQuery,
    nextTransactionFrequencyDate,
} from '../utils/helperFunctions.js';
import { type Transfer } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';

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
    frequency_type_variable: parseInt(transfer.frequency_type_variable),
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

    const client = await pool.connect(); // Get a client from the pool

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

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        // Parse the data to the correct format
        const transfers = rows.map((row) => transfersParse(row));

        transfers.map((transfer: any) => {
            const nextExpenseDate = nextTransactionFrequencyDate(transfer);

            transfer.next_date = nextExpenseDate;
        });

        response.status(200).json(transfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'transfer'
                    : account_id
                    ? 'transfers for given account id'
                    : 'transfers'
            }`,
        );
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows: transferResult } = await client.query(
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
        const transfers: Transfer[] = transferResult.map((row) =>
            transfersParse(row),
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

        const taxRate = 0;

        const uniqueId = `transfer-${transfers[0].id}`;

        await client.query(`
            SELECT cron.schedule '${uniqueId}', ${cronDate},
            $$INSERT INTO transaction_history
                (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
                VALUES
                (${source_account_id}, ${-amount}, ${taxRate}, '${title}', '${description}');
                (${destination_account_id}, ${amount}, ${taxRate}, '${title}', '${description}');$$`);

        const { rows: cronIdResults } = await client.query(
            cronJobQueries.createCronJob,
            [uniqueId, cronDate],
        );

        const cronId = cronIdResults[0].cron_job_id;

        await client.query(transferQueries.updateTransferWithCronJobId, [
            cronId,
            transfers[0].id,
        ]);

        await client.query('COMMIT;');

        request.transfer_id = transfers[0].id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(transferQueries.getTransfersById, [
            transfer_id,
        ]);

        const modifiedTransfers = rows.map((row) => transfersParse(row));

        response.status(201).json(modifiedTransfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating transfer');
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(transferQueries.getTransfersById, [
            id,
        ]);

        if (rows.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        const cronId: number = parseInt(rows[0].cron_job_id);

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

        const { rows: uniqueIdResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        const uniqueId = uniqueIdResults[0].unique_id;

        const taxRate = 0;

        await client.query('BEGIN;');

        await client.query(`cron.unschedule(${uniqueId})`);

        await client.query(`
            SELECT cron.schedule '${uniqueId}', ${cronDate},
            $$INSERT INTO transaction_history
                (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description)
                VALUES
                (${source_account_id}, ${-amount}, ${taxRate}, '${title}', '${description}');
                (${destination_account_id}, ${amount}, ${taxRate}, '${title}', '${description}');$$`);

        await client.query(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await client.query(transferQueries.updateTransfer, [
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

        await client.query('COMMIT;');

        request.transfer_id = id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating transfer');
    } finally {
        client.release(); // Release the client back to the pool
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

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(transferQueries.getTransfersById, [
            transfer_id,
        ]);

        const modifiedTransfers = rows.map((row) => transfersParse(row));

        response.status(200).json(modifiedTransfers);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting transfer');
    } finally {
        client.release(); // Release the client back to the pool
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
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(transferQueries.getTransfersById, [
            id,
        ]);

        if (rows.length === 0) {
            response.status(404).send('Transfer not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(transferQueries.deleteTransfer, [id]);

        const cronId: number = parseInt(rows[0].cron_job_id);

        const { rows: results } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        await client.query(`cron.unschedule(${results[0].unique_id})`);

        await client.query(cronJobQueries.deleteCronJob, [cronId]);

        await client.query('COMMIT;');

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting transfer');
    } finally {
        client.release(); // Release the client back to the pool
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
