import { NextFunction, Request, Response } from 'express';
import { wishlistQueries } from '../models/queryData.js';
import { executeQuery, handleError } from '../utils/helperFunctions.js';
import { Wishlist } from '../types/types.js';

interface WishlistInput {
    wishlist_id: string;
    account_id: string;
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
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    wishlist_date_can_purchase: wishlist.wishlist_date_can_purchase,
    date_created: wishlist.date_created,
    date_modified: wishlist.date_modified
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all wishlists
 */
export const getWishlists = async (request: Request, response: Response): Promise<void> => {
    const { account_id, id } = request.query;

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

        const results = await executeQuery<WishlistInput>(query, params);

        if ((id || account_id) && results.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Create a map of wishlist_id to transaction date for faster lookup
        const transactionMap: Record<number, string | null> = {};
        request.transactions.forEach((transaction) => {
            transactionMap[transaction.wishlist_id] = transaction.date;
        });

        // Add the wishlist_date_can_purchase to the wishlist object
        const modifiedWishlists = results.map((wishlist: WishlistInput) => ({
            ...wishlist,
            wishlist_date_can_purchase: transactionMap[Number(wishlist.wishlist_id)] || null
        }));

        // Parse the data to the correct format
        const wishlists: Wishlist[] = modifiedWishlists.map((wishlist) =>
            wishlistsParse(wishlist)
        );

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'wishlist' : (account_id ? 'wishlists for given account_id' : 'wishlists')}`);
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new wishlist
 */
export const createWishlist = async (request: Request, response: Response): Promise<void> => {
    try {
        const { account_id, amount, title, description, priority, url_link } = request.body;

        const results = await executeQuery<WishlistInput>(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link]);

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = results.map(wishlist => wishlistsParse(wishlist));

        response.status(201).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating wishlist');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a wishlist
 */
export const updateWishlist = async (request: Request, response: Response): Promise<void> => {
    try {
        const { id } = request.params;
        const { account_id, amount, title, description, priority, url_link } = request.body;

        const results = await executeQuery<WishlistInput>(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id]);

        if (results.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        // Parse the data to correct format and return an object
        const wishlists: Wishlist[] = results.map(wishlist => wishlistsParse(wishlist));

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating wishlist');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a wishlist
 */
export const deleteWishlist = async (request: Request, response: Response): Promise<void> => {
    try {
        const { id } = request.params;

        const getWishlistResults = await executeQuery<WishlistInput>(wishlistQueries.getWishlistsById, [id]);

        if (getWishlistResults.length === 0) {
            response.status(404).send('Wishlist not found');
            return;
        }

        await executeQuery(wishlistQueries.deleteWishlist, [id]);

        response.status(200).send('Successfully deleted wishlist item');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting wishlist');
    }
};
