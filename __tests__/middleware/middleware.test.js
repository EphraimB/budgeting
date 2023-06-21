import { jest } from '@jest/globals';

const mockResponse = () => {
    const res = {};
    res.send = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
};

const mockNext = jest.fn();

describe('getTransactionsByAccount', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.transaction = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets transactions for a given account and date', async () => {
        const mockTransactions = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockTransactions),
            handleError: jest.fn()
        }));

        const { getTransactionsByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getTransactionsByAccount(req, res, mockNext);

        expect(req.transaction).toEqual(mockTransactions);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getTransactionsByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getTransactionsByAccount(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting transactions' });
    });
});
