import { Wishlist, GeneratedTransaction } from '../types/types';

/**
 * 
 * @param transactions - The transactions to generate wishlists for
 * @param skippedTransactions - The transactions to skip
 * @param wishlist - The wishlist to generate
 * @param fromDate - The date to generate wishlists from
 * Generate wishlists for a given wishlist
 */
const generateWishlists = (transactions: GeneratedTransaction[], skippedTransactions: GeneratedTransaction[], wishlist: Wishlist, fromDate: Date): void => {
    const allTransactions: any[] = transactions.concat(skippedTransactions);
    const wishlist_amount: number = wishlist.wishlist_amount;

    allTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let affordableDate: number | undefined;
    for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].balance >= wishlist_amount) {
            affordableDate = allTransactions[i].date;
            for (let j = i + 1; j < allTransactions.length; j++) {
                if (allTransactions[j].balance < wishlist_amount) {
                    affordableDate = undefined;
                    break;
                }
            }

            if (affordableDate) break;
        }
    }

    if (affordableDate !== undefined) {
        const newTransactionDate: Date = wishlist.wishlist_date_available
            ? new Date(Math.max(affordableDate, new Date(wishlist.wishlist_date_available).getTime()))
            : new Date(affordableDate);

        const newTransaction: GeneratedTransaction = {
            wishlist_id: wishlist.wishlist_id,
            title: wishlist.wishlist_title,
            description: wishlist.wishlist_description,
            date: newTransactionDate,
            amount: -wishlist_amount
        };

        if (fromDate > newTransactionDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generateWishlists;
