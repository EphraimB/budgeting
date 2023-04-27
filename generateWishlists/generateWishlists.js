const generateWishlists = (transactions, wishlist, currentBalance) => {
    // Search for the next positive amount in the transactions array of a balance that's greater than the wishlist.wishlist_amount and make the wishlist_date the date of the positive transaction before that. The wishlist_date will need to be generated.
    let wishlist_date = new Date();

    if(currentBalance > wishlist.wishlist_amount) {
        wishlist_date = new Date();
    } else {
        for (let i = 0; i < transactions.length; i++) {
            if (transactions[i].date > new Date() && transactions[i].amount > 0 && transactions[i].balance > wishlist.wishlist_amount) {
                wishlist_date = transactions[i].date;
                
                break;
            }
        }
    }

    transactions.push({
        title: wishlist.wishlist_title,
        description: wishlist.wishlist_description,
        date: new Date(wishlist_date),
        amount: parseFloat(-wishlist.wishlist_amount),
    });
}

module.exports = generateWishlists;