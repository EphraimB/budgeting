const generateWishlists = (transactions, skippedTransactions, wishlist, fromDate) => {
    const allTransactions = transactions.concat(skippedTransactions);
    const wishlist_amount = parseFloat(wishlist.wishlist_amount);

    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Find the next transaction with a positive amount, a balance greater than the wishlist amount,
    // and a date after the current date
    const nextTransaction = allTransactions.find(transaction => {
        const isAfterCurrentDate = transaction.date > new Date();
        return isAfterCurrentDate && transaction.amount > 0 && transaction.balance > wishlist_amount;
    });

    if (nextTransaction) {
        const newTransactionDate = wishlist.wishlist_date_available
            ? new Date(Math.max(nextTransaction.date, new Date(wishlist.wishlist_date_available)))
            : nextTransaction.date;

        const newTransaction = {
            title: wishlist.wishlist_title,
            description: wishlist.wishlist_description,
            date: newTransactionDate,
            amount: -wishlist_amount,
        };

        if (fromDate > newTransactionDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generateWishlists;