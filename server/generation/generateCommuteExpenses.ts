import { type Expense, type GeneratedTransaction } from '../types/types';

type GenerateDateFunction = (currentDate: Date, expense: Expense) => Date;

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * @param generateDateFn - The function to generate the next date
 * Generate expenses for a given expense
 */
const generateExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Date,
    fromDate: Date,
    generateDateFn: GenerateDateFunction,
) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (
        expense.frequency_month_of_year !== null &&
        expense.frequency_month_of_year !== undefined
    ) {
        expenseDate.setMonth(expense.frequency_month_of_year);
    }

    if (
        expense.frequency_day_of_week !== null &&
        expense.frequency_day_of_week !== undefined
    ) {
        let newDay;

        if (
            expense.frequency_day_of_week !== null &&
            expense.frequency_day_of_week !== undefined
        ) {
            let daysUntilNextFrequency =
                (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            daysUntilNextFrequency =
                daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = expenseDate.getDate() + daysUntilNextFrequency;
        }

        if (
            expense.frequency_week_of_month !== null &&
            expense.frequency_week_of_month !== undefined
        ) {
            // first day of the month
            expenseDate.setDate(1);
            const daysToAdd =
                (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            expenseDate.setDate(expenseDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay =
                expenseDate.getDate() + 7 * expense.frequency_week_of_month;
        }

        expenseDate.setDate(newDay ?? expenseDate.getDate());
    }

    while (expenseDate <= toDate) {
        const initialAmount = expense.expense_amount;
        const taxRate = expense.tax_rate;
        const subsidyRate = expense.expense_subsidized;

        const amountAfterSubsidy =
            initialAmount - initialAmount * (subsidyRate ?? 0);
        const taxAmount =
            amountAfterSubsidy + amountAfterSubsidy * (taxRate ?? 0);

        const newTransaction: GeneratedTransaction = {
            expense_id: expense.expense_id,
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -amountAfterSubsidy,
            tax_rate: taxRate ?? 0,
            total_amount: -(amountAfterSubsidy + taxAmount),
        };

        if (expenseDate > new Date()) {
            if (fromDate > expenseDate) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }
        }

        expenseDate = generateDateFn(expenseDate, expense);
    }
};

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The commute expense to generate
 * @param toDate - The date to generate commute expenses to
 * @param fromDate - The date to generate commute expenses from
 * Generate commute expenses for a given commute expense
 */
export const generateCommuteExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Date,
    fromDate: Date,
): void => {
    const generateDateFn = (currentDate: Date, expense: Expense): Date => {
        const newDate = currentDate;
        newDate.setDate(
            newDate.getDate() +
                (expense.frequency_type_variable !== null &&
                expense.frequency_type_variable !== undefined
                    ? expense.frequency_type_variable
                    : 1),
        );
        return newDate;
    };

    generateExpenses(
        transactions,
        skippedTransactions,
        expense,
        toDate,
        fromDate,
        generateDateFn,
    );
};
