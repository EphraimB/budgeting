import { Income, GeneratedTransaction } from '../../types/types';
import { generateDailyIncome, generateMonthlyIncome, generateWeeklyIncome, generateYearlyIncome } from '../../generation/generateIncome';
import MockDate from 'mockdate';

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

describe('Test generateDailyIncome', () => {
    it('Should generate daily income correctly', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-01-06');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateDailyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-06').toISOString().slice(0, 10));
    });

    it('Should generate daily income correctly every 2 days', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100,
            frequency_type_variable: 2
        };
        const toDate: Date = new Date('2020-01-06');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateDailyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-06').toISOString().slice(0, 10));
    });

    it('Should generate daily income correctly when the income begin date is less than the from date', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-01-08');
        const fromDate: Date = new Date('2020-01-06');

        // Running the function
        generateDailyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-08').toISOString().slice(0, 10));
    });
});

describe('Test generateMonthlyIncome', () => {
    it('Should generate monthly income correctly', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-06-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateMonthlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-06-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly income correctly every 2 months', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100,
            frequency_type_variable: 2
        };
        const toDate: Date = new Date('2020-08-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateMonthlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-07-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly income correctly when the income begin date is less than the from date', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-08-02');
        const fromDate: Date = new Date('2020-06-02');

        // Running the function
        generateMonthlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(2);
        expect(skippedTransactions.length).toBe(6);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-08-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly income correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2
        };
        const toDate: Date = new Date('2020-06-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateMonthlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate: Date = new Date('2020-01-01');

        // advance by 5 months
        toBeEndDate.setMonth(toBeEndDate.getMonth() + 4);

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });

    it('Should generate monthly income correctly when the frequency week of month is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1
        };
        const toDate: Date = new Date('2020-06-01');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateMonthlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each month)
        transactions.forEach((transaction, i) => {
            const transactionDate: Date = new Date(transaction.date);
            expect(transactionDate.getDay()).toBe(income.frequency_day_of_week);

            const secondWeekOfMonth: boolean = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Since we start from the current month and increment each month
            const expectedMonth: number = (fromDate.getMonth() + i + 1) % 12;
            expect(transactionDate.getMonth()).toBe(expectedMonth);
        });
    });
});

describe('generateWeeklyIncome', () => {
    it('Should generate weekly income correctly', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-02-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateWeeklyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-30').toISOString().slice(0, 10));
    });

    it('Should generate weekly income every 2 weeks', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100,
            frequency_type_variable: 2
        };
        const toDate: Date = new Date('2020-02-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateWeeklyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-30').toISOString().slice(0, 10));
    });

    it('Should generate weekly income correctly when the income begin date is less than the from date', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2020-02-15');
        const fromDate: Date = new Date('2020-01-28');

        // Running the function
        generateWeeklyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-02-13').toISOString().slice(0, 10));
    });

    it('Should generate weekly income correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2
        };
        const toDate: Date = new Date('2020-02-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateWeeklyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate: Date = new Date('2020-01-01');

        // advance by 4 weeks
        toBeEndDate.setDate(toBeEndDate.getDate() + 28);

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });
});

describe('generateYearlyIncome', () => {
    it('Should generate yearly income correctly', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2022-02-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2022-01-02').toISOString().slice(0, 10));
    });

    it('Should generate yearly income correctly every 2 years', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100,
            frequency_type_variable: 2
        };
        const toDate: Date = new Date('2024-02-02');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2024-01-02').toISOString().slice(0, 10));
    });

    it('Should generate yearly income correctly when the income begin date is less than the from date', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 100
        };
        const toDate: Date = new Date('2025-02-02');
        const fromDate: Date = new Date('2022-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(2);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2025-01-02').toISOString().slice(0, 10));
    });

    it('Should generate yearly income correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2
        };
        const toDate: Date = new Date('2023-01-10');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        const expectedEndDate: Date = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate: Date = new Date('2023-01-02');

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY: number = 2;

        // calculate the number of days to add to get to the next Tuesday
        const daysUntilNextTuesday: number = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });

    it('Should generate yearly income correctly when the frequency week of month is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1
        };
        const toDate: Date = new Date('2023-01-01');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each year)
        transactions.forEach((transaction, i) => {
            const transactionDate: Date = new Date(transaction.date);
            expect(transactionDate.getDay()).toBe(income.frequency_day_of_week);

            const secondWeekOfMonth: boolean = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Check if the year is correctly incrementing on each transaction
            const expectedYear: number = new Date(income.income_begin_date).getFullYear() + i;
            expect(transactionDate.getFullYear()).toBe(expectedYear);
        });
    });

    it('Should generate yearly income correctly when the frequency month of year is set', () => {
        // Preparing the test data
        const income: any = {
            income_begin_date: '2020-01-02',
            income_title: 'Test income',
            income_description: 'Test description',
            income_amount: 150,
            frequency_day_of_week: 2, // Tuesday
            frequency_week_of_month: 1, // Second week
            frequency_month_of_year: 5 // June
        };
        const toDate: Date = new Date('2023-01-01');
        const fromDate: Date = new Date('2020-01-01');

        // Running the function
        generateYearlyIncome(transactions, skippedTransactions, income, toDate, fromDate);

        // Checking the results
        expect(transactions.length).toBe(3); // 2020, 2021, 2022
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(income.income_title);
        expect(transactions[0].description).toBe(income.income_description);
        expect(transactions[0].amount).toBe(income.income_amount);

        // Check if the transactions are on the correct dates (second Tuesday of June each year)
        transactions.forEach((transaction, i) => {
            const transactionDate: Date = new Date(transaction.date);
            expect(transactionDate.getMonth()).toBe(income.frequency_month_of_year); // June

            expect(transactionDate.getDay()).toBe(income.frequency_day_of_week); // Tuesday

            const secondWeekOfMonth: boolean = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Check if the year is correctly incrementing on each transaction
            const expectedYear: number = new Date(income.income_begin_date).getFullYear() + i;
            expect(transactionDate.getFullYear()).toBe(expectedYear);
        });
    });
});
