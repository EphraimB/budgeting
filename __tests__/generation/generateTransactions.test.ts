import { jest } from '@jest/globals';
import generateTransactions from '../../generation/generateTransactions';
import { transactions, expenses, payrolls, loans, transfers, wishlists } from '../../models/mockData';
import MockDate from 'mockdate';

beforeAll(() => {
    MockDate.set('2023-07-01');
});

afterAll(() => {
    MockDate.reset();
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
            currentBalance: 500,
            transaction: transactions.filter(transaction => transaction.account_id === 1),
            expenses: expenses.filter(expense => expense.account_id === 1),
            payrolls: payrolls,
            loans: loans.filter(loan => loan.account_id === 1),
            transfers: transfers.filter(transfer => transfer.account_id === 1),
            wishlists: wishlists.filter(wishlist => wishlist.account_id === 1)
        };

        mockResponse = {};
        next = jest.fn();
    });

    it('should process transactions correctly', () => {
        // Call your function with the mock data
        generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toHaveBeenCalled();

        expect(mockRequest.transaction).toHaveLength(4);

        expect(mockRequest.currentBalance).toBe(500);

        // assert end state of request object
        // add checks for any additional properties or state you expect mockRequest to have after generateTransactions
        expect(mockRequest.expenses).toEqual(expenses.filter(expense => expense.account_id === 1));
        expect(mockRequest.payrolls).toEqual(payrolls);
    });

    it('should make sure that transactions are sorted by date', () => {
        // Call your function with the mock data
        generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toHaveBeenCalled();

        // assert that transactions are ordered by date
        const sortedTransactions = [...mockRequest.transaction].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        expect(mockRequest.transaction).toEqual(sortedTransactions);
    });
});
