const calculateBalances = (transactions, currentBalance) => {
    const pastTransactions = transactions.filter(transaction => transaction.date <= new Date());
    const futureTransactions = transactions.filter(transaction => transaction.date > new Date());
    const reversedPastTransactions = pastTransactions.slice().reverse();
    let balance = currentBalance;

    reversedPastTransactions.forEach(transaction => {
        transaction.balance = balance;
        balance -= transaction.amount;
    });

    balance = currentBalance;

    futureTransactions.forEach(transaction => {
        balance += transaction.amount;
        transaction.balance = parseFloat(balance.toFixed(2));
    });
}

module.exports = calculateBalances;