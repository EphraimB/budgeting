import { type GeneratedTransaction } from '../../src/types/types';
import {
    generateDailyLoans,
    generateMonthlyLoans,
    generateWeeklyLoans,
    generateYearlyLoans,
    calculateInterest,
} from '../../src/generation/generateLoans';
import {
    describe,
    it,
    expect,
    beforeEach,
    beforeAll,
    afterAll,
} from '@jest/globals';
import MockDate from 'mockdate';
import dayjs, { Dayjs } from 'dayjs';

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

let transactions: GeneratedTransaction[];
let skippedTransactions: GeneratedTransaction[];

beforeEach(() => {
    transactions = [];
    skippedTransactions = [];
});

describe('Test generateDailyLoans', () => {
    it('Should generate daily loans correctly', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-01-06');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateDailyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-06').toISOString().slice(0, 10),
        );
    });

    it('Should generate daily loans correctly every 2 days', () => {
        // Preparing the test data
        const loan: any = {
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_type_variable: 2,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-01-07');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateDailyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-07').toISOString().slice(0, 10),
        );
    });

    it('Should generate daily loans correctly when the loan begin date is less than the from date', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0.05,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-01-08');
        const fromDate: Dayjs = dayjs('2020-01-06');

        // Running the function
        generateDailyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(5);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-08').toISOString().slice(0, 10),
        );
    });

    it('should generate daily loans with yearly interest', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0.05,
            loan_interest_frequency_type: 3,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-01-06');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateDailyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);

        expect(transactions[0].title).toBe('Test Loan loan to Test Recipient');
        expect(transactions[0].description).toBe('Test Description');
        expect(transactions[2].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-06').toISOString().slice(0, 10),
        );
    });
});

describe('Test generateMonthlyLoans', () => {
    it('Should generate monthly loans correctly', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-06-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateMonthlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-06-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate monthly loans correctly every 2 months', () => {
        // Preparing the test data
        const loan: any = {
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            frequency_type_variable: 2,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-08-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateMonthlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-07-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate monthly loans correctly when the loan begin date is less than the from date', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-09-02');
        const fromDate: Dayjs = dayjs('2020-06-02');

        // Running the function
        generateMonthlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(6);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-09-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate monthly loans correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            frequency_day_of_week: 2,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-06-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateMonthlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );
        let toBeEndDate: Dayjs = dayjs('2020-01-01').add(5, 'month');

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number =
            (7 + TUESDAY - toBeEndDate.day()) % 7;

        toBeEndDate = toBeEndDate.add(daysUntilNextTuesday, 'day');

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            toBeEndDate.toISOString().slice(0, 10),
        );
    });

    it('Should generate monthly loans correctly when the frequency week of month is set', () => {
        // Preparing the test data
        const loan: any = {
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_type_variable: 1,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-06-01');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateMonthlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each month)
        transactions.forEach((transaction, i) => {
            const transactionDate: Dayjs = dayjs(transaction.date);
            expect(transactionDate.day()).toBe(loan.frequency_day_of_week);

            const secondWeekOfMonth: boolean =
                Math.floor((transactionDate.date() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Since we start from the current month and increment each month
            const expectedMonth: number = (fromDate.month() + i) % 12;
            expect(transactionDate.month()).toBe(expectedMonth);
        });
    });
});

describe('generateWeeklyLoans', () => {
    it('Should generate weekly loans correctly', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-02-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateWeeklyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-29').toISOString().slice(0, 10),
        );
    });

    it('Should generate weekly loans every 2 weeks', () => {
        // Preparing the test data
        const loan: any = {
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_type_variable: 2,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-02-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateWeeklyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-01-29').toISOString().slice(0, 10),
        );
    });

    it('Should generate weekly loans correctly when the loan begin date is less than the from date', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-02-15');
        const fromDate: Dayjs = dayjs('2020-01-28');

        // Running the function
        generateWeeklyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2020-02-12').toISOString().slice(0, 10),
        );
    });

    it('Should generate weekly loans correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_day_of_week: 2,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2020-02-05');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateWeeklyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );
        let toBeEndDate: Dayjs = dayjs('2020-01-01').add(1, 'month');

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number =
            (7 + TUESDAY - toBeEndDate.day()) % 7;

        toBeEndDate = toBeEndDate.add(daysUntilNextTuesday, 'day');

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            toBeEndDate.toISOString().slice(0, 10),
        );
    });
});

