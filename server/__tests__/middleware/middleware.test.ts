import MockDate from 'mockdate';
import {
    jest,
    beforeAll,
    afterAll,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

beforeAll(() => {
    MockDate.set('2020-01-01');
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
    mockNext = jest.fn();
});

afterEach(() => {
    jest.resetModules();
});

afterAll(() => {
    MockDate.reset();
});

const transactions: any[] = [
    {
        id: 'fw33e',
        account_id: 1,
        transaction_amount: 100,
        transaction_tax_rate: 0,
        total_amount: 100,
        date: '2023-06-01',
        title: 'Test',
        description: 'Test',
    },
];

const expenses: any[] = [
    {
        id: 'fw33e',
        expense_id: 1,
        account_id: 1,
        amount: 100,
        tax_rate: 0,
        subsidized: 0,
        total_amount: 100,
        date: '2023-06-01',
        title: 'Test',
        description: 'Test',
    },
];

const loans: any[] = [
    {
        loan_id: 1,
        account_id: 1,
        tax_id: 1,
        loan_amount: 100,
        amount: 100,
        loan_plan_amount: 100,
        loan_recipient: 'Test',
        loan_title: 'Test',
        loan_description: 'Test',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0,
        loan_begin_date: '2023-06-01',
        loan_end_date: '2023-06-01',
        date_created: '2023-06-01',
        date_modified: '2023-06-01',
    },
];

const payrolls: any[] = [
    {
        payroll_id: 1,
        employee_id: 1,
        account_id: 1,
        tax_id: 1,
        payroll_amount: 100,
        gross_pay: 150,
        net_pay: 100,
        payroll_title: 'Test',
        payroll_description: 'Test',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        payroll_begin_date: '2023-06-01',
        payroll_end_date: '2023-06-01',
        date_created: '2023-06-01',
        date_modified: '2023-06-01',
    },
];

const wishlists: any[] = [
    {
        wishlist_id: 1,
        wishlist_amount: 100,
        amount: 100,
        wishlist_title: 'Test',
        wishlist_description: 'Test',
        tax_rate: 0,
        date_created: '2023-06-01',
        date_modified: '2023-06-01',
    },
];

const transfers: any[] = [
    {
        transfer_id: 1,
        account_id: 1,
        transfer_amount: 100,
        transfer_title: 'Test',
        transfer_description: 'Test',
        date_created: '2023-06-01',
        date_modified: '2023-06-01',
    },
];

const commuteExpenses: any[] = [
    {
        commute_schedule_id: 1,
        commute_system_id: 1,
        account_id: 1,
        day_of_week: 1,
        commute_ticket_id: 1,
        start_time: '8:00',
        fare_cap_duration: 1,
        fare_amount: 2.9,
        pass: 'OMNY Single Ride',
    },
];

const fareCapping: any[] = [
    {
        commute_system_id: 1,
        system_name: 'OMNY',
        fare_cap: 33,
        current_spent: 0,
        fare_cap_duration: 1,
    },
];

const income: any[] = [
    {
        income_id: 1,
        account_id: 1,
        income_amount: 100,
        income_title: 'Test',
        income_description: 'Test',
        date_created: '2023-06-01',
        date_modified: '2023-06-01',
    },
];

describe('setQueries', () => {
    it('should set from_date and to_date', async () => {
        const { setQueries } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.from_date).toBeTruthy();
        expect(mockRequest.query.to_date).toBeTruthy();
        expect(mockNext).toBeCalled();
    });

    it('should set account_id when query contains id', async () => {
        mockModule([[{ account_id: 1 }], []]);

        const { setQueries } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.account_id).toEqual(1);
        expect(mockNext).toBeCalled();
    });

    it('should not set account_id when query does not contain id', async () => {
        const { setQueries } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, id: null };

        await setQueries(mockRequest, mockResponse, mockNext);

        expect(mockRequest.query.account_id).toBeNull();
        expect(mockNext).toBeCalled();
    });
});

