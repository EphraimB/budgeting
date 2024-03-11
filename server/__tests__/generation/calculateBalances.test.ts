import { type GeneratedTransaction } from '../../src/types/types.js';
import calculateBalances from '../../src/generation/calculateBalances.js';
import dayjs from 'dayjs';
import { describe, it, expect } from '@jest/globals';

describe('calculateBalances', () => {
    it('should calculate the balance for each transaction with no past transactions', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: dayjs().add(1, 'day'),
                amount: 500,
                tax_rate: 0.2,
                total_amount: 400,
            },
            {
                id: 'f34t4fe',
                title: 'Test Transaction 3',
                description: 'Testing the transaction 3',
                date: dayjs().add(2, 'day'),
                amount: -500,
                tax_rate: 0.2,
                total_amount: -600,
            },
            {
                id: 'f34t4df',
                title: 'Test Transaction 4',
                description: 'Testing the transaction 4',
                date: dayjs().add(2, 'day'),
                amount: 1000,
                tax_rate: 0.2,
                total_amount: 1200,
            },
        ];

        calculateBalances(transactions, 5000);

        expect(transactions[0].balance).toBe(5400);
        expect(transactions[1].balance).toBe(4800);
        expect(transactions[2].balance).toBe(6000);
    });

    it('should calculate the balance for each transaction with past transactions', () => {
        const transactions: GeneratedTransaction[] = [
            {
                id: '3fv423fv',
                transaction_id: 1,
                title: 'Test Transaction',
                description: 'Testing the transaction',
                date: dayjs().subtract(1, 'week'),
                date_modified: dayjs().subtract(1, 'week'),
                amount: 1000,
                tax_rate: 0.2,
                total_amount: 1200,
            },
            {
                id: 'f34t4fe',
                transaction_id: 2,
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: dayjs().subtract(1, 'day'),
                date_modified: dayjs().subtract(1, 'day'),
                amount: -500,
                tax_rate: 0.2,
                total_amount: -600,
            },
            {
                id: 'f34t4df',
                title: 'Test Transaction 2',
                description: 'Testing the transaction 2',
                date: dayjs().add(1, 'day'),
                amount: 500,
                tax_rate: 0.2,
                total_amount: 400,
            },
            {
                id: 'f34t4dd',
                title: 'Test Transaction 3',
                description: 'Testing the transaction 3',
                date: dayjs().add(2, 'day'),
                amount: -500,
                tax_rate: 0.2,
                total_amount: -600,
            },
            {
                id: 'f34t4dz',
                title: 'Test Transaction 4',
                description: 'Testing the transaction 4',
                date: dayjs().add(2, 'day'),
                amount: 1000,
                tax_rate: 0.2,
                total_amount: 1200,
            },
        ];

        calculateBalances(transactions, 5000);

        expect(transactions[0].balance).toBe(5600);
        expect(transactions[1].balance).toBe(5000);
        expect(transactions[2].balance).toBe(5400);
        expect(transactions[3].balance).toBe(4800);
        expect(transactions[4].balance).toBe(6000);
    });
});
