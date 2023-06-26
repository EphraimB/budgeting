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
    it('should process transactions correctly', () => {
        // setup your data
        const mockRequest = {
            query: {
                from_date: '2023-07-01',
                to_date: '2023-08-01',
                account_id: 1,
            },
            currentBalance: 500,
            transaction: transactions.filter(transaction => transaction.account_id === 1),
            expenses: expenses.filter(expense => expense.account_id === 1),
            payrolls: payrolls.filter(payroll => payroll.account_id === 1),
            loans: loans.filter(loan => loan.account_id === 1),
            transfers: transfers.filter(transfer => transfer.account_id === 1),
            wishlists: wishlists.filter(wishlist => wishlist.account_id === 1),
        };

        const mockResponse = {};
        const next = jest.fn();

        // Call your function with the mock data
        generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toBeCalled();

        // assert that the current balance was updated correctly
        expect(mockRequest.currentBalance).toBe(500);
    });
});