describe('getTransactionsByAccount', () => {
    it('gets transactions for a given account and date', async () => {
        const mockAccount = [{ account_id: 1 }];

        mockModule([mockAccount, transactions]);

        const { getTransactionsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: 1, from_date: '2023-06-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        const transactionsReturn = {
            account_id: 1,
            transactions: transactions,
        };

        expect(mockRequest.transaction).toEqual([transactionsReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getTransactionsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transactions',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[]]);

        const { getTransactionsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([[{ account_id: 1 }], transactions]);

        const { getTransactionsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2020-01-01' };

        await getTransactionsByAccount(mockRequest, mockResponse, mockNext);

        const transactionsReturn = [
            {
                account_id: 1,
                transactions: transactions,
            },
        ];

        expect(mockRequest.transaction).toEqual(transactionsReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getExpensesByAccount', () => {
    it('gets expenses for a given account and date', async () => {
        mockModule([[{ tax_id: 1, rate: 0 }], [{ account_id: 1 }], expenses]);

        const { getExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        const expensesReturn = {
            account_id: 1,
            expenses: expenses,
        };

        expect(mockRequest.expenses).toEqual([expensesReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting expenses',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([
            [{ tax_id: 1, tax_rate: 0 }],
            [{ account_id: 1 }],
            expenses,
        ]);

        const { getExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getExpensesByAccount(mockRequest, mockResponse, mockNext);

        const expensesReturn = [
            {
                account_id: 1,
                expenses: expenses,
            },
        ];

        expect(mockRequest.expenses).toEqual(expensesReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getLoansByAccount', () => {
    it('gets loans for a given account and date', async () => {
        mockModule([[{ account_id: 1 }], loans]);

        const { getLoansByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        const loansReturn = {
            account_id: 1,
            loan: loans,
        };

        expect(mockRequest.loans).toEqual([loansReturn]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getLoansByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loans',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getLoansByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([[{ account_id: 1 }], loans]);

        const { getLoansByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getLoansByAccount(mockRequest, mockResponse, mockNext);

        const loansReturn = [
            {
                account_id: 1,
                loan: loans,
            },
        ];

        expect(mockRequest.loans).toEqual(loansReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getPayrollsMiddleware', () => {
    it('gets payrolls for a given account and date', async () => {
        mockModule([
            [{ account_id: 1 }],
            [{ account_id: 1, employee_id: 1 }],
            payrolls,
        ]);

        const { getPayrollsMiddleware } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        const returnPayrolls = {
            employee_id: 1,
            payroll: payrolls.map((payroll) => ({
                ...payroll,
                net_pay: payroll.net_pay,
            })),
        };

        expect(mockRequest.payrolls).toEqual([returnPayrolls]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getPayrollsMiddleware } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payrolls',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getPayrollsMiddleware } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([[{ account_id: 1, employee_id: 1 }], payrolls]);

        const { getPayrollsMiddleware } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getPayrollsMiddleware(mockRequest, mockResponse, mockNext);

        const returnPayrolls = [
            {
                employee_id: 1,
                payroll: payrolls.map((payroll) => ({
                    ...payroll,
                    net_pay: payroll.net_pay,
                })),
            },
        ];

        expect(mockRequest.payrolls).toEqual(returnPayrolls);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getWishlistsByAccount', () => {
    it('gets wishlists for a given account and date', async () => {
        mockModule([
            [{ tax_id: 1, tax_rate: 0 }],
            [{ account_id: 1 }],
            wishlists,
        ]);

        const { getWishlistsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        const wishlistsReturn = [
            {
                account_id: 1,
                wishlist: wishlists.map((wishlist) => ({
                    ...wishlist,
                    amount: wishlist.wishlist_amount,
                    tax_rate: 0,
                    wishlist_amount: wishlist.wishlist_amount,
                })),
            },
        ];

        expect(mockRequest.wishlists).toEqual(wishlistsReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getWishlistsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting wishlists',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getWishlistsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([
            [{ tax_id: 1, tax_rate: 0 }],
            [{ account_id: 1 }],
            wishlists,
        ]);

        const { getWishlistsByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getWishlistsByAccount(mockRequest, mockResponse, mockNext);

        const wishlistsReturn = wishlists.map((wishlist) => ({
            account_id: 1,
            wishlist: [
                {
                    ...wishlist,
                    amount: wishlist.wishlist_amount,
                    tax_rate: 0,
                    wishlist_amount: wishlist.wishlist_amount,
                },
            ],
        }));

        expect(mockRequest.wishlists).toEqual(wishlistsReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getTransfersByAccount', () => {
    it('gets transfers for a given account and date', async () => {
        mockModule([[{ account_id: 1 }], transfers]);

        const { getTransfersByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        const transfersReturn = [
            {
                account_id: 1,
                transfer: transfers.map((transfer) => ({
                    ...transfer,
                    amount: transfer.transfer_amount,
                })),
            },
        ];

        expect(mockRequest.transfers).toEqual(transfersReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getTransfersByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfers',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getTransfersByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([[{ account_id: 1 }], transfers]);

        const { getTransfersByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getTransfersByAccount(mockRequest, mockResponse, mockNext);

        const transfersReturn = [
            {
                account_id: 1,
                transfer: transfers.map((transfer) => ({
                    ...transfer,
                    amount: transfer.transfer_amount,
                })),
            },
        ];

        expect(mockRequest.transfers).toEqual(transfersReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getCommuteExpensesByAccount', () => {
    it('gets commute expenses for a given account and date', async () => {
        mockModule([[{ account_id: 1 }], commuteExpenses, fareCapping]);

        const { getCommuteExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCommuteExpensesByAccount(mockRequest, mockResponse, mockNext);

        const commuteExpensesReturn = [
            {
                account_id: 1,
                commute_expenses: commuteExpenses,
                fare_capping: fareCapping,
            },
        ];

        expect(mockRequest.commuteExpenses).toEqual(commuteExpensesReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getCommuteExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCommuteExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting commute expenses',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getCommuteExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getCommuteExpensesByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        mockModule([[{ account_id: 1 }], commuteExpenses, fareCapping]);

        const { getCommuteExpensesByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getCommuteExpensesByAccount(mockRequest, mockResponse, mockNext);

        const commuteExpensesReturn = [
            {
                account_id: 1,
                commute_expenses: commuteExpenses,
                fare_capping: fareCapping,
            },
        ];

        expect(mockRequest.commuteExpenses).toEqual(commuteExpensesReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('getCurrentBalance', () => {
    it('gets current balance for a given account and date', async () => {
        const mockCurrentBalance: any[] = [
            { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' },
        ];

        mockModule([[{ account_id: 1 }], mockCurrentBalance]);

        const { getCurrentBalance } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockRequest.currentBalance).toEqual([
            { account_id: 1, account_balance: 100 },
        ]);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { getCurrentBalance } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting current balance',
        });
    });

    it('should return a 404 when account_id is not found', async () => {
        mockModule([[], []]);

        const { getCurrentBalance } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '5', from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Account with ID 5 not found',
        );
    });

    it('should fetch all accounts if account_id is not provided', async () => {
        const mockCurrentBalance: any[] = [
            { id: 1, account_id: 1, account_balance: 100, date: '2023-06-01' },
        ];

        mockModule([[{ account_id: 1 }], mockCurrentBalance]);

        const { getCurrentBalance } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, from_date: '2023-06-01' };

        await getCurrentBalance(mockRequest, mockResponse, mockNext);

        expect(mockRequest.currentBalance).toEqual([
            { account_id: 1, account_balance: 100 },
        ]);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('updateWislistCron', () => {
    it('updates wishlist cron job', async () => {
        mockModule(
            [wishlists, [{ cron_job_id: 1 }], [{ tax_id: 1, tax_rate: 1 }], []],
            [],
            [[]],
            [[]],
        );
        const { updateWishlistCron } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.transactions = [
            {
                account_id: 1,
                transactions: wishlists,
            },
        ];

        await updateWishlistCron(mockRequest, mockResponse, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        // Arrange
        const errorMessage = 'Fake error';
        mockModule([], [errorMessage]);

        const { updateWishlistCron } = await import(
            '../../src/middleware/middleware.js'
        );

        await updateWishlistCron(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating cron tab',
        });
    });
});

describe('getIncomeByAccount', () => {
    it('gets income for a given account and date', async () => {
        mockModule([[{ tax_id: 1, tax_rate: 0 }], [{ account_id: 1 }], income]);

        const { getIncomeByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', to_date: '2023-06-01' };

        await getIncomeByAccount(mockRequest, mockResponse, mockNext);

        const incomeReturn = [
            {
                account_id: 1,
                income: income.map((income) => ({
                    ...income,
                    amount: income.income_amount,
                    tax_rate: 0,
                })),
            },
        ];

        expect(mockRequest.income).toEqual(incomeReturn);
        expect(mockNext).toHaveBeenCalled();
    });

    it('handles error if there is one', async () => {
        mockModule([[{ account_id: 1 }]], ['Fake error']);

        const { getIncomeByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: '1', to_date: '2023-06-01' };

        await getIncomeByAccount(mockRequest, mockResponse, mockNext);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income',
        });
    });

    it('should fetch accounts if account_id is not provided', async () => {
        mockModule([[{ tax_id: 1, rate: 0 }], [{ account_id: 1 }], income]);

        const { getIncomeByAccount } = await import(
            '../../src/middleware/middleware.js'
        );

        mockRequest.query = { account_id: null, to_date: '2023-06-01' };

        await getIncomeByAccount(mockRequest, mockResponse, mockNext);

        const incomeReturn = [
            {
                account_id: 1,
                income: income.map((income) => ({
                    ...income,
                    amount: income.income_amount,
                    tax_rate: 0,
                })),
            },
        ];

        expect(mockRequest.income).toEqual(incomeReturn);
        expect(mockNext).toHaveBeenCalled();
    });
});