describe('generateYearlyLoans', () => {
    it('Should generate yearly loans correctly', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2022-02-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2022-01-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate yearly loans correctly every 2 years', () => {
        // Preparing the test data
        const loan: any = {
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_type_variable: 2,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2024-02-02');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2024-01-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate yearly loans correctly when the loan begin date is less than the from date', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2025-02-02');
        const fromDate: Dayjs = dayjs('2022-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(2);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            dayjs('2025-01-01').toISOString().slice(0, 10),
        );
    });

    it('Should generate yearly loans correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_day_of_week: 2,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2023-01-10');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        const expectedEndDate: Dayjs = dayjs(
            transactions[transactions.length - 1].date,
        );
        let toBeEndDate: Dayjs = dayjs('2023-01-03');

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number =
            (7 + TUESDAY - toBeEndDate.day()) % 7;

        toBeEndDate = toBeEndDate.add(daysUntilNextTuesday, 'day');

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(
            toBeEndDate.toISOString().slice(0, 10),
        );
    });

    it('Should generate yearly loans correctly when the frequency week of month is set', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2023-01-01');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each year)
        transactions.forEach((transaction, i) => {
            const transactionDate: Dayjs = dayjs(transaction.date);
            expect(transactionDate.day()).toBe(loan.frequency_day_of_week);

            const secondWeekOfMonth: boolean =
                Math.floor((transactionDate.date() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Check if the year is correctly incrementing on each transaction
            const expectedYear: number = dayjs(loan.loan_begin_date).year() + i;
            expect(transactionDate.year()).toBe(expectedYear);
        });
    });

    it('Should generate yearly loans correctly when the frequency month of year is set', () => {
        // Preparing the test data
        const loan: any = {
            frequency_type_variable: 1,
            loan_title: 'Test Loan',
            loan_description: 'Test Description',
            loan_recipient: 'Test Recipient',
            loan_amount: 1000,
            loan_plan_amount: 100,
            loan_subsidized: 0,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1,
            frequency_month_of_year: 5,
            loan_interest_rate: 0,
            loan_interest_frequency_type: 2,
            loan_begin_date: '2020-01-01',
        };
        const toDate: Dayjs = dayjs('2023-01-01');
        const fromDate: Dayjs = dayjs('2020-01-01');

        // Running the function
        generateYearlyLoans(
            transactions,
            skippedTransactions,
            loan,
            toDate,
            fromDate,
        );

        // Checking the results
        expect(transactions.length).toBe(3); // 2020, 2021, 2022
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(
            loan.loan_title + ' loan to ' + loan.loan_recipient,
        );
        expect(transactions[0].description).toBe(loan.loan_description);
        expect(transactions[0].amount).toBe(-loan.loan_plan_amount);

        // Check if the transactions are on the correct dates (second Tuesday of June each year)
        transactions.forEach((transaction, i) => {
            const transactionDate: Dayjs = dayjs(transaction.date);
            expect(transactionDate.month()).toBe(loan.frequency_month_of_year); // June

            expect(transactionDate.day()).toBe(loan.frequency_day_of_week); // Tuesday

            const secondWeekOfMonth: boolean =
                Math.floor((transactionDate.date() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Check if the year is correctly incrementing on each transaction
            const expectedYear: number = dayjs(loan.loan_begin_date).year() + i;
            expect(transactionDate.year()).toBe(expectedYear);
        });
    });
});

describe('calculateInterest', () => {
    it('Should calculate the yearly interest correctly', () => {
        // Preparing the test data
        const principal: number = 1000;
        const interestRate: number = 0.1;
        const frequencyType: number = 3;

        // Running the function
        const interest: number = calculateInterest(
            principal,
            interestRate,
            frequencyType,
        );

        // Checking the results
        expect(interest).toBe(100);
    });

    it('Should calculate the monthly interest correctly', () => {
        // Preparing the test data
        const principal: number = 1000;
        const interestRate: number = 0.1;
        const frequencyType: number = 2;

        // Running the function
        const interest: number = calculateInterest(
            principal,
            interestRate,
            frequencyType,
        );

        // Checking the results
        expect(parseFloat(interest.toFixed(4))).toBe(8.3333);
    });

    it('Should calculate the weekly interest correctly', () => {
        // Preparing the test data
        const principal: number = 1000;
        const interestRate: number = 0.1;
        const frequencyType: number = 1;

        // Running the function
        const interest: number = calculateInterest(
            principal,
            interestRate,
            frequencyType,
        );

        // Checking the results
        expect(parseFloat(interest.toFixed(4))).toBe(1.9231);
    });

    it('Should calculate the daily interest correctly', () => {
        // Preparing the test data
        const principal: number = 1000;
        const interestRate: number = 0.1;
        const frequencyType: number = 0;

        // Running the function
        const interest: number = calculateInterest(
            principal,
            interestRate,
            frequencyType,
        );

        // Checking the results
        expect(parseFloat(interest.toFixed(3))).toBe(0.274);
    });
});
