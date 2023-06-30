const generateWishlists = (transactions, skippedTransactions, wishlist, fromDate) => {
    const allTransactions = transactions.concat(skippedTransactions);
    const wishlist_amount = parseFloat(wishlist.wishlist_amount);

    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    let affordableDate;
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

    if (affordableDate) {
        const newTransactionDate = wishlist.wishlist_date_available
            ? new Date(Math.max(affordableDate, new Date(wishlist.wishlist_date_available)))
            : affordableDate;

        const newTransaction = {
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
