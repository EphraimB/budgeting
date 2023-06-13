const calculateBalances = (transactions, currentBalance) => {
  const sortedTransactions = transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
  let balance = currentBalance;

  const calculateBalanceForPastTransaction = transaction => {
    transaction.balance = balance;
    balance -= transaction.amount;
  };

  const calculateBalanceForFutureTransaction = transaction => {
    balance += transaction.amount;
    transaction.balance = parseFloat(balance.toFixed(2));
  };

  const pastTransactions = sortedTransactions.filter(transaction => transaction.date < new Date());
  const futureTransactions = sortedTransactions.filter(transaction => transaction.date >= new Date());

  pastTransactions.reverse().forEach(calculateBalanceForPastTransaction);
  futureTransactions.forEach(calculateBalanceForFutureTransaction);
};

export default calculateBalances;
