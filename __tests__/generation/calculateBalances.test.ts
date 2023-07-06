import { GeneratedTransaction } from '../../types/types.js';
import calculateBalances from '../../generation/calculateBalances.js';

// Create dates properly
const now = new Date();
const lastWeek = new Date();
lastWeek.setDate(now.getDate() - 7);
const yesterday = new Date();
yesterday.setDate(now.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(now.getDate() + 1);
const dayAfterTomorrow = new Date();
dayAfterTomorrow.setDate(now.getDate() + 2);

describe('calculateBalances', () => {
    it('should calculate the balance for each transaction with no past transactions', () => {
        const transactions: GeneratedTransaction[] = [
            {
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: tomorrow,
                amount: 500
            },
            {
                title: 'Test Transaction 3',
                description: 'Testing the transaction 3',
                date: dayAfterTomorrow,
                amount: -500
            },
            {
                title: 'Test Transaction 4',
                description: 'Testing the transaction 4',
                date: dayAfterTomorrow,
                amount: 1000
            }
        ];

        calculateBalances(transactions, 5000);

        expect(transactions[0].balance).toBe(5500);
        expect(transactions[1].balance).toBe(5000);
        expect(transactions[2].balance).toBe(6000);
    });

    it('should calculate the balance for each transaction with past transactions', () => {
        const transactions: GeneratedTransaction[] = [
            {
                transaction_id: 1,
                title: 'Test Transaction',
                description: 'Testing the transaction',
                date: yesterday,
                date_modified: lastWeek,
                amount: 1000
            },
            {
                transaction_id: 2,
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: tomorrow,
                date_modified: yesterday,
                amount: -500
            },
            {
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: tomorrow,
                amount: 500
            },
            {
                title: 'Test Transaction 3',
                description: 'Testing the transaction 3',
                date: dayAfterTomorrow,
                amount: -500
            },
            {
                title: 'Test Transaction 4',
                description: 'Testing the transaction 4',
                date: dayAfterTomorrow,
                amount: 1000
            }
        ];

        calculateBalances(transactions, 5000);

        expect(transactions[0].balance).toBe(5500);
        expect(transactions[1].balance).toBe(5000);
        expect(transactions[2].balance).toBe(4500);
        expect(transactions[3].balance).toBe(5500);
    });
});