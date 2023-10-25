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
    income: Income,
    toDate: Dayjs,
    fromDate: Dayjs,
    generateDateFn: GenerateDateFunction,
) => {
    let incomeDate = dayjs(income.income_begin_date);

    if (
        income.frequency_month_of_year !== null &&
        income.frequency_month_of_year !== undefined
    ) {
        incomeDate.month(income.frequency_month_of_year);
    }

    if (
        income.frequency_day_of_week !== null &&
        income.frequency_day_of_week !== undefined
    ) {
        let newDay: number = incomeDate.date();

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            let daysUntilNextFrequency =
                (7 + income.frequency_day_of_week - incomeDate.day()) % 7;
            daysUntilNextFrequency =
                daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = incomeDate.date() + daysUntilNextFrequency;
        }

        if (
            income.frequency_week_of_month !== null &&
            income.frequency_week_of_month !== undefined
        ) {
            // first day of the month
            incomeDate.date(1);
            const daysToAdd =
                (7 + income.frequency_day_of_week - incomeDate.day()) % 7;
            // setting to the first occurrence of the desired day of week
            incomeDate.add(daysToAdd, 'day');
            // setting to the desired week of the month
            newDay = incomeDate.date() + 7 * income.frequency_week_of_month;
        }

        incomeDate.date(newDay);
    }

    while (incomeDate.diff(toDate) < 0) {
        const initialAmount: number = income.income_amount;
        const taxRate: number = income.tax_rate ?? 0;

        const taxAmount = initialAmount + initialAmount * taxRate;

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            income_id: income.income_id,
            title: income.income_title,
            description: income.income_description,
            date: dayjs(incomeDate),
            amount: initialAmount,
            tax_rate: taxRate,
            total_amount: initialAmount + taxAmount,
        };

        if (incomeDate.diff(dayjs()) < 0) {
            if (fromDate > incomeDate) {
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
            income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                ? income.frequency_type_variable
                : 1,
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
        const incomeDate: Dayjs = dayjs(income.income_begin_date).add(
            monthsIncremented +
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
            'month',
        );

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            let newDay: number = incomeDate.date();

            if (
                income.frequency_day_of_week !== null &&
                income.frequency_day_of_week !== undefined
            ) {
                let daysUntilNextFrequency =
                    (7 + income.frequency_day_of_week - incomeDate.day()) % 7;
                daysUntilNextFrequency =
                    daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = incomeDate.date() + daysUntilNextFrequency;
            }

            if (
                income.frequency_week_of_month !== null &&
                income.frequency_week_of_month !== undefined
            ) {
                // first day of the month
                incomeDate.date(1);
                const daysToAdd: number =
                    (7 + income.frequency_day_of_week - incomeDate.day()) % 7;
                // setting to the first occurrence of the desired day of week
                incomeDate.add(daysToAdd, 'day');
                // setting to the desired week of the month
                newDay = incomeDate.date() + 7 * income.frequency_week_of_month;
            }

            incomeDate.date(newDay);
        }

        monthsIncremented +=
            income.frequency_type_variable !== null &&
            income.frequency_type_variable !== undefined
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
    const incomeDate: Dayjs = dayjs(income.income_begin_date);

    if (
        income.frequency_day_of_week !== null &&
        income.frequency_day_of_week !== undefined
    ) {
        const startDay: number = dayjs(income.income_begin_date).day();
        const frequency_day_of_week: number = income.frequency_day_of_week;

        incomeDate.add((frequency_day_of_week + 7 - startDay) % 7, 'day');
    }

    const generateDateFn = (currentDate: Dayjs, income: Income): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            7 *
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
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
        const newDate: Dayjs = dayjs(income.income_begin_date).add(
            yearsIncremented +
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
            'year',
        );

        if (
            income.frequency_month_of_year !== null &&
            income.frequency_month_of_year !== undefined
        ) {
            newDate.month(income.frequency_month_of_year);
        }

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - newDate.day() + income.frequency_day_of_week) % 7;
            newDate.add(daysToAdd, 'day'); // this is the first occurrence of the day_of_week

            if (
                income.frequency_week_of_month !== null &&
                income.frequency_week_of_month !== undefined
            ) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate: Dayjs = dayjs(newDate).add(
                    income.frequency_week_of_month,
                    'week',
                );

                if (proposedDate.diff(newDate, 'month') === 0) {
                    // it's in the same month, so it's a valid date
                    newDate.date(proposedDate.date());
                }
            }
        }

        yearsIncremented +=
            income.frequency_type_variable !== null &&
            income.frequency_type_variable !== undefined
                ? income.frequency_type_variable
                : 1;

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
