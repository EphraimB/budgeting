const request = require("supertest");
const app = require("../app");
const PgMock2 = require('pgmock2').default;
const mockClient = new PgMock2();
const queries = require('../queries');

// Create a mock accounts object
const mockAccounts = {
    account_id: 1,
    account_name: 'Test Account',
    account_type: 0,
    account_balance: 1000,
    date_created: '2020-01-01',
    date_modified: '2020-01-01'
};

const mockDeposits = {
    deposit_id: 1,
    account_id: 1,
    deposit_amount: 1000,
    deposit_description: 'Test Deposit',
    date_created: '2020-01-01',
    date_modified: '2020-01-01'
};

const mockWithdrawals = {
    withdrawal_id: 1,
    account_id: 1,
    withdrawal_amount: 1000,
    withdrawal_description: 'Test Withdrawal',
    date_created: '2020-01-01',
    date_modified: '2020-01-01'
};

const mockExpenses = {
    expense_id: 1,
    account_id: 1,
    expense_amount: 50,
    expense_title: 'Test Expense',
    expense_description: 'Test Expense to test the expense route',
    frequency: 0,
    expense_begin_date: '2020-01-01',
    expense_end_date: null,
    date_created: '2020-01-01',
    date_modified: '2020-01-01'
};

const mockLoans = {
    loan_id: 1,
    account_id: 1,
    loan_amount: 1000,
    loan_plan_amount: 100,
    loan_recipient: 'Test Loan Recipient',
    loan_title: 'Test Loan',
    loan_description: 'Test Loan to test the loan route',
    frequency: 0,
    loan_begin_date: '2020-01-01',
    date_created: '2020-01-01',
    date_modified: '2020-01-01'
};

// Add the mock accounts object to the mock pool
mockClient.add('SELECT * FROM accounts WHERE account_id = $1', [1], {
    rowCount: 1,
    rows: [mockAccounts]
});

// Replace the real PostgreSQL client with the mock client in your tests
jest.mock('../db', () => {
    query: jest.fn().mockImplementation((sql, params) => {
        return mockPool.query(sql, params);
    })
});

describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe("Test the accounts path", () => {
    beforeAll(() => {
        mockClient.connect();
    });

    test("It should response the GET method", async () => {
        mockClient.query('SELECT * FROM accounts WHERE account_id = $1', [1], {
            rowCount: 1,
            rows: [mockAccounts]
        });
    });
});