import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => {
    return {
        default: {
            query: jest.fn().mockReturnValue(Promise.resolve({ rows: [{}] })),
        },
    }
});

jest.unstable_mockModule('../../../models/queryData.js', () => {
    return {
        transactionQueries: {
            createTransaction: 'INSERT INTO transactions (account_id, amount, description) VALUES ($1, $2, $3) RETURNING *',
        },
    };
});

const { createTransaction } = await import('../../../bree/jobs/createTransaction.js');

describe('createTransaction', () => {
    it('should create two transactions successfully', async () => {
        const result = await createTransaction(1, 1000, 'Test Transaction');

        expect(result).toEqual([{}]); // adjust this expectation as needed
    });

    it('should throw an error if the first transaction fails', async () => {
        const transactionData = {
            account_id: 1,
            amount: 1000,
            description: 'Test Transaction',
            destination_account_id: 2,
        };

        const error = new Error('First transaction failed');
        pool.query.mockImplementation(() => Promise.reject(error));

        await expect(
            createTransaction(
                transactionData.account_id,
                transactionData.amount,
                transactionData.description,
                transactionData.destination_account_id
            )
        ).rejects.toThrow(error);
    });

    // ... more test cases ...
});
