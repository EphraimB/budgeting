import { type GeneratedTransaction } from '../types/types';
import dayjs from 'dayjs';

/**
 *
 * @param transactions - The transactions to calculate balances for
 * @param currentBalance - The current balance
 * Calculate the balance for each transaction
 */
const calculateBalances = (
    transactions: GeneratedTransaction[],
    currentBalance: number,
): void => {
    const sortedTransactions: GeneratedTransaction[] = transactions.sort(
        (a, b) => dayjs(a.date).diff(dayjs(b.date)),
    );
    let pastBalance: number = currentBalance;
    let futureBalance: number = currentBalance;

    const calculateBalanceForPastTransaction = (
        transaction: GeneratedTransaction,
    ) => {
        transaction.balance = pastBalance;
        pastBalance -= transaction.totalAmount;
    };

    const calculateBalanceForFutureTransaction = (
        transaction: GeneratedTransaction,
    ) => {
        futureBalance += transaction.totalAmount;
        transaction.balance = futureBalance;
    };

    const pastTransactions: GeneratedTransaction[] = sortedTransactions.filter(
        (transaction) => dayjs(transaction.date).diff(dayjs()) < 0,
    );
    const futureTransactions: GeneratedTransaction[] =
        sortedTransactions.filter(
            (transaction) => dayjs(transaction.date).diff(dayjs()) >= 0,
        );

    pastTransactions.reverse().forEach(calculateBalanceForPastTransaction);
    futureTransactions.forEach(calculateBalanceForFutureTransaction);
};

export default calculateBalances;
