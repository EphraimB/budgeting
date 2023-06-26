import { jest } from '@jest/globals';

jest.unstable_mockModule('../../../config/db.js', () => ({
    default: {
        query: jest.fn()
            .mockImplementation((query, values, callback) => {
                if (values[0] === 3) {
                    callback(new Error('Transaction failed'));
                } else {
                    callback(null, { rows: [{}] });
                }
            })
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

    it('should create a transaction successfully with a destination account', async () => {
        const result = await createTransaction(1, 1000, 'Test Transaction', 2);
        expect(result).toEqual([{}]); // adjust this expectation as needed
    });

    it('should throw an error if the transaction fails', async () => {
        await expect(createTransaction(3, -1000, 'Test Transaction'))
            .rejects.toThrow('Transaction failed');
    });
});
