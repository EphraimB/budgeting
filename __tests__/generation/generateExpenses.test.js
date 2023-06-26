import { generateDailyExpenses, generateMonthlyExpenses, generateWeeklyExpenses } from '../../generation/generateExpenses';
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('Test generateDailyExpenses', () => {
    it('Should generate daily expenses correctly', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date().setDate(new Date().getDate() + 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 100
        };
        const toDate = new Date('2020-01-06');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-06').toISOString().slice(0, 10));
    });

    it('Should generate daily expenses correctly when the expense begin date is less than the from date', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date().setDate(new Date().getDate() + 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 100
        };
        const toDate = new Date('2020-01-08');
        const fromDate = new Date('2020-01-06');

        // Running the function
        generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-08').toISOString().slice(0, 10));
    });
});

describe('Test generateMonthlyExpenses', () => {
    it('Should generate monthly expenses correctly', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date().setDate(new Date().getDate() + 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 100
        };
        const toDate = new Date('2020-06-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-06-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly expenses correctly when the expense begin date is less than the from date', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date().setDate(new Date().getDate() + 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 100
        };
        const toDate = new Date('2020-08-02');
        const fromDate = new Date('2020-06-02');

        // Running the function
        generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(2);
        expect(skippedTransactions.length).toBe(6);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-08-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly expenses correctly when the frequency day of week is set', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date().setDate(new Date().getDate() + 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 150,
            frequency_day_of_week: 2,
        };
        const toDate = new Date();
        toDate.setMonth(toDate.getMonth() + 5);
        toDate.setDate(toDate.getDate() + 1);

        const fromDate = new Date();

        // Running the function
        generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate = new Date();

        // advance by 5 months
        toBeEndDate.setMonth(toBeEndDate.getMonth() + 4);

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY = 2;

        // calculate the number of days to add to get to the next Tuesday
        let daysUntilNextTuesday = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        // if today is already Tuesday, move to next week's Tuesday
        if (daysUntilNextTuesday === 0) {
            daysUntilNextTuesday += 7;
        }

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });

    it('Should generate monthly expenses correctly when the frequency week of month is set', () => {
        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const expense = {
            expense_begin_date: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
            expense_title: "Test expense",
            expense_description: "Test description",
            expense_amount: 150,
            frequency_day_of_week: 2,
            frequency_week_of_month: 2,
        };
        const toDate = new Date();
        toDate.setMonth(toDate.getMonth() + 5);
        const fromDate = new Date();

        // Running the function
        generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each month)
        transactions.forEach((transaction, i) => {
            const transactionDate = new Date(transaction.date);
            expect(transactionDate.getDay()).toBe(expense.frequency_day_of_week);

            const secondWeekOfMonth = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Since we start from the current month and increment each month
            const expectedMonth = (fromDate.getMonth() + i + 1) % 12;
            expect(transactionDate.getMonth()).toBe(expectedMonth);
        });
    });
});

// describe('generateWeeklyExpenses', () => {
//     it('Should generate weekly expenses correctly', () => {
//         // Preparing the test data
//         const transactions = [];
//         const skippedTransactions = [];
//         const expense = {
//             expense_begin_date: new Date().setDate(new Date().getDate() + 1),
//             expense_title: "Test expense",
//             expense_description: "Test description",
//             expense_amount: 100
//         };
//         const toDate = new Date();
//         toDate.setMonth(toDate.getMonth() + 1);
//         toDate.setDate(toDate.getDate() + 1);

//         const fromDate = new Date();

//         // Running the function
//         generateWeeklyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

//         const expectedEndDate = new Date(transactions[transactions.length - 1].date);
//         const toBeEndDate = new Date();
//         toBeEndDate.setMonth(toBeEndDate.getMonth() + 1);
//         toBeEndDate.setDate(toBeEndDate.getDate() + 1);

//         // Checking the results
//         expect(transactions.length).toBe(5);
//         expect(skippedTransactions.length).toBe(0);
//         expect(transactions[0].title).toBe(expense.expense_title);
//         expect(transactions[0].description).toBe(expense.expense_description);
//         expect(transactions[0].amount).toBe(-expense.expense_amount);
//         expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date(toBeEndDate));
//     });
// });