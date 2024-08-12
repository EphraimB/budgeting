import { type NextFunction, type Request, type Response } from 'express';
import {
    cronJobQueries,
    taxesQueries,
    wishlistQueries,
} from '../models/queryData.js';
import { handleError, parseIntOrFallback } from '../utils/helperFunctions.js';
import { type Wishlist } from '../types/types.js';
import { logger } from '../config/winston.js';
import determineCronValues from '../crontab/determineCronValues.js';
import pool from '../config/db.js';

/**
 *
 * @param wishlist - Wishlist object
 * @returns - Wishlist object with parsed values
 */
const wishlistsParse = (wishlist: Record<string, string>): Wishlist => ({
    id: parseInt(wishlist.wishlist_id),
    account_id: parseInt(wishlist.account_id),
    tax_id: parseIntOrFallback(wishlist.tax_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    wishlist_date_can_purchase: wishlist.wishlist_date_can_purchase,
    date_created: wishlist.date_created,
    date_modified: wishlist.date_modified,
});

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
    const { account_id, id } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (id && account_id) {
            query = wishlistQueries.getWishlistsByIdAndAccountId;
            params = [id, account_id];
        } else if (id) {
            query = wishlistQueries.getWishlistsById;
            params = [id];
        } else if (account_id) {
            query = wishlistQueries.getWishlistsByAccountId;
            params = [account_id];
        } else {
            query = wishlistQueries.getAllWishlists;
            params = [];
        }

        const { rows } = await client.query(query, params);

        if (id && rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        // Add the wishlist_date_can_purchase to the wishlist object
        const modifiedWishlists = rows.map((wishlist) => ({
            ...wishlist,
            wishlist_date_can_purchase:
                transactionMap[Number(wishlist.wishlist_id)] !== null &&
                transactionMap[Number(wishlist.wishlist_id)] !== undefined
                    ? transactionMap[Number(wishlist.wishlist_id)]
                    : null,
        }));

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        response.status(200).json(wishlists);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'wishlist'
                    : account_id
                    ? 'wishlists for given account id'
                    : 'wishlists'
            }`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to create a new wishlist
 */
export const createWishlist = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        priority,
        url_link,
        date_available,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const cron_job_id: number | null = null;

        const { rows } = await client.query(wishlistQueries.createWishlist, [
            account_id,
            tax_id,
            cron_job_id,
            amount,
            title,
            description,
            priority,
            url_link,
            date_available,
        ]);

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = rows.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        // Store the wishlist_id in the request object so it can be used in the next middleware
        request.wishlist_id = wishlists[0].id;

        next();
    } catch (error) {
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
 * Sends a POST request to the database to create a new cron tab
 */
export const createWishlistCron = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { wishlist_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};

        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        const { rows } = await client.query(wishlistQueries.getWishlistsById, [
            wishlist_id,
        ]);

        // Add the wishlist_date_can_purchase to the wishlist object
        const modifiedWishlists = rows.map((wishlist) => ({
            ...wishlist,
            wishlist_date_can_purchase: transactionMap[
                Number(wishlist.wishlist_id)
            ]
                ? transactionMap[Number(wishlist.wishlist_id)]
                : null,
        }));

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        const jobDetails = {
            date: wishlists[0].wishlist_date_can_purchase,
        };

        await client.query('BEGIN;');

        if (jobDetails.date !== null && jobDetails.date !== undefined) {
            const cronDate = determineCronValues(
                jobDetails as { date: string },
            );

            // Get tax rate
            const { rows: result } = await client.query(
                taxesQueries.getTaxRateByTaxId,
                [wishlists[0].tax_id],
            );
            const taxRate = result && result.length > 0 ? result : 0;

            const uniqueId = `wishlist-${wishlists[0].id}`;

            await client.query(`
                SELECT cron.schedule('${uniqueId}', '${cronDate}',
                $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${
                    request.body.account_id
                }, ${-request.body.amount}, ${taxRate}, '${
                    request.body.title
                }', '${request.body.description}')$$)`);

            const { rows: cronIdResults } = await client.query(
                cronJobQueries.createCronJob,
                [uniqueId, cronDate],
            );

            const cronId = cronIdResults[0].cron_job_id;

            const { rows: updateWishlist } = await client.query(
                wishlistQueries.updateWishlistWithCronJobId,
                [cronId, wishlist_id],
            );

            if (updateWishlist.length === 0) {
                response
                    .status(400)
                    .send("Wishlist couldn't update the cron job id");
                return;
            }
        }

        await client.query('COMMIT;');

        response.status(201).json(wishlists);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a wishlist
 */
export const updateWishlist = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        priority,
        url_link,
        date_available,
    } = request.body;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(wishlistQueries.updateWishlist, [
            account_id,
            tax_id,
            amount,
            title,
            description,
            priority,
            url_link,
            date_available,
            id,
        ]);

        if (rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = rows.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        // Store the wishlist_id in the request object so it can be used in the next middleware
        request.wishlist_id = wishlists[0].id;

        next();
    } catch (error) {
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
 * Sends a PUT request to the database to update a cron tab
 */
export const updateWishlistCron = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { wishlist_id } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        // Get cron job id
        const { rows } = await client.query(wishlistQueries.getWishlistsById, [
            wishlist_id,
        ]);
        const cronId = rows[0].cron_job_id;

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        // Add the wishlist_date_can_purchase to the wishlist object
        const modifiedWishlists = rows.map((wishlist) => ({
            ...wishlist,
            wishlist_date_can_purchase:
                transactionMap[Number(wishlist.wishlist_id)] !== null &&
                transactionMap[Number(wishlist.wishlist_id)] !== undefined
                    ? transactionMap[Number(wishlist.wishlist_id)]
                    : null,
        }));

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        const jobDetails = {
            date: wishlists[0].wishlist_date_can_purchase,
        };

        await client.query('BEGIN;');

        if (jobDetails.date !== null || jobDetails.date !== undefined) {
            const cronDate = determineCronValues(
                jobDetails as { date: string },
            );

            const { rows: uniqueIdResults } = await client.query(
                cronJobQueries.getCronJob,
                [cronId],
            );

            const uniqueId = uniqueIdResults[0].unique_id;

            // Get tax rate
            const { rows: result } = await client.query(
                taxesQueries.getTaxRateByTaxId,
                [wishlists[0].tax_id],
            );
            const taxRate = result && result.length > 0 ? result : 0;

            await client.query(`cron.unschedule(${uniqueId})`);

            await client.query(`
                SELECT cron.schedule('${uniqueId}', '${cronDate}',
                $$INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (${
                    request.body.account_id
                }, ${-request.body.amount}, ${taxRate}, '${
                    request.body.title
                }', '${request.body.description}')$$)`);

            await client.query(cronJobQueries.updateCronJob, [
                uniqueId,
                cronDate,
                cronId,
            ]);
        }

        await client.query('COMMIT;');

        response.status(200).json(wishlists);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
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
        const { rows } = await client.query(wishlistQueries.getWishlistsById, [
            id,
        ]);

        if (rows.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        const cronId = rows[0].cron_job_id;

        const { rows: cronJobResults } = await client.query(
            cronJobQueries.getCronJob,
            [cronId],
        );

        await client.query('BEGIN;');

        await client.query(`cron.unschedule(${cronJobResults[0].unique_id})`);

        await client.query(wishlistQueries.deleteWishlist, [id]);

        // Delete wishlist from database
        await client.query(cronJobQueries.deleteCronJob, [cronId]);

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
