import { jest } from '@jest/globals';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
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
                transactions: [
                    {
                        id: '1',
                        title: 'Sample Transaction',
                        description: 'Sample Transaction',
                        date: '2023-07-01',
                        amount: 100,
                        tax_rate: 0,
                        total_amount: 100,
                    },
                ],
            },
        ],
        income: [
            {
                account_id: 1,
                income: [
                    {
                        income_id: 1,
                        income_title: 'Sample Income',
                        income_description: 'Sample Income',
                        income_amount: 100,
                        frequency_day_of_week: 4,
                        frequency_week_of_month: 1,
                        frequency_month_of_year: 7,
                        tax_rate: 0,
                        income_begin_date: '2023-07-01',
                    },
                ],
            },
        ],
        expenses: [
            {
                account_id: 1,
                expenses: [
                    {
                        expense_id: 1,
                        expense_title: 'Sample Expense',
                        expense_description: 'Sample Expense',
                        expense_amount: 100,
                        frequency_day_of_week: 4,
                        frequency_week_of_month: 1,
                        frequency_month_of_year: 7,
                        tax_rate: 0,
                        expense_begin_date: '2023-07-01',
                    },
                ],
            },
        ],
        payrolls: [
            {
                employee_id: 1,
                payroll: [
                    {
                        payroll_id: 1,
                        employee_id: 1,
                        gross_pay: 3000,
                        net_pay: 2000,
                        end_date: '2023-08-01',
                    },
                ],
            },
        ],
        loans: [
            {
                account_id: 1,
                loan: [
                    {
                        loan_id: 1,
                        loan_title: 'Sample Loan',
                        loan_description: 'Sample Loan',
                        loan_amount: 100,
                        frequency_day_of_week: 4,
                        frequency_week_of_month: 1,
                        frequency_month_of_year: 7,
                        tax_rate: 0,
                        loan_begin_date: '2023-07-01',
                    },
                ],
            },
        ],
        transfers: [
            {
                account_id: 1,
                transfer: [
                    {
                        transfer_id: 1,
                        source_account_id: 1,
                        destination_account_id: 2,
                        transfer_amount: 100,
                        frequency_day_of_week: 4,
                        frequency_week_of_month: 1,
                        frequency_month_of_year: 7,
                        tax_rate: 0,
                        transfer_begin_date: '2023-07-01',
                    },
                ],
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
                wishlist: [
                    {
                        wishlist_id: 1,
                        wishlist_title: 'Sample Wishlist',
                        wishlist_description: 'Sample Wishlist',
                        wishlist_amount: 100,
                        frequency_day_of_week: 4,
                        frequency_week_of_month: 1,
                        frequency_month_of_year: 7,
                        tax_rate: 0,
                        wishlist_begin_date: '2023-07-01',
                    },
                ],
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
