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
            tax_rate: taxRate ?? 0,
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
        const newDate = currentDate.add(
            expense.frequency_type_variable
                ? expense.frequency_type_variable
                : 1,
            'day',
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
            monthsIncremented +
                (expense.frequency_type_variable
                    ? expense.frequency_type_variable
                    : 1),
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

        monthsIncremented += expense.frequency_type_variable
            ? expense.frequency_type_variable
            : 1;

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
    expense: Expense,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let expenseDate: Dayjs = dayjs(expense.begin_date);

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
            expense.frequency_type_variable
                ? expense.frequency_type_variable
                : 1,
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
    const generateDateFn = (currentDate: Dayjs, expense: Expense): Dayjs => {
        const newDate: Dayjs = dayjs(expense.begin_date).add(
            yearsIncremented +
                (expense.frequency_type_variable
                    ? expense.frequency_type_variable
                    : 1),
            'year',
        );

        if (expense.frequency_month_of_year) {
            newDate.month(expense.frequency_month_of_year);
        }

        if (
            expense.frequency_day_of_week !== null &&
            expense.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - newDate.day() + expense.frequency_day_of_week) % 7;

            newDate.add(daysToAdd, 'day'); // this is the first occurrence of the day_of_week

            if (expense.frequency_week_of_month) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate: Dayjs = dayjs(newDate).add(
                    expense.frequency_week_of_month,
                    'week',
                );

                if (proposedDate.diff(newDate, 'month') === 0) {
                    // it's in the same month, so it's a valid date
                    newDate.date(proposedDate.date());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }

        yearsIncremented += expense.frequency_type_variable
            ? expense.frequency_type_variable
            : 1;

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
