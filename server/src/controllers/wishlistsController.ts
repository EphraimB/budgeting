import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all wishlists
 */
export const getWishlists = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT wishlists FROM get_generated_info($1, $2, $3)
            `;
            params = [dayjs(), dayjs().add(5, 'year'), accountId];
        } else {
            query = `
                SELECT wishlists FROM get_generated_info($1, $2)
            `;
            params = [dayjs(), dayjs().add(5, 'year')];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows[0].wishlists); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting wishlists`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all wishlists
 */
export const getWishlistsById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT wishlists FROM get_generated_info($1, $2, $3, $4)
            `;
            params = [dayjs(), dayjs().add(5, 'year'), accountId, id];
        } else {
            query = `
                SELECT wishlists FROM get_generated_info($1, $2, $3, $4)
            `;
            params = [dayjs(), dayjs().add(5, 'year'), null, id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0].wishlists[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting wishlists for id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new wishlist
 */
export const createWishlist = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        priority,
        urlLink,
        dateAvailable,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(
            `
                INSERT INTO wishlist
                (account_id, tax_id, amount, title, description, priority, url_link, date_available)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `,
            [
                accountId,
                taxId,
                amount,
                title,
                description,
                priority,
                urlLink,
                dateAvailable,
            ],
        );

        // Get tax rate
        const { rows: taxResult } = await client.query(
            `
                SELECT rate
                    FROM taxes
                    WHERE id = $1
            `,
            [rows[0].tax_id],
        );
        const taxRate = taxResult && taxResult.length > 0 ? taxResult : 0;

        const uniqueId = uuidv4();

        const { rows: cronDateResults } = await client.query(
            `
                SELECT wishlists FROM get_generated_info($1, $2, $3, $4)
            `,
            [dayjs(), dayjs().add(5, 'year'), null, rows[0].id],
        );

        const dateCanPurchase = cronDateResults[0].dateCanPurchase;

        if (dayjs(dateCanPurchase).isBefore(dayjs().add(1, 'year'))) {
            const jobDetails = {
                date: dateCanPurchase,
            };

            const cronDate = determineCronValues(jobDetails);

            await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${-rows[0]
                .amount}, ${taxRate}, '${rows[0].title}', '${
                rows[0].description
            }')$$)`);

            const { rows: cronIdResults } = await client.query(
                `
                INSERT INTO cron_jobs
                (unique_id, cron_expression)
                VALUES ($1, $2)
                RETURNING *
            `,
                [uniqueId, cronDate],
            );

            const cronId = cronIdResults[0].id;

            await client.query(
                `
                UPDATE wishlist
                    SET cron_job_id = $1
                    WHERE id = $2
            `,
                [cronId, rows[0].id],
            );
        }

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating wishlist');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a wishlist
 */
export const updateWishlist = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const {
        accountId,
        taxId,
        amount,
        title,
        description,
        priority,
        urlLink,
        dateAvailable,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        await client.query('BEGIN;');

        const { rows } = await client.query(
            `
                UPDATE wishlist
                    SET account_id = $1,
                    tax_id = $2,
                    amount = $3,
                    title = $4,
                    description = $5,
                    priority = $6,
                    url_link = $7,
                    date_available = $8
                    WHERE id = $9
                    RETURNING *
            `,
            [
                accountId,
                taxId,
                amount,
                title,
                description,
                priority,
                urlLink,
                dateAvailable,
                id,
            ],
        );

        if (rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Get tax rate
        const { rows: taxResult } = await client.query(
            `
                SELECT rate
                    FROM taxes
                    WHERE id = $1
            `,
            [rows[0].tax_id],
        );
        const taxRate = taxResult && taxResult.length > 0 ? taxResult : 0;

        const { rows: cronDateResults } = await client.query(
            `
                SELECT wishlists FROM get_generated_info($1, $2, $3, $4)
            `,
            [dayjs(), dayjs().add(5, 'year'), null, rows[0].id],
        );

        const cronId = rows[0].cronJobId;

        const dateCanPurchase = cronDateResults[0].dateCanPurchase;

        if (cronId !== null) {
            const { rows: cronIdResults } = await client.query(
                `
                SELECT unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
                [cronId],
            );

            const uniqueId = cronIdResults[0].unique_id;

            await client.query(`SELECT cron.unschedule('${uniqueId}')`);

            const jobDetails = {
                date: dateCanPurchase,
            };

            if (dayjs(dateCanPurchase).isBefore(dayjs().add(1, 'year'))) {
                const cronDate = determineCronValues(jobDetails);

                await client.query(`
            SELECT cron.schedule('${uniqueId}', '${cronDate}',
            $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${-rows[0]
                .amount}, ${taxRate}, '${rows[0].title}', '${
                rows[0].description
            }')$$)`);

                await client.query(
                    `
                UPDATE cron_jobs
                    SET unique_id = $1,
                    cron_expression = $2
                    WHERE id = $3
            `,
                    [uniqueId, cronDate, cronId],
                );

                await client.query(
                    `
                UPDATE wishlist
                    SET cron_job_id = $1
                    WHERE id = $2
            `,
                    [cronId, rows[0].id],
                );
            } else {
                await client.query(
                    `
                    DELETE FROM cron_jobs
                    WHERE id = $1
                `,
                    [cronId],
                );
            }
        } else {
            if (dayjs(dateCanPurchase).isBefore(dayjs().add(1, 'year'))) {
                const jobDetails = {
                    date: dateCanPurchase,
                };

                const cronDate = determineCronValues(jobDetails);
                const uniqueId = uuidv4();

                await client.query(`
                SELECT cron.schedule('${uniqueId}', '${cronDate}',
                $$INSERT INTO transaction_history (account_id, amount, tax_rate, title, description) VALUES (${accountId}, ${-rows[0]
                    .amount}, ${taxRate}, '${rows[0].title}', '${
                    rows[0].description
                }')$$)`);

                const { rows: cronIdResults } = await client.query(
                    `
                    INSERT INTO cron_jobs
                    (unique_id, cron_expression)
                    VALUES ($1, $2)
                    RETURNING *
                `,
                    [uniqueId, cronDate],
                );

                const cronId = cronIdResults[0].id;

                await client.query(
                    `
                    UPDATE wishlist
                        SET cron_job_id = $1
                        WHERE id = $2
                `,
                    [cronId, rows[0].id],
                );
            }
        }

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating wishlist');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a wishlist
 */
export const deleteWishlist = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Delete cron job from crontab
        const { rows } = await client.query(
            `
                SELECT id, cron_job_id
                    FROM wishlist
                    WHERE id = $1
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        const cronId = rows[0].cron_job_id;

        const { rows: cronJobResults } = await client.query(
            `
                SELECT id, unique_id
                    FROM cron_jobs
                    WHERE id = $1
            `,
            [cronId],
        );

        await client.query('BEGIN;');

        if (cronId !== null) {
            await client.query(
                `SELECT cron.unschedule('${cronJobResults[0].unique_id}')`,
            );
        }

        await client.query(
            `
                DELETE FROM wishlist
                    WHERE id = $1
            `,
            [id],
        );

        if (cronId !== null) {
            await client.query(
                `
                DELETE FROM cron_jobs
                    WHERE id = $1
            `,
                [cronId],
            );
        }

        await client.query('COMMIT;');

        response.status(200).send('Successfully deleted wishlist item');
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting wishlist');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
