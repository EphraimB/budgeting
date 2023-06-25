import { generateDailyExpenses, generateMonthlyExpenses } from '../../generation/generateExpenses';

// describe('Test generateDailyExpenses', () => {
//     it('Should generate daily expenses correctly', () => {
//         // Preparing the test data
//         const transactions = [];
//         const skippedTransactions = [];
//         const expense = {
//             expense_begin_date: new Date().setDate(new Date().getDate() + 1),
//             expense_title: "Test expense",
//             expense_description: "Test description",
//             expense_amount: 100
//         };
//         const toDate = new Date().setDate(new Date().getDate() + 5);
//         const fromDate = new Date();

//         // Running the function
//         generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

//         const expectedEndDate = new Date(transactions[transactions.length - 1].date);

//         // Checking the results
//         expect(transactions.length).toBe(5);
//         expect(skippedTransactions.length).toBe(0);
//         expect(transactions[0].title).toBe(expense.expense_title);
//         expect(transactions[0].description).toBe(expense.expense_description);
//         expect(transactions[0].amount).toBe(-expense.expense_amount);
//         expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().slice(0, 10));
//     });

//     it('Should generate daily expenses correctly when the expense begin date is less than the from date', () => {
//         // Preparing the test data
//         const transactions = [];
//         const skippedTransactions = [];
//         const expense = {
//             expense_begin_date: new Date().setDate(new Date().getDate() + 1),
//             expense_title: "Test expense",
//             expense_description: "Test description",
//             expense_amount: 100
//         };
//         const toDate = new Date().setDate(new Date().getDate() + 7);
//         const fromDate = new Date().setDate(new Date().getDate() + 5);

//         // Running the function
//         generateDailyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

//         const expectedEndDate = new Date(transactions[transactions.length - 1].date);
//         const toBeEndDate = new Date();
//         toBeEndDate.setDate(toBeEndDate.getDate() + 7);

//         // Checking the results
//         expect(transactions.length).toBe(3);
//         expect(skippedTransactions.length).toBe(4);
//         expect(transactions[0].title).toBe(expense.expense_title);
//         expect(transactions[0].description).toBe(expense.expense_description);
//         expect(transactions[0].amount).toBe(-expense.expense_amount);
//         expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date(toBeEndDate).toISOString().slice(0, 10));
//     });
// });

describe('Test generateMonthlyExpenses', () => {
    // it('Should generate monthly expenses correctly', () => {
    //     // Preparing the test data
    //     const transactions = [];
    //     const skippedTransactions = [];
    //     const expense = {
    //         expense_begin_date: new Date().setDate(new Date().getDate() + 1),
    //         expense_title: "Test expense",
    //         expense_description: "Test description",
    //         expense_amount: 100
    //     };
    //     const toDate = new Date();
    //     toDate.setMonth(toDate.getMonth() + 5);
    //     toDate.setDate(toDate.getDate() + 1);

    //     const fromDate = new Date();

    //     // Running the function
    //     generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

    //     const expectedEndDate = new Date(transactions[transactions.length - 1].date);
    //     const toBeEndDate = new Date();
    //     toBeEndDate.setDate(new Date().getDate() + 1);
    //     toBeEndDate.setMonth(new Date().getMonth() + 5);

    //     // Checking the results
    //     expect(transactions.length).toBe(6);
    //     expect(skippedTransactions.length).toBe(0);
    //     expect(transactions[0].title).toBe(expense.expense_title);
    //     expect(transactions[0].description).toBe(expense.expense_description);
    //     expect(transactions[0].amount).toBe(-expense.expense_amount);
    //     expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    // });

    // it('Should generate monthly expenses correctly when the expense begin date is less than the from date', () => {
    //     // Preparing the test data
    //     const transactions = [];
    //     const skippedTransactions = [];
    //     const expense = {
    //         expense_begin_date: new Date().setDate(new Date().getDate() + 1),
    //         expense_title: "Test expense",
    //         expense_description: "Test description",
    //         expense_amount: 100
    //     };
    //     const toDate = new Date();
    //     toDate.setMonth(toDate.getMonth() + 7);
    //     toDate.setDate(toDate.getDate() + 1);

    //     const fromDate = new Date();
    //     fromDate.setMonth(fromDate.getMonth() + 5);
    //     fromDate.setDate(fromDate.getDate() + 1);

    //     // Running the function
    //     generateMonthlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

    //     const expectedEndDate = new Date(transactions[transactions.length - 1].date);
    //     const toBeEndDate = new Date();
    //     toBeEndDate.setMonth(toBeEndDate.getMonth() + 7);
    //     toBeEndDate.setDate(toBeEndDate.getDate() + 1);

    //     // Checking the results
    //     expect(transactions.length).toBe(3);
    //     expect(skippedTransactions.length).toBe(5);
    //     expect(transactions[0].title).toBe(expense.expense_title);
    //     expect(transactions[0].description).toBe(expense.expense_description);
    //     expect(transactions[0].amount).toBe(-expense.expense_amount);
    //     expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date(toBeEndDate).toISOString().slice(0, 10));
    // });

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
        toBeEndDate.setDate(new Date().getDate() + 1);
        toBeEndDate.setMonth(new Date().getMonth() + 5);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(expense.expense_title);
        expect(transactions[0].description).toBe(expense.expense_description);
        expect(transactions[0].amount).toBe(-expense.expense_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });
});