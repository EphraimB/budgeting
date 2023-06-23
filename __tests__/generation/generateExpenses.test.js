import { generateDailyExpenses } from '../../generation/generateExpenses';

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
        const toDate = new Date().setDate(new Date().getDate() + 5);
        const fromDate = new Date();

        // Running the function
        generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0,10)).toBe(new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0,10));
    });

    // You can add more test cases to handle different scenarios
});
