import { type Wishlist, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { Dayjs } from 'dayjs';

/**
 *
 * @param transactions - The transactions to generate wishlists for
 * @param skippedTransactions - The transactions to skip
 * @param wishlist - The wishlist to generate
 * @param fromDate - The date to generate wishlists from
 * Generate wishlists for a given wishlist
 */
const generateWishlists = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    wishlist: Wishlist,
    fromDate: Dayjs,
): void => {
    const allTransactions: any[] = transactions.concat(skippedTransactions);
    const wishlist_amount: number = wishlist.wishlist_amount;

    allTransactions.sort((a, b) =>
        dayjs(a.date).diff(dayjs(b.date), 'millisecond'),
    );

    let affordableDate: number | null = null;
    for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].balance >= wishlist_amount) {
            affordableDate = allTransactions[i].date;
            for (let j = i + 1; j < allTransactions.length; j++) {
                if (allTransactions[j].balance < wishlist_amount) {
                    affordableDate = null;
                    break;
                }
            }

            if (affordableDate !== null) break;
        }
    }

    if (affordableDate !== null) {
        const newTransactionDate: Dayjs =
            wishlist.wishlist_date_available !== null &&
            wishlist.wishlist_date_available !== undefined
                ? dayjs(
                      Math.max(
                          affordableDate,
                          dayjs(wishlist.wishlist_date_available).millisecond(),
                      ),
                  )
                : dayjs(affordableDate);

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            wishlist_id: wishlist.wishlist_id,
            title: wishlist.wishlist_title,
            description: wishlist.wishlist_description,
            date: newTransactionDate,
            amount: -wishlist_amount,
            tax_rate:
                wishlist.wishlist_tax_rate !== undefined
                    ? wishlist.wishlist_tax_rate
                    : 0,
            total_amount: Number(
                -(
                    wishlist_amount +
                    wishlist_amount *
                        (wishlist.wishlist_tax_rate !== undefined
                            ? wishlist.wishlist_tax_rate
                            : 0)
                ),
            ),
        };

        if (fromDate > newTransactionDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generateWishlists;
