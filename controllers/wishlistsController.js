import pool from '../db.js';
import { wishlistQueries } from '../queryData.js';

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
export const getWishlists = (request, response) => {
    const { id } = request.query;
    const query = id ? wishlistQueries.getWishlist : wishlistQueries.getWishlists;
    const queryArgs = id ? [id] : [];

    pool.query(query, queryArgs, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting wishlists', param: null, location: 'query' } });
        }

        // Parse the data to the correct format
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(200).send(wishlists);
    });
};

// Create wishlist
export const createWishlist = (request, response) => {
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(201).send(wishlists);
    });
};

// Update wishlist
export const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(200).send(wishlists);
    });
};

// Delete wishlist
export const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting wishlist", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted wishlist item");
    });
};