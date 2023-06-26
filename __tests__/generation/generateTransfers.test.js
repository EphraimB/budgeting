import { generateDailyTransfers, generateMonthlyTransfers, generateWeeklyTransfers, generateYearlyTransfers } from '../../generation/generateTransfers';
import MockDate from 'mockdate'

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

describe('Test generateDailyTransfers', () => {
    it('Should generate daily transfers correctly', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-01-06');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateDailyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-06').toISOString().slice(0, 10));
    });

    it('Should generate daily transfers correctly every 2 days', () => {
        const account_id = 1;

        // Preparing the test data'
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100,
            frequency_type_variable: 2
        };
        const toDate = new Date('2020-01-06');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateDailyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-06').toISOString().slice(0, 10));
    });

    it('Should generate daily transfers correctly when the transfer begin date is less than the from date', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-01-08');
        const fromDate = new Date('2020-01-06');

        // Running the function
        generateDailyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-08').toISOString().slice(0, 10));
    });
});

describe('Test generateMonthlyTransfers', () => {
    it('Should generate monthly transfers correctly', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-06-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(6);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-06-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly transfers correctly every 2 months', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100,
            frequency_type_variable: 2
        };
        const toDate = new Date('2020-08-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-07-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly transfers correctly when the transfer begin date is less than the from date', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-08-02');
        const fromDate = new Date('2020-06-02');

        // Running the function
        generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(2);
        expect(skippedTransactions.length).toBe(6);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-08-01').toISOString().slice(0, 10));
    });

    it('Should generate monthly transfers correctly when the frequency day of week is set', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 150,
            frequency_day_of_week: 2
        };
        const toDate = new Date('2020-06-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate = new Date('2020-01-01');

        // advance by 5 months
        toBeEndDate.setMonth(toBeEndDate.getMonth() + 4);

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY = 2;

        // calculate the number of days to add to get to the next Tuesday
        let daysUntilNextTuesday = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });

    it('Should generate monthly transfers correctly when the frequency week of month is set', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 150,
            frequency_day_of_week: 2,
            frequency_week_of_month: 1
        };
        const toDate = new Date('2020-06-01');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateMonthlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);

        // Check if the transactions are on the correct dates (second Tuesday of each month)
        transactions.forEach((transaction, i) => {
            const transactionDate = new Date(transaction.date);
            expect(transactionDate.getDay()).toBe(transfer.frequency_day_of_week);

            const secondWeekOfMonth = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
            expect(secondWeekOfMonth).toBeTruthy();

            // Since we start from the current month and increment each month
            const expectedMonth = (fromDate.getMonth() + i + 1) % 12;
            expect(transactionDate.getMonth()).toBe(expectedMonth);
        });
    });
});

describe('generateWeeklyTransfers', () => {
    it('Should generate weekly transfers correctly', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-02-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateWeeklyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(5);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-30').toISOString().slice(0, 10));
    });

    it('Should generate weekly transfer every 2 weeks', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100,
            frequency_type_variable: 2
        };
        const toDate = new Date('2020-02-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateWeeklyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-01-30').toISOString().slice(0, 10));
    });

    it('Should generate weekly transfers correctly when the expense begin date is less than the from date', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2020-02-15');
        const fromDate = new Date('2020-01-28');

        // Running the function
        generateWeeklyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(4);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2020-02-13').toISOString().slice(0, 10));
    });

    it('Should generate weekly transfers correctly when the frequency day of week is set', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 150,
            frequency_day_of_week: 2,
        };
        const toDate = new Date('2020-02-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateWeeklyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);
        const toBeEndDate = new Date('2020-01-01');

        // advance by 4 weeks
        toBeEndDate.setDate(toBeEndDate.getDate() + 28);

        // days of the week from 0 (Sunday) to 6 (Saturday)
        const TUESDAY = 2;

        // calculate the number of days to add to get to the next Tuesday
        let daysUntilNextTuesday = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

        toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    });
});

