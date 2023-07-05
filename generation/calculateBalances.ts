import { GeneratedTransaction } from '../types/types';

/**
 * 
 * @param transactions - The transactions to calculate balances for
 * @param currentBalance - The current balance
 * Calculate the balance for each transaction
 */
const calculateBalances = (transactions: GeneratedTransaction[], currentBalance: number): void => {
    const sortedTransactions: GeneratedTransaction[] = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let balance: number = currentBalance;

    const calculateBalanceForPastTransaction = (transaction: GeneratedTransaction) => {
        transaction.balance = balance;
        balance -= transaction.amount;
    };

    const calculateBalanceForFutureTransaction = (transaction: GeneratedTransaction) => {
        balance += transaction.amount;
        transaction.balance = parseFloat(balance.toFixed(2));
    };

    const pastTransactions: GeneratedTransaction[] = sortedTransactions.filter(transaction => transaction.date < new Date());
    const futureTransactions: GeneratedTransaction[] = sortedTransactions.filter(transaction => transaction.date >= new Date());

    pastTransactions.reverse().forEach(calculateBalanceForPastTransaction);
    futureTransactions.forEach(calculateBalanceForFutureTransaction);
};

export default calculateBalances;
