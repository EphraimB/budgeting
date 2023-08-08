import { type NextFunction, type Request, type Response } from 'express';
import { cronJobQueries, wishlistQueries } from '../models/queryData.js';
import {
    executeQuery,
    handleError,
    parseOrFallback,
} from '../utils/helperFunctions.js';
import { type Wishlist } from '../types/types.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';

interface WishlistInput {
    wishlist_id: string;
    account_id: string;
    tax_id: string;
    cron_job_id: string;
    wishlist_amount: string;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_url_link: string;
    wishlist_priority: string;
    wishlist_date_available: string;
    wishlist_date_can_purchase: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param wishlist - Wishlist object
 * @returns - Wishlist object with parsed values
 */
const wishlistsParse = (wishlist: WishlistInput): Wishlist => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    account_id: parseInt(wishlist.account_id),
    tax_id: parseOrFallback(wishlist.tax_id),
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

    try {
        let query: string;
        let params: any[];

        if (
            id !== null ||
            (id !== undefined && account_id !== null) ||
            account_id !== undefined
        ) {
            query = wishlistQueries.getWishlistsByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null || id !== undefined) {
            query = wishlistQueries.getWishlistsById;
            params = [id];
        } else if (account_id !== null || account_id !== undefined) {
            query = wishlistQueries.getWishlistsByAccountId;
            params = [account_id];
        } else {
            query = wishlistQueries.getAllWishlists;
            params = [];
        }

        const results = await executeQuery<WishlistInput>(query, params);

        if (
            (id !== null ||
                id !== undefined ||
                account_id !== null ||
                account_id !== undefined) &&
            results.length === 0
        ) {
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
        const modifiedWishlists = results.map((wishlist: WishlistInput) => ({
            ...wishlist,
            wishlist_date_can_purchase:
                transactionMap[Number(wishlist.wishlist_id)] !== null ||
                transactionMap[Number(wishlist.wishlist_id)] !== undefined
                    ? transactionMap[Number(wishlist.wishlist_id)]
                    : null,
        }));

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map(
            (wishlist: WishlistInput) => wishlistsParse(wishlist),
        );

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null || id !== undefined
                    ? 'wishlist'
                    : account_id !== null || account_id !== undefined
                    ? 'wishlists for given account_id'
                    : 'wishlists'
            }`,
        );
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
    } = request.body;

    try {
        const cron_job_id: number | null = null;

        const results = await executeQuery<WishlistInput>(
            wishlistQueries.createWishlist,
            [
                account_id,
                tax_id,
                cron_job_id,
                amount,
                title,
                description,
                priority,
                url_link,
            ],
        );

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = results.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        // Store the wishlist_id in the request object so it can be used in the next middleware
        request.wishlist_id = wishlists[0].wishlist_id;

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating wishlist');
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

    try {
        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((account) => {
            account.transactions.forEach((transaction: any) => {
                transactionMap[transaction.wishlist_id] = transaction.date;
            });
        });

        const results = await executeQuery<WishlistInput>(
            wishlistQueries.getWishlistsById,
            [wishlist_id],
        );

        // Add the wishlist_date_can_purchase to the wishlist object
        const modifiedWishlists = results.map((wishlist: WishlistInput) => ({
            ...wishlist,
            wishlist_date_can_purchase:
                transactionMap[Number(wishlist.wishlist_id)] !== null &&
                transactionMap[Number(wishlist.wishlist_id)] !== undefined
                    ? transactionMap[Number(wishlist.wishlist_id)]
                    : null,
        }));

        console.log(transactionMap);

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map(
            (wishlist: WishlistInput) => wishlistsParse(wishlist),
        );

        const cronParams = {
            date: wishlists[0].wishlist_date_can_purchase,
            account_id: request.body.account_id,
            id: wishlist_id,
            amount: -request.body.amount,
            title: request.body.title,
            description: request.body.description,
            scriptPath: '/app/dist/scripts/createTransaction.sh',
            type: 'wishlist',
        };

        if (cronParams.date !== null || cronParams.date !== undefined) {
            const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

            const cronId: number = (
                await executeQuery(cronJobQueries.createCronJob, [
                    uniqueId,
                    cronDate,
                ])
            )[0].cron_job_id;

            const updateWishlist = await executeQuery(
                wishlistQueries.updateWishlistWithCronJobId,
                [cronId, wishlist_id],
            );

            if (updateWishlist.length === 0) {
                response
                    .status(400)
                    .send("Wishlist couldn't update the cron_job_id");
                return;
            }
        }

        response.status(201).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
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
    } = request.body;

    try {
        const results = await executeQuery<WishlistInput>(
            wishlistQueries.updateWishlist,
            [
                account_id,
                tax_id,
                amount,
                title,
                description,
                priority,
                url_link,
                id,
            ],
        );

        if (results.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = results.map((wishlist) =>
            wishlistsParse(wishlist),
        );

        // Store the wishlist_id in the request object so it can be used in the next middleware
        request.wishlist_id = wishlists[0].wishlist_id;

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating wishlist');
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

    try {
        // Get cron job id
        const wishlistsResults = await executeQuery(
            wishlistQueries.getWishlistsById,
            [wishlist_id],
        );
        const cronId = wishlistsResults[0].cron_job_id;

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);
        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            console.error('Cron job not found');
            response.status(404).send('Cron job not found');
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
        const modifiedWishlists = wishlistsResults.map(
            (wishlist: WishlistInput) => ({
                ...wishlist,
                wishlist_date_can_purchase:
                    transactionMap[Number(wishlist.wishlist_id)] !== null ||
                    transactionMap[Number(wishlist.wishlist_id)] !== undefined
                        ? transactionMap[Number(wishlist.wishlist_id)]
                        : null,
            }),
        );

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map(
            (wishlist: WishlistInput) => wishlistsParse(wishlist),
        );

        const cronParams = {
            date: wishlists[0].wishlist_date_can_purchase,
            account_id: request.body.account_id,
            id: wishlist_id,
            amount: -request.body.amount,
            title: request.body.title,
            description: request.body.description,
            scriptPath: '/app/dist/scripts/createTransaction.sh',
            type: 'wishlist',
        };

        if (cronParams.date !== null || cronParams.date !== undefined) {
            const { cronDate, uniqueId } = await scheduleCronJob(cronParams);

            await executeQuery(cronJobQueries.updateCronJob, [
                uniqueId,
                cronDate,
                cronId,
            ]);
        }

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating cron tab');
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

    try {
        // Delete cron job from crontab
        const getWishlistResults = await executeQuery<WishlistInput>(
            wishlistQueries.getWishlistsById,
            [id],
        );

        if (getWishlistResults.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        const cronId = getWishlistResults[0].cron_job_id;

        const cronJobResults = await executeQuery(cronJobQueries.getCronJob, [
            cronId,
        ]);

        if (cronJobResults.length > 0) {
            await deleteCronJob(cronJobResults[0].unique_id);
        } else {
            console.error('Cron job not found');
        }

        await executeQuery(wishlistQueries.deleteWishlist, [id]);

        // Delete wishlist from database
        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        response.status(200).send('Successfully deleted wishlist item');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting wishlist');
    }
};
