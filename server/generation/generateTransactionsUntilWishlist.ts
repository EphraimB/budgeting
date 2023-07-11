import { Request, Response, NextFunction } from 'express';
import generateTransactions from './generateTransactions.js';

const generateTransactionsUntilWishlist = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const fromDate: Date = new Date(request.query.from_date as string);
    const toDate: Date = new Date(request.query.to_date as string);
    const endDate: Date = new Date(+fromDate + 10 * 365 * 24 * 60 * 60 * 1000); // 10 years from the from_date
    const dayDuration = 24 * 60 * 60 * 1000; // one day in milliseconds
    let currentBalance: number = request.currentBalance;
    let currentDate: Date = fromDate;

    while (currentDate < toDate && currentDate < endDate) {
        // set the from_date and to_date for one day
        request.query.from_date = currentDate.toISOString();
        request.query.to_date = new Date(+currentDate + dayDuration).toISOString();

        // call the original generateTransactions function
        await generateTransactions(request, response, () => { });

        // update the current balance and current date
        currentBalance = request.currentBalance;
        currentDate = new Date(+currentDate + dayDuration);

        // if the balance is enough to purchase the wishlist, break the loop
        if (request.wishlists.some(wishlist => currentBalance >= wishlist.wishlist_amount)) {
            break;
        }
    }

    // If the loop finishes without finding a date, set date_can_purchase to null
    request.wishlists.forEach(wishlist => {
        if (!wishlist.wishlist_date_can_purchase) {
            wishlist.wishlist_date_can_purchase = null;
        }
    });

    next();
}

export default generateTransactionsUntilWishlist;