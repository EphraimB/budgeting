import { type Income, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { type Dayjs } from 'dayjs';

type GenerateDateFunction = (currentDate: Dayjs, income: Income) => Dayjs;

/**
 *
 * @param transactions - The transactions to generate income for
 * @param skippedTransactions - The transactions to skip
 * @param income - The income to generate
 * @param toDate - The date to generate income to
 * @param fromDate - The date to generate income from
 * @param generateDateFn - The function to generate the next date
 * Generate income for a given income
 */
const generateIncome = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    income: any,
    toDate: Dayjs,
    fromDate: Dayjs,
    generateDateFn: GenerateDateFunction,
) => {
    let incomeDate = dayjs(income.income_begin_date);

    if (income.frequency_month_of_year)
        incomeDate = incomeDate.month(income.frequency_month_of_year);

    // Adjust for the day of the week
    if (income.frequency_day_of_week) {
        incomeDate = incomeDate.startOf('month');
        let firstOccurrence = incomeDate.day(income.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(incomeDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        // Adjust for the specific week of the month
        if (income.frequency_week_of_month) {
            incomeDate = firstOccurrence.add(
                income.frequency_week_of_month,
                'week',
            );
        } else {
            incomeDate = firstOccurrence;
        }
    }

    while (incomeDate.diff(toDate) <= 0) {
        const initialAmount: number = income.income_amount;
        const taxRate: number = income.tax_rate ?? 0;

        const amountAfterTax = initialAmount + initialAmount * taxRate;

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            income_id: income.income_id,
            title: income.income_title,
            description: income.income_description,
            date: dayjs(incomeDate),
            amount: initialAmount,
            tax_rate: taxRate,
            total_amount: amountAfterTax,
        };

        if (incomeDate.diff() > 0) {
            if (incomeDate.diff(fromDate) < 0) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }
        }

        incomeDate = generateDateFn(incomeDate, income);
    }
};

/**
 *
 * @param transactions - The transactions to generate the income for
 * @param skippedTransactions - The transactions to skip
 * @param income - The income to generate
 * @param toDate - The date to generate the income to
 * @param fromDate - The date to generate the income from
 * Generate daily income for a given income
 */
export const generateDailyIncome = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    income: Income,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    const generateDateFn = (currentDate: Dayjs, income: Income): Dayjs => {
        const newDate = currentDate.add(
            income.frequency_type_variable ? income.frequency_type_variable : 1,
            'day',
        );

        return newDate;
    };

    generateIncome(
        transactions,
        skippedTransactions,
        income,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate the income for
 * @param skippedTransactions - The transactions to skip
 * @param income - The income to generate
 * @param toDate - The date to generate the income to
 * @param fromDate - The date to generate the income from
 * Generate monthly income for a given expense
 */
export const generateMonthlyIncome = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    income: Income,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, income: Income): Dayjs => {
        let incomeDate: Dayjs = dayjs(income.income_begin_date).add(
            monthsIncremented +
                (income.frequency_type_variable
                    ? income.frequency_type_variable
                    : 1),
            'month',
        );

        // Adjust for the day of the week
        if (income.frequency_day_of_week) {
            incomeDate = incomeDate.startOf('month');
            let firstOccurrence = incomeDate.day(income.frequency_day_of_week);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(incomeDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (income.frequency_week_of_month) {
                incomeDate = firstOccurrence.add(
                    income.frequency_week_of_month,
                    'week',
                );
            } else {
                incomeDate = firstOccurrence;
            }
        }

        monthsIncremented += income.frequency_type_variable
            ? income.frequency_type_variable
            : 1;

        return incomeDate;
    };

    generateIncome(
        transactions,
        skippedTransactions,
        income,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate the income for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The income to generate
 * @param toDate - The date to generate the income to
 * @param fromDate - The date to generate the income from
 * Generate weekly expenses for a given income
 */
export const generateWeeklyIncome = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    income: Income,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let incomeDate: Dayjs = dayjs(income.income_begin_date);

    // Adjust for the day of the week
    if (income.frequency_day_of_week) {
        incomeDate = incomeDate.startOf('month');
        let firstOccurrence = incomeDate.day(income.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(incomeDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        incomeDate = firstOccurrence;
    }

    const generateDateFn = (currentDate: Dayjs, income: Income): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            income.frequency_type_variable ? income.frequency_type_variable : 1,
            'week',
        );

        return newDate;
    };

    generateIncome(
        transactions,
        skippedTransactions,
        income,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate the income for
 * @param skippedTransactions - The transactions to skip
 * @param expense - The income to generate
 * @param toDate - The date to generate the income to
 * @param fromDate - The date to generate the income from
 * Generate yearly expenses for a given income
 */
export const generateYearlyIncome = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    income: Income,
    toDate: Dayjs,
    fromDate: Dayjs,
): void => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, income: Income): Dayjs => {
        let incomeDate: Dayjs = dayjs(income.income_begin_date).add(
            yearsIncremented +
                (income.frequency_type_variable
                    ? income.frequency_type_variable
                    : 1),
            'year',
        );

        if (income.frequency_month_of_year)
            incomeDate = incomeDate.month(income.frequency_month_of_year);

        // Adjust for the day of the week
        if (income.frequency_day_of_week) {
            incomeDate = incomeDate.startOf('month');
            let firstOccurrence = incomeDate.day(income.frequency_day_of_week);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(incomeDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (income.frequency_week_of_month) {
                incomeDate = firstOccurrence.add(
                    income.frequency_week_of_month,
                    'week',
                );
            } else {
                incomeDate = firstOccurrence;
            }
        }

        yearsIncremented += income.frequency_type_variable
            ? income.frequency_type_variable
            : 1;

        return incomeDate;
    };

    generateIncome(
        transactions,
        skippedTransactions,
        income,
        toDate,
        fromDate,
        generateDateFn,
    );
};
