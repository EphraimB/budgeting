const generateWishlists = (transactions, wishlist, currentBalance) => {
    const calculateBalances = require('../calculateBalances');

    let wishlist_date = null;

    // Find the next transaction with a positive amount and a balance greater than the wishlist amount
    const nextTransaction = transactions.find(transaction => {
        const isAfterWishlistDate = wishlist.wishlist_date_available === null || transaction.date >= new Date(wishlist.wishlist_date_available);
        return isAfterWishlistDate && transaction.amount > 0 && transaction.balance > wishlist.wishlist_amount + currentBalance;
    });

    if (nextTransaction) {
        wishlist_date = nextTransaction.date;
    }

    // If no suitable transaction was found, return the original transactions array
    if (!wishlist_date) {
        return transactions;
    }

    const newTransaction = {
        title: wishlist.wishlist_title,
        description: wishlist.wishlist_description,
        date: wishlist_date,
        amount: -parseFloat(wishlist.wishlist_amount),
    };

    transactions.push(newTransaction);

    // Recalculate balances after adding the new transaction
    calculateBalances(transactions, currentBalance);

    return transactions;
};

module.exports = generateWishlists;
