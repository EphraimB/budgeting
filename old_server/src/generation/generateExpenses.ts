import { type Expense, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { Dayjs } from 'dayjs';

type GenerateDateFunction = (currentDate: Dayjs, expense: Expense) => Dayjs;

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
    expense: any,
    toDate: Dayjs,
    fromDate: Dayjs,
    generateDateFn: GenerateDateFunction,
) => {
    let expenseDate = dayjs(expense.expense_begin_date);

    if (expense.frequency_month_of_year)
        expenseDate = expenseDate.month(expense.frequency_month_of_year);

    // Adjust for the day of the week
    if (expense.frequency_day_of_week) {
        expenseDate = expenseDate.startOf('month');
        let firstOccurrence = expenseDate.day(expense.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(expenseDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        // Adjust for the specific week of the month
        if (expense.frequency_week_of_month) {
            expenseDate = firstOccurrence.add(
                expense.frequency_week_of_month,
                'week',
            );
        } else {
            expenseDate = firstOccurrence;
        }
    }

    while (expenseDate.diff(toDate) <= 0) {
        const initialAmount = expense.expense_amount;
        const taxRate = expense.tax_rate;
        const subsidyRate = expense.expense_subsidized;

        const amountAfterSubsidy =
            initialAmount - initialAmount * (subsidyRate ?? 0);
        const taxAmount =
            amountAfterSubsidy + amountAfterSubsidy * (taxRate ?? 0);

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            expense_id: expense.expense_id,
            title: expense.expense_title,
            description: expense.expense_description,
            date: expenseDate,
            amount: -amountAfterSubsidy,
            tax_rate: taxRate,
            total_amount: -taxAmount,
        };

        if (expenseDate.diff() > 0) {
            if (expenseDate.diff(fromDate) < 0) {
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
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * Generate daily expenses for a given expense
 */
export const generateDailyExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    const generateDateFn = (currentDate: Dayjs, expense: Expense): Dayjs => {
        const newDate = currentDate.add(expense.frequency_type_variable, 'day');

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

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * Generate monthly expenses for a given expense
 */
export const generateMonthlyExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, expense: any): Dayjs => {
        let expenseDate: Dayjs = dayjs(expense.expense_begin_date).add(
            monthsIncremented + expense.frequency_type_variable,
            'month',
        );

        // Adjust for the day of the week
        if (expense.frequency_day_of_week) {
            expenseDate = expenseDate.startOf('month');
            let firstOccurrence = expenseDate.day(
                expense.frequency_day_of_week,
            );

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(expenseDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (expense.frequency_week_of_month) {
                expenseDate = firstOccurrence.add(
                    expense.frequency_week_of_month,
                    'week',
                );
            } else {
                expenseDate = firstOccurrence;
            }
        }

        monthsIncremented += expense.frequency_type_variable;

        return expenseDate;
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

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * Generate weekly expenses for a given expense
 */
export const generateWeeklyExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: any,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let expenseDate: Dayjs = dayjs(expense.expense_begin_date);

    // Adjust for the day of the week
    if (expense.frequency_day_of_week) {
        expenseDate = expenseDate.startOf('month');
        let firstOccurrence = expenseDate.day(expense.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(expenseDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        expenseDate = firstOccurrence;
    }

    const generateDateFn = (currentDate: Dayjs, expense: Expense): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            expense.frequency_type_variable,
            'week',
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

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * Generate yearly expenses for a given expense
 */
export const generateYearlyExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, expense: any): Dayjs => {
        let expenseDate: Dayjs = dayjs(expense.expense_begin_date).add(
            yearsIncremented + expense.frequency_type_variable,
            'year',
        );

        if (expense.frequency_month_of_year)
            expenseDate = expenseDate.month(expense.frequency_month_of_year);

        // Adjust for the day of the week
        if (expense.frequency_day_of_week) {
            expenseDate = expenseDate.startOf('month');
            let firstOccurrence = expenseDate.day(
                expense.frequency_day_of_week,
            );

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(expenseDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (expense.frequency_week_of_month) {
                expenseDate = firstOccurrence.add(
                    expense.frequency_week_of_month,
                    'week',
                );
            } else {
                expenseDate = firstOccurrence;
            }
        }

        yearsIncremented += expense.frequency_type_variable;

        return expenseDate;
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
