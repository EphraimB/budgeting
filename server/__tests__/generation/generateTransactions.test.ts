import { jest } from '@jest/globals';
import {
    transactions,
    expenses,
    payrolls,
    loans,
    transfers,
    wishlists,
    income,
} from '../../models/mockData';
import MockDate from 'mockdate';
import { type GeneratedTransaction } from '../../types/types';

let mockRequest: any;
let mockResponse: any;
let next: any;

beforeAll(() => {
    MockDate.set('2020-01-01');

    jest.mock('../../utils/helperFunctions', () => ({
        executeQuery: jest.fn().mockImplementation(
            async () =>
                await Promise.resolve([
                    {
                        account_id: 1,
                        employee_id: 1,
                    },
                ]),
        ),
    }));

    // setup your data
    mockRequest = {
        query: {
            from_date: '2023-07-01',
            to_date: '2023-08-01',
            account_id: 1,
        },
        currentBalance: [
            {
                account_id: 1,
                account_balance: 500,
            },
        ],
        transaction: [
            {
                account_id: 1,
                transactions: transactions.filter(
                    (transaction) => transaction.account_id === 1,
                ),
            },
        ],
        income: [
            {
                account_id: 1,
                income: income.filter((income) => income.account_id === 1),
            },
        ],
        expenses: [
            {
                account_id: 1,
                expenses: expenses.filter(
                    (expense) => expense.account_id === 1,
                ),
            },
        ],
        payrolls: [{ employee_id: 1, payroll: payrolls }],
        loans: [
            {
                account_id: 1,
                loan: loans.filter((loan) => loan.account_id === 1),
            },
        ],
        transfers: [
            {
                account_id: 1,
                transfer: transfers.filter(
                    (transfer) => transfer.source_account_id === 1,
                ),
            },
        ],
        commuteExpenses: [
            {
                account_id: 1,
                commute_expenses: [
                    {
                        commute_schedule_id: 1,
                        commute_system_id: 1,
                        title: 'Sample Pass',
                        description: 'Sample Pass pass',
                        day_of_week: 4,
                        start_time: '08:00',
                        amount: -100,
                        tax_rate: 0,
                        total_amount: -100,
                    },
                ],
                fare_capping: [
                    {
                        commute_system_id: 1,
                        system_name: 'Sample System',
                        fare_cap: 100,
                        fare_cap_duration: 1,
                    },
                ],
            },
        ],
        wishlists: [
            {
                account_id: 1,
                wishlist: wishlists.filter(
                    (wishlist) => wishlist.account_id === 1,
                ),
            },
        ],
    };

    mockResponse = {};
    next = jest.fn();
});

afterAll(() => {
    MockDate.reset();
    jest.resetModules();
});

describe('generateTransactions', () => {
    it('should process transactions correctly', async () => {
        const { default: generateTransactions } = await import(
            '../../generation/generateTransactions'
        );

        // Call your function with the mock data
        await generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toHaveBeenCalled();

        expect(mockRequest.transaction[0].transactions).toHaveLength(4);

        expect(mockRequest.currentBalance).toStrictEqual([
            { account_id: 1, account_balance: 500 },
        ]);

        // assert end state of request object
        // add checks for any additional properties or state you expect mockRequest to have after generateTransactions
        expect(mockRequest.expenses[0].expenses).toEqual(
            expenses.filter((expense) => expense.account_id === 1),
        );
        expect(mockRequest.payrolls[0].payroll).toEqual(payrolls);
        expect(mockRequest.loans[0].loan).toEqual(
            loans.filter((loan) => loan.account_id === 1),
        );
        expect(mockRequest.transfers[0].transfer).toEqual(
            transfers.filter((transfer) => transfer.source_account_id === 1),
        );
        expect(mockRequest.wishlists[0].wishlist).toEqual(
            wishlists.filter((wishlist) => wishlist.account_id === 1),
        );
    });

    it('should make sure that transactions are sorted by date', async () => {
        const { default: generateTransactions } = await import(
            '../../generation/generateTransactions'
        );

        // Call your function with the mock data
        await generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toHaveBeenCalled();

        // assert that transactions are ordered by date
        const sortedTransactions: GeneratedTransaction[] = [
            ...mockRequest.transaction,
        ].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        expect(mockRequest.transaction).toEqual(sortedTransactions);
    });

    it('should process transactions correctly when an account_id is not provided', async () => {
        const { default: generateTransactions } = await import(
            '../../generation/generateTransactions'
        );

        mockRequest.query = {
            account_id: null,
            from_date: '2023-07-01',
            to_date: '2023-08-01',
        };

        // Call your function with the mock data
        await generateTransactions(mockRequest, mockResponse, next);

        // assert that next was called
        expect(next).toHaveBeenCalled();

        expect(mockRequest.transaction[0].transactions).toHaveLength(4);

        expect(mockRequest.currentBalance).toStrictEqual([
            { account_id: 1, account_balance: 500 },
        ]);

        // assert end state of request object
        // add checks for any additional properties or state you expect mockRequest to have after generateTransactions
        expect(mockRequest.expenses[0].expenses).toEqual(
            expenses.filter((expense) => expense.account_id === 1),
        );
        expect(mockRequest.payrolls[0].payroll).toEqual(payrolls);
        expect(mockRequest.loans[0].loan).toEqual(
            loans.filter((loan) => loan.account_id === 1),
        );
        expect(mockRequest.transfers[0].transfer).toEqual(
            transfers.filter((transfer) => transfer.source_account_id === 1),
        );
        expect(mockRequest.wishlists[0].wishlist).toEqual(
            wishlists.filter((wishlist) => wishlist.account_id === 1),
        );
    });
});
