import { jest } from '@jest/globals';
import { transactions, expenses, payrolls, loans, transfers, wishlists } from '../../models/mockData';
import MockDate from 'mockdate';
import { GeneratedTransaction } from '../../types/types';


beforeAll(() => {
    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery: jest.fn()
            .mockImplementationOnce(() => Promise.resolve([
                {
                    account_id: 1,
                    account_balance: 500
                }
            ]))
            .mockImplementationOnce(() => Promise.resolve([
                {
                    account_id: 1,
                    employee_id: 1
                }
            ]))
    }));

    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
    jest.resetModules();
});

describe('generateTransactions', () => {
    let mockRequest: any;
    let mockResponse: any;
    let next: any;

    beforeEach(() => {
        // setup your data
        mockRequest = {
            query: {
                from_date: '2023-07-01',
                to_date: '2023-08-01',
                account_id: 1
            },
            currentBalance: [
                {
                    account_id: 1,
                    account_balance: 500
                }
            ],
            transaction: [{ account_id: 1, transactions: transactions.filter(transaction => transaction.account_id === 1) }],
            expenses: [{ account_id: 1, expenses: expenses.filter(expense => expense.account_id === 1) }],
            payrolls: [{ employee_id: 1, payroll: payrolls }],
            loans: [{ account_id: 1, loan: loans.filter(loan => loan.account_id === 1) }],
            transfers: [{ account_id: 1, transfer: transfers.filter(transfer => transfer.account_id === 1) }],
            wishlists: [{ account_id: 1, wishlist: wishlists.filter(wishlist => wishlist.account_id === 1) }]
        };

        mockResponse = {};
        next = jest.fn();
    });

    it('should process transactions correctly', async () => {
        const { default: generateTransactions } = await import('../../generation/generateTransactions');

        try {
            // Call your function with the mock data
            generateTransactions(mockRequest, mockResponse, next);

            // assert that next was called
            expect(next).toHaveBeenCalled();

            expect(mockRequest.transaction[0].transactions).toHaveLength(4);

            expect(mockRequest.currentBalance).toStrictEqual([{ account_id: 1, account_balance: 500 }]);

            // assert end state of request object
            // add checks for any additional properties or state you expect mockRequest to have after generateTransactions
            expect(mockRequest.expenses[0].expenses).toEqual(expenses.filter(expense => expense.account_id === 1));
            expect(mockRequest.payrolls[0].payroll).toEqual(payrolls);
            expect(mockRequest.loans[0].loan).toEqual(loans.filter(loan => loan.account_id === 1));
            expect(mockRequest.transfers[0].transfer).toEqual(transfers.filter(transfer => transfer.account_id === 1));
            expect(mockRequest.wishlists[0].wishlist).toEqual(wishlists.filter(wishlist => wishlist.account_id === 1));
        } catch (error) {
            console.error(error);
        }
    });

    it('should make sure that transactions are sorted by date', async () => {
        const { default: generateTransactions } = await import('../../generation/generateTransactions');

        // Call your function with the mock data
        generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        // expect(next).toHaveBeenCalled();

        // assert that transactions are ordered by date
        const sortedTransactions: GeneratedTransaction[] = [...mockRequest.transaction].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        expect(mockRequest.transaction).toEqual(sortedTransactions);
    });

    it('should process transactions correctly when an account_id is not provided', async () => {
        const { default: generateTransactions } = await import('../../generation/generateTransactions');

        mockRequest.query = { account_id: null, from_date: '2023-07-01', to_date: '2023-08-01' };

        // Call your function with the mock data
        try {
            await generateTransactions(mockRequest, mockResponse, next);

            // assert that next was called
            expect(next).toHaveBeenCalled();

            expect(mockRequest.transaction[0].transactions).toHaveLength(4);

            expect(mockRequest.currentBalance).toStrictEqual([{ account_id: 1, account_balance: 500 }]);

            // assert end state of request object
            // add checks for any additional properties or state you expect mockRequest to have after generateTransactions
            expect(mockRequest.expenses[0].expenses).toEqual(expenses.filter(expense => expense.account_id === 1));
            expect(mockRequest.payrolls[0].payroll).toEqual(payrolls);
            expect(mockRequest.loans[0].loan).toEqual(loans.filter(loan => loan.account_id === 1));
            expect(mockRequest.transfers[0].transfer).toEqual(transfers.filter(transfer => transfer.account_id === 1));
            expect(mockRequest.wishlists[0].wishlist).toEqual(wishlists.filter(wishlist => wishlist.account_id === 1));
        } catch (error) {
            console.error(error);
        }
    });
});
