import { GeneratedTransaction } from '../types/types';

/**
 * 
 * @param transactions - The transactions to calculate balances for
 * @param currentBalance - The current balance
 * Calculate the balance for each transaction
 */
const calculateBalances = (transactions: GeneratedTransaction[], currentBalance: number): void => {
    const sortedTransactions: GeneratedTransaction[] = transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let pastBalance: number = currentBalance;
    let futureBalance: number = currentBalance;

    const calculateBalanceForPastTransaction = (transaction: GeneratedTransaction) => {
        transaction.balance = pastBalance;
        pastBalance -= transaction.total_amount;
    };

    const calculateBalanceForFutureTransaction = (transaction: GeneratedTransaction) => {
        futureBalance += transaction.total_amount;
        transaction.balance = parseFloat(futureBalance.toFixed(2));
    };

    const pastTransactions: GeneratedTransaction[] = sortedTransactions.filter(transaction => new Date(transaction.date) < new Date());
    const futureTransactions: GeneratedTransaction[] = sortedTransactions.filter(transaction => new Date(transaction.date) >= new Date());

    pastTransactions.reverse().forEach(calculateBalanceForPastTransaction);
    futureTransactions.forEach(calculateBalanceForFutureTransaction);
};

export default calculateBalances;
