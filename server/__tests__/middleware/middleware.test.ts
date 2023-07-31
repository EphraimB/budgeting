import { jest } from '@jest/globals';
import e, { Response } from 'express';
import { QueryResultRow } from 'pg';
import { expenses, loans, payrolls, transactions, transfers, wishlists } from '../../models/mockData';
import MockDate from 'mockdate';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

beforeAll(() => {
    MockDate.set('2020-01-01');

    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
    MockDate.reset();
});

/**
 * 
 * @param getAccountsValue - The value to be returned by the executeQuery mock function
 * @param getTransactionsDateMiddlewareValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @param [getEmployeeValue] - The value to be returned by the executeQuery mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (getAccountsValue: QueryResultRow[], getTransactionsDateMiddlewareValue: QueryResultRow[], errorMessage?: string | null, getEmployeeValue?: QueryResultRow[], getTaxRate?: QueryResultRow[]) => {
    const executeQuery = jest.fn();

    if (errorMessage) {
        executeQuery.mockImplementation(() => {
            throw new Error(errorMessage);
        });
    } else if (getEmployeeValue) {
        executeQuery
            .mockImplementationOnce(() => Promise.resolve(getAccountsValue))
            .mockImplementationOnce(() => Promise.resolve(getEmployeeValue))
            .mockImplementationOnce(() => Promise.resolve(getTransactionsDateMiddlewareValue))
            .mockImplementationOnce(() => Promise.resolve(getTaxRate));
    } else {
        executeQuery
            .mockImplementationOnce(() => Promise.resolve(getAccountsValue))
            .mockImplementationOnce(() => Promise.resolve(getTransactionsDateMiddlewareValue));
    }

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('setQueries', () => {
    it('should set from_date and to_date', async () => {
        const { setQueries } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: 1, id: 1 };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.from_date).toBeTruthy();
        expect(mockRequest.query.to_date).toBeTruthy();
        expect(mockNext).toBeCalled();
    });

    it('should set account_id when query contains id', async () => {
        mockModule([{ account_id: 1 }], []);

        const { setQueries } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, id: 1 };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.account_id).toEqual(1);
        expect(mockNext).toBeCalled();
    });

    it('should not set account_id when query does not contain id', async () => {
        const { setQueries } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, id: null };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.account_id).toBeNull();
        expect(mockNext).toBeCalled();
    });
});

describe('getTransactionsByAccount', () => {
    it('gets transactions for a given account and date', async () => {
        const mockAccount = [{ account_id: 1 }];
        mockModule(mockAccount, transactions);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: 1, from_date: '2023-06-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        const transactionsReturn = {
            account_id: 1,
            transactions: transactions.map(transaction => ({
                ...transaction,
                transaction_amount: transaction.transaction_amount
            }))
        };

        expect(mockRequest.transaction).toEqual([transactionsReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transactions' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ account_id: 1 }], transactions);

        const { getTransactionsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        const transactionsReturn = [
            {
                account_id: 1,
                transactions: transactions.filter(t => t.account_id === 1).map(transaction => ({
                    ...transaction,
                    transaction_amount: transaction.transaction_amount
                }))
            }
        ];

        expect(mockRequest.transaction).toEqual(transactionsReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getExpensesByAccount', () => {
    it('gets expenses for a given account and date', async () => {
        mockModule([{ tax_rate: 0 }], expenses, null, [{ account_id: 1 }]);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        const expensesReturn = {
            account_id: 1,
            expenses: expenses.map(expense => ({
                ...expense,
                amount: expense.expense_amount,
                tax_rate: 0,
                expense_amount: expense.expense_amount
            }))
        };

        expect(mockRequest.expenses).toEqual([expensesReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting expenses' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ tax_rate: 0 }], expenses, null, [{ account_id: 1 }]);

        const { getExpensesByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        const expensesReturn = [
            {
                account_id: 1,
                expenses: expenses.filter(e => e.account_id === 1).map(expense => ({
                    ...expense,
                    amount: expense.expense_amount,
                    tax_rate: 0
                }))
            }
        ];

        expect(mockRequest.expenses).toEqual(expensesReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getLoansByAccount', () => {
    it('gets loans for a given account and date', async () => {
        mockModule([{ account_id: 1 }], loans);

        const { getLoansByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        const loansReturn = {
            account_id: 1,
            loan: loans.map(loan => ({
                ...loan,
                amount: loan.loan_plan_amount
            }))
        };

        expect(mockRequest.loans).toEqual([loansReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getLoansByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loans' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getLoansByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ account_id: 1 }], loans);

        const { getLoansByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        const loansReturn = [
            {
                account_id: 1,
                loan: loans.filter(l => l.account_id === 1).map(loan => ({
                    ...loan,
                    amount: loan.loan_plan_amount
                }))
            }
        ];

        expect(mockRequest.loans).toEqual(loansReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getPayrollsMiddleware', () => {
    it('gets payrolls for a given account and date', async () => {
        mockModule([{ account_id: 1 }], payrolls, null, [{ employee_id: 1 }]);

        const { getPayrollsMiddleware } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        const returnPayrolls = {
            employee_id: 1,
            payroll: payrolls.map(payroll => ({
                ...payroll,
                net_pay: payroll.net_pay
            }))
        };


        expect(mockRequest.payrolls).toEqual([returnPayrolls]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getPayrollsMiddleware } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payrolls' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getPayrollsMiddleware } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ account_id: 1, employee_id: 1 }], payrolls);

        const { getPayrollsMiddleware } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        const returnPayrolls = [
            {
                employee_id: 1,
                payroll: payrolls.map(payroll => ({
                    ...payroll,
                    net_pay: payroll.net_pay
                }))
            }
        ];

        expect(mockRequest.payrolls).toEqual(returnPayrolls);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getWishlistsByAccount', () => {
    it('gets wishlists for a given account and date', async () => {
        mockModule([{ tax_rate: 0 }], wishlists, null, [{ account_id: 1 }]);

        const { getWishlistsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        const wishlistsReturn = wishlists.map(wishlist => ({
            account_id: wishlist.account_id,
            wishlist: [
                {
                    ...wishlist,
                    amount: wishlist.wishlist_amount,
                    tax_rate: 0,
                    wishlist_amount: wishlist.wishlist_amount
                }
            ]
        }));

        expect(mockRequest.wishlists).toEqual(wishlistsReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getWishlistsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting wishlists' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getWishlistsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ tax_rate: 0 }], wishlists, null, [{ account_id: 1 }]);

        const { getWishlistsByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        const wishlistsReturn = wishlists.map(wishlist => ({
            account_id: wishlist.account_id,
            wishlist: [
                {
                    ...wishlist,
                    amount: wishlist.wishlist_amount,
                    tax_rate: 0,
                    wishlist_amount: wishlist.wishlist_amount
                }
            ]
        }));

        expect(mockRequest.wishlists).toEqual(wishlistsReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getTransfersByAccount', () => {
    it('gets transfers for a given account and date', async () => {
        mockModule([{ account_id: 1 }], transfers);

        const { getTransfersByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        const transfersReturn = [
            {
                account_id: 1,
                transfer: transfers.map(transfer => ({
                    ...transfer,
                    amount: transfer.transfer_amount
                }))
            }
        ];

        expect(mockRequest.transfers).toEqual(transfersReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getTransfersByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfers' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getTransfersByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([{ account_id: 1 }], transfers);

        const { getTransfersByAccount } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        const transfersReturn = [
            {
                account_id: 1,
                transfer: transfers.map(transfer => ({
                    ...transfer,
                    amount: transfer.transfer_amount
                }))
            }
        ];

        expect(mockRequest.transfers).toEqual(transfersReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getCurrentBalance', () => {

    it('gets current balance for a given account and date', async () => {
        const mockCurrentBalance: any[] = [
            { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' }
        ];

        mockModule([{ account_id: 1 }], mockCurrentBalance);

        const { getCurrentBalance } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockRequest.currentBalance).toEqual([{ account_id: 1, account_balance: 100 }]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { getCurrentBalance } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting current balance' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([], []);

        const { getCurrentBalance } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Account with ID 5 not found');
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        const mockCurrentBalance: any[] = [
            { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' }
        ];

        mockModule([{ account_id: 1 }], mockCurrentBalance);

        const { getCurrentBalance } = await import('../../middleware/middleware.js');

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockRequest.currentBalance).toEqual([{ account_id: 1, account_balance: 100 }]);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('updateWislistCron', () => {
    it('updates wishlist cron job', async () => {
        mockModule(wishlists, [{ tax_rate: 1 }], null, []);
        const { updateWishlistCron } = await import('../../middleware/middleware.js');

        mockRequest.transactions = [
            {
                account_id: 1,
                transactions: [
                    {
                        wishlist_id: 1,
                        amount: 100,
                        tax_rate: 0,
                        total_amount: 100,
                        date: '2023-06-01',
                        title: 'Test',
                        description: 'Test'
                    }
                ]
            }
        ];

        await updateWishlistCron(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        const error = new Error(errorMessage);
        mockModule([], [], errorMessage);

        const { updateWishlistCron } = await import('../../middleware/middleware.js');

        await updateWishlistCron(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating cron tab' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});
