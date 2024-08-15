import { type Wishlist, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { type Dayjs } from 'dayjs';

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
    wishlist: any,
    fromDate: Dayjs,
): void => {
    const allTransactions: any[] = transactions.concat(skippedTransactions);
    const wishlistAmount: number = wishlist.wishlist_amount;

    allTransactions.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

    let affordableDate: number | null = null;
    for (let i = 0; i < allTransactions.length; i++) {
        if (allTransactions[i].balance >= wishlistAmount) {
            affordableDate = allTransactions[i].date;
            for (let j = i + 1; j < allTransactions.length; j++) {
                if (allTransactions[j].balance < wishlistAmount) {
                    affordableDate = null;
                    break;
                }
            }

            if (affordableDate !== null) break;
        }
    }

    if (affordableDate !== null) {
        const newTransactionDate: Dayjs = wishlist.wishlist_date_available
            ? dayjs(
                  Math.max(
                      affordableDate,
                      dayjs(wishlist.wishlist_date_available).valueOf(),
                  ),
              )
            : dayjs(affordableDate);

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            wishlistId: wishlist.wishlist_id,
            title: wishlist.wishlist_title,
            description: wishlist.wishlist_description,
            date: newTransactionDate,
            amount: -wishlistAmount,
            taxRate:
                wishlist.wishlist_tax_rate !== undefined
                    ? wishlist.wishlist_tax_rate
                    : 0,
            totalAmount: Number(
                -(
                    wishlistAmount +
                    wishlistAmount *
                        (wishlist.wishlist_tax_rate !== undefined
                            ? wishlist.wishlist_tax_rate
                            : 0)
                ),
            ),
        };

        if (newTransactionDate.diff(fromDate) < 0) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generateWishlists;
