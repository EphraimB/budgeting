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

        expenseDate.setDate(newDay);
    }

    while (expenseDate <= toDate) {
        const initialAmount = expense.expense_amount;
        const taxRate = expense.tax_rate;
        const subsidyRate = expense.expense_subsidized;

        const amountAfterSubsidy = initialAmount - initialAmount * subsidyRate;
        const taxAmount = amountAfterSubsidy + amountAfterSubsidy * taxRate;

        const newTransaction: GeneratedTransaction = {
            expense_id: expense.expense_id,
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -amountAfterSubsidy,
            tax_rate: taxRate,
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
 * @param expense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * Generate daily expenses for a given expense
 */
export const generateDailyExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    expense: Expense,
    toDate: Date,
    fromDate: Date,
): void => {
    const generateDateFn = (currentDate: Date, expense: Expense): Date => {
        const newDate = currentDate;
        newDate.setDate(
            newDate.getDate() + (expense.frequency_type_variable || 1),
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
    toDate: Date,
    fromDate: Date,
): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, expense: Expense): Date => {
        const expenseDate: Date = new Date(expense.expense_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        expenseDate.setMonth(
            expenseDate.getMonth() +
                monthsIncremented +
                (expense.frequency_type_variable || 1),
        );

        if (
            expense.frequency_day_of_week !== null &&
            expense.frequency_day_of_week !== undefined
        ) {
            let newDay: number;

            if (
                expense.frequency_day_of_week !== null &&
                expense.frequency_day_of_week !== undefined
            ) {
                let daysUntilNextFrequency =
                    (7 + expense.frequency_day_of_week - expenseDate.getDay()) %
                    7;
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
                const daysToAdd: number =
                    (7 + expense.frequency_day_of_week - expenseDate.getDay()) %
                    7;
                // setting to the first occurrence of the desired day of week
                expenseDate.setDate(expenseDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay =
                    expenseDate.getDate() + 7 * expense.frequency_week_of_month;
            }

            expenseDate.setDate(newDay);
        }

        monthsIncremented += expense.frequency_type_variable || 1;

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
    toDate: Date,
    fromDate: Date,
): void => {
    const expenseDate: Date = new Date(expense.expense_begin_date);

    if (
        expense.frequency_day_of_week !== null &&
        expense.frequency_day_of_week !== undefined
    ) {
        const startDay: number = new Date(expense.expense_begin_date).getDay();
        const frequency_day_of_week: number = expense.frequency_day_of_week;

        expenseDate.setDate(
            expenseDate.getDate() +
                ((frequency_day_of_week + 7 - startDay) % 7),
        );
    }

    const generateDateFn = (currentDate: Date, expense: Expense): Date => {
        const newDate: Date = currentDate;
        newDate.setDate(
            newDate.getDate() + 7 * (expense.frequency_type_variable || 1),
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
    toDate: Date,
    fromDate: Date,
): void => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, expense: Expense): Date => {
        const newDate: Date = new Date(expense.expense_begin_date);
        newDate.setFullYear(
            newDate.getFullYear() +
                yearsIncremented +
                (expense.frequency_type_variable || 1),
        );

        if (
            expense.frequency_month_of_year !== null &&
            expense.frequency_month_of_year !== undefined
        ) {
            newDate.setMonth(expense.frequency_month_of_year);
        }

        if (
            expense.frequency_day_of_week !== null &&
            expense.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - newDate.getDay() + expense.frequency_day_of_week) % 7;
            newDate.setDate(newDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (
                expense.frequency_week_of_month !== null &&
                expense.frequency_week_of_month !== undefined
            ) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate: Date = new Date(newDate.getTime());
                proposedDate.setDate(
                    proposedDate.getDate() +
                        7 * expense.frequency_week_of_month,
                );

                if (proposedDate.getMonth() === newDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    newDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }

        yearsIncremented += expense.frequency_type_variable || 1;

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
