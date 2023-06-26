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

describe('getExpensesByAccount', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            to_date: '2023-06-01'
        };
        req.expenses = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets expenses for a given account and date', async () => {
        const mockExpenses = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockExpenses),
            handleError: jest.fn()
        }));

        const { getExpensesByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getExpensesByAccount(req, res, mockNext);

        expect(req.expenses).toEqual(mockExpenses);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getExpensesByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getExpensesByAccount(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });
    });
});

describe('getLoansByAccount', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.loans = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets loans for a given account and date', async () => {
        const mockLoans = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockLoans),
            handleError: jest.fn()
        }));

        const { getLoansByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getLoansByAccount(req, res, mockNext);

        expect(req.loans).toEqual(mockLoans);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getLoansByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getLoansByAccount(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting loans' });
    });
});

describe('getPayrollsMiddleware', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.payrolls = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets payrolls for a given account and date', async () => {
        const mockPayrolls = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockPayrolls),
            handleError: jest.fn()
        }));

        const { getPayrollsMiddleware } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getPayrollsMiddleware(req, res, mockNext);

        expect(req.payrolls).toEqual(mockPayrolls);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getPayrollsMiddleware } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getPayrollsMiddleware(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting payrolls' });
    });
});

describe('getWishlistsByAccount', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.wishlists = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets wishlists for a given account and date', async () => {
        const mockWishlists = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockWishlists),
            handleError: jest.fn()
        }));

        const { getWishlistsByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getWishlistsByAccount(req, res, mockNext);

        expect(req.wishlists).toEqual(mockWishlists);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getWishlistsByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getWishlistsByAccount(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });
    });
});

describe('getTransfersByAccount', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.transfers = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets transfers for a given account and date', async () => {
        const mockTransfers = [
            { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
            { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockTransfers),
            handleError: jest.fn()
        }));

        const { getTransfersByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getTransfersByAccount(req, res, mockNext);

        expect(req.transfers).toEqual(mockTransfers);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getTransfersByAccount } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getTransfersByAccount(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting transfers' });
    });
});

describe('getCurrentBalance', () => {
    const mockRequest = () => {
        const req = {};
        req.query = {
            account_id: '1',
            from_date: '2023-06-01'
        };
        req.currentBalance = jest.fn();
        return req;
    };

    afterEach(() => {
        jest.resetModules();
    });

    it('gets current balance for a given account and date', async () => {
        const mockCurrentBalance = [
            { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' }
        ];

        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockResolvedValueOnce(mockCurrentBalance),
            handleError: jest.fn()
        }));

        const { getCurrentBalance } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getCurrentBalance(req, res, mockNext);

        expect(req.currentBalance).toEqual(100);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        jest.unstable_mockModule('../../utils/helperFunctions', () => ({
            executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
            handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
        }));

        const { getCurrentBalance } = await import('../../middleware/middleware');

        const req = mockRequest();
        const res = mockResponse();

        await getCurrentBalance(req, res, mockNext);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error getting current balance' });
    });
});