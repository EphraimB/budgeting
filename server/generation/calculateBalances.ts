import { type GeneratedTransaction } from '../types/types';
import dayjs, { type Dayjs } from 'dayjs';

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
        pastBalance -= transaction.total_amount;
    };

    const calculateBalanceForFutureTransaction = (
        transaction: GeneratedTransaction,
    ) => {
        futureBalance += transaction.total_amount;
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
