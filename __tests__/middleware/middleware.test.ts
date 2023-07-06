import { jest } from '@jest/globals';
import { Response } from 'express';
import { QueryResultRow } from 'pg';
import { expenses, transactions } from '../../models/mockData';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };
    mockNext = jest.fn();
});

afterEach(() => {
    jest.resetModules();
});

/**
 * 
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (executeQueryValue: QueryResultRow[] | string, errorMessage?: string) => {
    const executeQuery = errorMessage
        ? jest.fn(() => Promise.reject(new Error(errorMessage)))
        : jest.fn(() => Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('getTransactionsByAccount', () => {
    it('gets transactions for a given account and date', async () => {
        mockModule(transactions);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockRequest.transaction).toEqual(transactions);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transactions' });
    });
});

describe('getExpensesByAccount', () => {
    it('gets expenses for a given account and date', async () => {
        mockModule(expenses);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        const expensesReturn = expenses.map(expense => ({
            ...expense,
            amount: expense.expense_amount
        }));


        expect(mockRequest.expenses).toEqual(expensesReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });
    });
});

// describe('getLoansByAccount', () => {
//     const mockRequest = () => {
//         const req = {};
//         req.query = {
//             account_id: '1',
//             from_date: '2023-06-01'
//         };
//         req.loans = jest.fn();
//         return req;
//     };

//     afterEach(() => {
//         jest.resetModules();
//     });

//     it('gets loans for a given account and date', async () => {
//         const mockLoans = [
//             { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
//             { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
//         ];

//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockResolvedValueOnce(mockLoans),
//             handleError: jest.fn()
//         }));

//         const { getLoansByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getLoansByAccount(req, res, mockNext);

//         expect(req.loans).toEqual(mockLoans);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('handles error if there is one', async () => {
//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
//             handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
//         }));

//         const { getLoansByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getLoansByAccount(req, res, mockNext);

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.json).toHaveBeenCalledWith({ message: 'Error getting loans' });
//     });
// });

// describe('getPayrollsMiddleware', () => {
//     const mockRequest = () => {
//         const req = {};
//         req.query = {
//             account_id: '1',
//             from_date: '2023-06-01'
//         };
//         req.payrolls = jest.fn();
//         return req;
//     };

//     afterEach(() => {
//         jest.resetModules();
//     });

//     it('gets payrolls for a given account and date', async () => {
//         const mockPayrolls = [
//             { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
//             { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
//         ];

//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockResolvedValueOnce(mockPayrolls),
//             handleError: jest.fn()
//         }));

//         const { getPayrollsMiddleware } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getPayrollsMiddleware(req, res, mockNext);

//         expect(req.payrolls).toEqual(mockPayrolls);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('handles error if there is one', async () => {
//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
//             handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
//         }));

//         const { getPayrollsMiddleware } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getPayrollsMiddleware(req, res, mockNext);

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.json).toHaveBeenCalledWith({ message: 'Error getting payrolls' });
//     });
// });

// describe('getWishlistsByAccount', () => {
//     const mockRequest = () => {
//         const req = {};
//         req.query = {
//             account_id: '1',
//             from_date: '2023-06-01'
//         };
//         req.wishlists = jest.fn();
//         return req;
//     };

//     afterEach(() => {
//         jest.resetModules();
//     });

//     it('gets wishlists for a given account and date', async () => {
//         const mockWishlists = [
//             { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
//             { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
//         ];

//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockResolvedValueOnce(mockWishlists),
//             handleError: jest.fn()
//         }));

//         const { getWishlistsByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getWishlistsByAccount(req, res, mockNext);

//         expect(req.wishlists).toEqual(mockWishlists);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('handles error if there is one', async () => {
//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
//             handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
//         }));

//         const { getWishlistsByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getWishlistsByAccount(req, res, mockNext);

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });
//     });
// });

// describe('getTransfersByAccount', () => {
//     const mockRequest = () => {
//         const req = {};
//         req.query = {
//             account_id: '1',
//             from_date: '2023-06-01'
//         };
//         req.transfers = jest.fn();
//         return req;
//     };

//     afterEach(() => {
//         jest.resetModules();
//     });

//     it('gets transfers for a given account and date', async () => {
//         const mockTransfers = [
//             { id: 1, account_id: '1', amount: 100, date: '2023-06-01' },
//             { id: 2, account_id: '1', amount: 200, date: '2023-06-02' }
//         ];

//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockResolvedValueOnce(mockTransfers),
//             handleError: jest.fn()
//         }));

//         const { getTransfersByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getTransfersByAccount(req, res, mockNext);

//         expect(req.transfers).toEqual(mockTransfers);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('handles error if there is one', async () => {
//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
//             handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
//         }));

//         const { getTransfersByAccount } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getTransfersByAccount(req, res, mockNext);

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.json).toHaveBeenCalledWith({ message: 'Error getting transfers' });
//     });
// });

// describe('getCurrentBalance', () => {
//     const mockRequest = () => {
//         const req = {};
//         req.query = {
//             account_id: '1',
//             from_date: '2023-06-01'
//         };
//         req.currentBalance = jest.fn();
//         return req;
//     };

//     afterEach(() => {
//         jest.resetModules();
//     });

//     it('gets current balance for a given account and date', async () => {
//         const mockCurrentBalance = [
//             { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' }
//         ];

//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockResolvedValueOnce(mockCurrentBalance),
//             handleError: jest.fn()
//         }));

//         const { getCurrentBalance } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getCurrentBalance(req, res, mockNext);

//         expect(req.currentBalance).toEqual(100);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('handles error if there is one', async () => {
//         jest.unstable_mockModule('../../utils/helperFunctions', () => ({
//             executeQuery: jest.fn().mockRejectedValueOnce(new Error('fake error')),
//             handleError: jest.fn().mockImplementation((response, message) => response.status(400).json({ message }))
//         }));

//         const { getCurrentBalance } = await import('../../middleware/middleware');

//         const req = mockRequest();
//         const res = mockResponse();

//         await getCurrentBalance(req, res, mockNext);

//         expect(res.status).toHaveBeenCalledWith(400);
//         expect(res.json).toHaveBeenCalledWith({ message: 'Error getting current balance' });
//     });
// });
