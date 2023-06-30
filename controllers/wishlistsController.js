import { wishlistQueries } from '../models/queryData.js';
import { executeQuery, handleError } from '../utils/helperFunctions.js';

const wishlistsParse = wishlist => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    date_created: wishlist.date_created,
    date_modified: wishlist.date_modified
});

// Get all wishlists
export const getWishlists = async (request, response) => {
    const { id } = request.query;

    try {
        const query = id ? wishlistQueries.getWishlist : wishlistQueries.getWishlists;
        const params = id ? [id] : [];

        const results = await executeQuery(query, params);

        if (id && results.length === 0) {
            return response.status(404).send('Wishlist not found');
        }

        // Parse the data to the correct format
        const wishlists = results.map(wishlist => wishlistsParse(wishlist));

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'wishlist' : 'wishlists'}`);
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
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating wishlist');
    }
};

// Update wishlist
export const updateWishlist = async (request, response) => {
    try {
        const id = parseInt(request.params.id);
        const { account_id, amount, title, description, priority, url_link } = request.body;

        const results = await executeQuery(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id]);

        if (results.length === 0) {
            return response.status(404).send('Wishlist not found');
        }

        // Parse the data to correct format and return an object
        const wishlists = results.map(wishlist => wishlistsParse(wishlist));

        response.status(200).json(wishlists);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating wishlist');
    }
};

// Delete wishlist
export const deleteWishlist = async (request, response) => {
    try {
        const id = parseInt(request.params.id);

        const getWishlistResults = await executeQuery(wishlistQueries.getWishlist, [id]);

        if (getWishlistResults.length === 0) {
            return response.status(404).send('Wishlist not found');
        }

        await executeQuery(wishlistQueries.deleteWishlist, [id]);

        response.status(200).send('Successfully deleted wishlist item');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting wishlist');
    }
};