describe('generateYearlyTransfers', () => {
    it('Should generate yearly transfer correctly', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2022-02-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateYearlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2022-01-02').toISOString().slice(0, 10));
    });

    it('Should generate yearly transfers correctly every 2 years', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100,
            frequency_type_variable: 2
        };
        const toDate = new Date('2024-02-02');
        const fromDate = new Date('2020-01-01');

        // Running the function
        generateYearlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(3);
        expect(skippedTransactions.length).toBe(0);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2024-01-02').toISOString().slice(0, 10));
    });

    it('Should generate yearly transfers correctly when the expense begin date is less than the from date', () => {
        const account_id = 1;

        // Preparing the test data
        const transactions = [];
        const skippedTransactions = [];
        const transfer = {
            source_account_id: 1,
            destination_account_id: 2,
            transfer_begin_date: new Date('2020-01-02'),
            transfer_title: "Test transfer",
            transfer_description: "Test description",
            transfer_amount: 100
        };
        const toDate = new Date('2025-02-02');
        const fromDate = new Date('2022-01-01');

        // Running the function
        generateYearlyTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id);

        const expectedEndDate = new Date(transactions[transactions.length - 1].date);

        // Checking the results
        expect(transactions.length).toBe(4);
        expect(skippedTransactions.length).toBe(2);
        expect(transactions[0].title).toBe(transfer.transfer_title);
        expect(transactions[0].description).toBe(transfer.transfer_description);
        expect(transactions[0].amount).toBe(-transfer.transfer_amount);
        expect(expectedEndDate.toISOString().slice(0, 10)).toBe(new Date('2025-01-02').toISOString().slice(0, 10));
    });

    //     it('Should generate yearly expenses correctly when the frequency day of week is set', () => {
    //         // Preparing the test data
    //         const transactions = [];
    //         const skippedTransactions = [];
    //         const expense = {
    //             expense_begin_date: new Date('2020-01-02'),
    //             expense_title: "Test expense",
    //             expense_description: "Test description",
    //             expense_amount: 150,
    //             frequency_day_of_week: 2,
    //         };
    //         const toDate = new Date('2023-01-10');
    //         const fromDate = new Date('2020-01-01');

    //         // Running the function
    //         generateYearlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

    //         const expectedEndDate = new Date(transactions[transactions.length - 1].date);
    //         const toBeEndDate = new Date('2023-01-02');

    //         // days of the week from 0 (Sunday) to 6 (Saturday)
    //         const TUESDAY = 2;

    //         // calculate the number of days to add to get to the next Tuesday
    //         let daysUntilNextTuesday = (7 + TUESDAY - toBeEndDate.getDay()) % 7;

    //         toBeEndDate.setDate(toBeEndDate.getDate() + daysUntilNextTuesday);

    //         // Checking the results
    //         expect(transactions.length).toBe(4);
    //         expect(skippedTransactions.length).toBe(0);
    //         expect(transactions[0].title).toBe(expense.expense_title);
    //         expect(transactions[0].description).toBe(expense.expense_description);
    //         expect(transactions[0].amount).toBe(-expense.expense_amount);
    //         expect(expectedEndDate.toISOString().slice(0, 10)).toBe(toBeEndDate.toISOString().slice(0, 10));
    //     });

    //     it('Should generate yearly expenses correctly when the frequency week of month is set', () => {
    //         // Preparing the test data
    //         const transactions = [];
    //         const skippedTransactions = [];
    //         const expense = {
    //             expense_begin_date: new Date('2020-01-02'),
    //             expense_title: "Test expense",
    //             expense_description: "Test description",
    //             expense_amount: 150,
    //             frequency_day_of_week: 2,
    //             frequency_week_of_month: 1,
    //         };
    //         const toDate = new Date('2023-01-01');
    //         const fromDate = new Date('2020-01-01');

    //         // Running the function
    //         generateYearlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

    //         // Checking the results
    //         expect(transactions.length).toBe(3);
    //         expect(skippedTransactions.length).toBe(0);
    //         expect(transactions[0].title).toBe(expense.expense_title);
    //         expect(transactions[0].description).toBe(expense.expense_description);
    //         expect(transactions[0].amount).toBe(-expense.expense_amount);

    //         // Check if the transactions are on the correct dates (second Tuesday of each year)
    //         transactions.forEach((transaction, i) => {
    //             const transactionDate = new Date(transaction.date);
    //             expect(transactionDate.getDay()).toBe(expense.frequency_day_of_week);

    //             const secondWeekOfMonth = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
    //             expect(secondWeekOfMonth).toBeTruthy();

    //             // Check if the year is correctly incrementing on each transaction
    //             const expectedYear = expense.expense_begin_date.getFullYear() + i;
    //             expect(transactionDate.getFullYear()).toBe(expectedYear);
    //         });
    //     });

    //     it('Should generate yearly expenses correctly when the frequency month of year is set', () => {
    //         // Preparing the test data
    //         const transactions = [];
    //         const skippedTransactions = [];
    //         const expense = {
    //             expense_begin_date: new Date('2020-01-02'),
    //             expense_title: "Test expense",
    //             expense_description: "Test description",
    //             expense_amount: 150,
    //             frequency_day_of_week: 2,  // Tuesday
    //             frequency_week_of_month: 1,  // Second week
    //             frequency_month_of_year: 5,  // June
    //         };
    //         const toDate = new Date('2023-01-01');
    //         const fromDate = new Date('2020-01-01');

    //         // Running the function
    //         generateYearlyExpenses(transactions, skippedTransactions, expense, toDate, fromDate);

    //         console.log(transactions[0].date);

    //         // Checking the results
    //         expect(transactions.length).toBe(3);  // 2020, 2021, 2022
    //         expect(skippedTransactions.length).toBe(0);
    //         expect(transactions[0].title).toBe(expense.expense_title);
    //         expect(transactions[0].description).toBe(expense.expense_description);
    //         expect(transactions[0].amount).toBe(-expense.expense_amount);

    //         // Check if the transactions are on the correct dates (second Tuesday of June each year)
    //         transactions.forEach((transaction, i) => {
    //             const transactionDate = new Date(transaction.date);
    //             expect(transactionDate.getMonth()).toBe(expense.frequency_month_of_year);  // June

    //             expect(transactionDate.getDay()).toBe(expense.frequency_day_of_week);  // Tuesday

    //             const secondWeekOfMonth = Math.floor((transactionDate.getDate() - 1) / 7) === 1;
    //             expect(secondWeekOfMonth).toBeTruthy();

    //             // Check if the year is correctly incrementing on each transaction
    //             const expectedYear = expense.expense_begin_date.getFullYear() + i;
    //             expect(transactionDate.getFullYear()).toBe(expectedYear);
    //         });
    //     });
});