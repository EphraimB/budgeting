import { type Income, type GeneratedTransaction } from '../types/types';

type GenerateDateFunction = (currentDate: Date, income: Income) => Date;

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
    toDate: Date,
    fromDate: Date,
    generateDateFn: GenerateDateFunction,
) => {
    let incomeDate = new Date(income.income_begin_date);

    if (
        income.frequency_month_of_year !== null &&
        income.frequency_month_of_year !== undefined
    ) {
        incomeDate.setMonth(income.frequency_month_of_year);
    }

    if (
        income.frequency_day_of_week !== null &&
        income.frequency_day_of_week !== undefined
    ) {
        let newDay: number = incomeDate.getDate();

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            let daysUntilNextFrequency =
                (7 + income.frequency_day_of_week - incomeDate.getDay()) % 7;
            daysUntilNextFrequency =
                daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = incomeDate.getDate() + daysUntilNextFrequency;
        }

        if (
            income.frequency_week_of_month !== null &&
            income.frequency_week_of_month !== undefined
        ) {
            // first day of the month
            incomeDate.setDate(1);
            const daysToAdd =
                (7 + income.frequency_day_of_week - incomeDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            incomeDate.setDate(incomeDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = incomeDate.getDate() + 7 * income.frequency_week_of_month;
        }

        incomeDate.setDate(newDay);
    }

    while (incomeDate <= toDate) {
        const initialAmount = income.income_amount;
        const taxRate = income.tax_rate ?? 0;

        const taxAmount = initialAmount + initialAmount * taxRate;

        const newTransaction: GeneratedTransaction = {
            income_id: income.income_id,
            title: income.income_title,
            description: income.income_description,
            date: new Date(incomeDate),
            amount: initialAmount,
            tax_rate: taxRate,
            total_amount: initialAmount + taxAmount,
        };

        if (incomeDate > new Date()) {
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
    toDate: Date,
    fromDate: Date,
): void => {
    const generateDateFn = (currentDate: Date, income: Income): Date => {
        const newDate = currentDate;
        newDate.setDate(
            newDate.getDate() +
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
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
    toDate: Date,
    fromDate: Date,
): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, income: Income): Date => {
        const incomeDate: Date = new Date(income.income_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        incomeDate.setMonth(
            incomeDate.getMonth() +
                monthsIncremented +
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
        );

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            let newDay: number = incomeDate.getDate();

            if (
                income.frequency_day_of_week !== null &&
                income.frequency_day_of_week !== undefined
            ) {
                let daysUntilNextFrequency =
                    (7 + income.frequency_day_of_week - incomeDate.getDay()) %
                    7;
                daysUntilNextFrequency =
                    daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = incomeDate.getDate() + daysUntilNextFrequency;
            }

            if (
                income.frequency_week_of_month !== null &&
                income.frequency_week_of_month !== undefined
            ) {
                // first day of the month
                incomeDate.setDate(1);
                const daysToAdd: number =
                    (7 + income.frequency_day_of_week - incomeDate.getDay()) %
                    7;
                // setting to the first occurrence of the desired day of week
                incomeDate.setDate(incomeDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay =
                    incomeDate.getDate() + 7 * income.frequency_week_of_month;
            }

            incomeDate.setDate(newDay);
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
    toDate: Date,
    fromDate: Date,
): void => {
    const incomeDate: Date = new Date(income.income_begin_date);

    if (
        income.frequency_day_of_week !== null &&
        income.frequency_day_of_week !== undefined
    ) {
        const startDay: number = new Date(income.income_begin_date).getDay();
        const frequency_day_of_week: number = income.frequency_day_of_week;

        incomeDate.setDate(
            incomeDate.getDate() + ((frequency_day_of_week + 7 - startDay) % 7),
        );
    }

    const generateDateFn = (currentDate: Date, income: Income): Date => {
        const newDate: Date = currentDate;
        newDate.setDate(
            newDate.getDate() +
                7 *
                    (income.frequency_type_variable !== null &&
                    income.frequency_type_variable !== undefined
                        ? income.frequency_type_variable
                        : 1),
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
    toDate: Date,
    fromDate: Date,
): void => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, income: Income): Date => {
        const newDate: Date = new Date(income.income_begin_date);
        newDate.setFullYear(
            newDate.getFullYear() +
                yearsIncremented +
                (income.frequency_type_variable !== null &&
                income.frequency_type_variable !== undefined
                    ? income.frequency_type_variable
                    : 1),
        );

        if (
            income.frequency_month_of_year !== null &&
            income.frequency_month_of_year !== undefined
        ) {
            newDate.setMonth(income.frequency_month_of_year);
        }

        if (
            income.frequency_day_of_week !== null &&
            income.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - newDate.getDay() + income.frequency_day_of_week) % 7;
            newDate.setDate(newDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (
                income.frequency_week_of_month !== null &&
                income.frequency_week_of_month !== undefined
            ) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate: Date = new Date(newDate.getTime());
                proposedDate.setDate(
                    proposedDate.getDate() + 7 * income.frequency_week_of_month,
                );

                if (proposedDate.getMonth() === newDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    newDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
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
