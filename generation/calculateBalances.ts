import { Transaction } from '../types/types';

/**
 * 
 * @param transactions - The transactions to calculate balances for
 * @param currentBalance - The current balance
 * Calculate the balance for each transaction
 */
const calculateBalances = (transactions: Transaction[], currentBalance: number): void => {
    const sortedTransactions: Transaction[] = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance: number = currentBalance;

    const calculateBalanceForPastTransaction = (transaction: Transaction) => {
        transaction.balance = balance;
        balance -= transaction.amount;
    };

    const calculateBalanceForFutureTransaction = (transaction: Transaction) => {
        balance += transaction.amount;
        transaction.balance = balance;
    };

    const pastTransactions: Transaction[] = sortedTransactions.filter(transaction => transaction.date < new Date());
    const futureTransactions: Transaction[] = sortedTransactions.filter(transaction => transaction.date >= new Date());

    pastTransactions.reverse().forEach(calculateBalanceForPastTransaction);
    futureTransactions.forEach(calculateBalanceForFutureTransaction);
};

export default calculateBalances;
