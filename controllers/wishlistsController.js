import pool from '../config/db.js';
import { wishlistQueries } from '../models/queryData.js';

const wishlistsParse = wishlist => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    date_created: wishlist.date_created,
    date_updated: wishlist.date_updated,
});

// Get all wishlists
export const getWishlists = async (request, response) => {
    try {
        const { id } = request.query;
        const query = id ? wishlistQueries.getWishlist : wishlistQueries.getWishlists;
        const params = id ? [id] : [];

        const results = await executeQuery(query, params);

        // Parse the data to the correct format
        const wishlists = results.map(wishlist => wishlistsParse(wishlist));

        response.status(200).json(wishlists);
    } catch (error) {
        handleError(response, 'Error getting wishlists');
    }
};

// Create wishlist
export const createWishlist = async (request, response) => {
    try {
        const { account_id, amount, title, description, priority, url_link } = request.body;

        const results = await executeQuery(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link]);

        // Parse the data to correct format and return an object
        const wishlists = results.map(wishlist => wishlistsParse(wishlist));

        response.status(201).json(wishlists);
    } catch (error) {
        handleError(response, 'Error creating wishlist');
    }
};

// Update wishlist
export const updateWishlist = async (request, response) => {
    try {
        const id = parseInt(request.params.id);
        const { account_id, amount, title, description, priority, url_link } = request.body;

        const results = await executeQuery(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id]);

        // Parse the data to correct format and return an object
        const wishlists = results.map(wishlist => wishlistsParse(wishlist));

        response.status(200).json(wishlists);
    } catch (error) {
        handleError(response, 'Error updating wishlist');
    }
};

// Delete wishlist
export const deleteWishlist = async (request, response) => {
    try {
        const id = parseInt(request.params.id);

        await executeQuery(wishlistQueries.deleteWishlist, [id]);

        response.status(200).send("Successfully deleted wishlist item");
    } catch (error) {
        handleError(response, 'Error deleting wishlist');
    }
};