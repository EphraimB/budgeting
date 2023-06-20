import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    default: {
        query: jest.fn()
            .mockImplementation((query, values, callback) => {
                if (values.includes(-1000)) {
                    // Simulate error case for negative amount transaction
                    callback(new Error('Transaction failed'));
                } else {
                    // Simulate success case
                    callback(null, { rows: [{}] });
                }
            }),
    },
}));

jest.unstable_mockModule('../../../models/queryData.js', () => ({
    transactionQueries: {
        createTransaction: 'INSERT INTO transactions (account_id, amount, description) VALUES ($1, $2, $3) RETURNING *',
    },
}));

const { createTransaction } = await import('../../../bree/jobs/createTransaction.js');

describe('createTransaction', () => {

    it('should create a transaction successfully', async () => {
        const result = await createTransaction(1, 1000, 'Test Transaction');
        expect(result).toEqual([{}]); // adjust this expectation as needed
    });

    it('should throw an error if the transaction fails', async () => {
        await expect(createTransaction(2, -1000, 'Test Transaction'))
            .rejects.toThrow('Transaction failed');
    });
});
