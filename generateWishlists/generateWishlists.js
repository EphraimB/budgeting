const generateWishlists = (transactions, skippedTransactions, wishlist, fromDate) => {
    const allTransactions = transactions.concat(skippedTransactions);
    const wishlist_amount = parseFloat(wishlist.wishlist_amount);

    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Find the next transaction with a positive amount, a balance greater than the wishlist amount,
    // and a date after the current date
    const nextTransaction = allTransactions.find(transaction => {
        const isAfterCurrentDate = transaction.date > new Date(); // Check if the transaction date is after the current date
        const isAfterWishlistDate = wishlist.wishlist_date_available === null || transaction.date >= new Date(wishlist.wishlist_date_available);
        return isAfterCurrentDate && isAfterWishlistDate && transaction.amount > 0 && transaction.balance > wishlist_amount;
    });

    if (nextTransaction) {
        const newTransaction = {
            title: wishlist.wishlist_title,
            description: wishlist.wishlist_description,
            date: nextTransaction.date,
            amount: -wishlist_amount,
        };

        if (fromDate > nextTransaction.date) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generateWishlists;
