interface Expense {
    expense_id: number;
    account_id: number;
    expense_amount: number;
    expense_title: string;
    expense_description: string;
    expense_begin_date: string;
    frequency_type_variable: number;
    frequency_day_of_month: number;
    frequency_day_of_week: number;
    frequency_week_of_month: number;
    frequency_month_of_year: number;
    date_created: string;
    date_modified: string;
}

type GenerateDateFunction = (currentDate: string, expense: Expense) => Date;

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
const generateExpenses = (transactions: any[], skippedTransactions: any[], expense: Expense, toDate: string, fromDate: string, generateDateFn: GenerateDateFunction) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_month_of_year !== null && expense.frequency_month_of_year !== undefined) {
        expenseDate.setMonth(expense.frequency_month_of_year);
    }

    if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
        let newDay;

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = expenseDate.getDate() + daysUntilNextFrequency;
        }

        if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
            // first day of the month
            expenseDate.setDate(1);
            const daysToAdd = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            expenseDate.setDate(expenseDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = expenseDate.getDate() + 7 * (expense.frequency_week_of_month);
        }

        expenseDate.setDate(newDay);
    }

    while (expenseDate.toString() <= toDate) {
        const newTransaction = {
            expense_id: expense.expense_id,
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -expense.expense_amount
        };

        if (expenseDate > new Date()) {
            if (fromDate > expenseDate.toString()) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }
        }

        expenseDate = generateDateFn(expenseDate.toString(), expense);
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
export const generateDailyExpenses = (transactions: any[], skippedTransactions: any[], expense: Expense, toDate: string, fromDate: string): void => {
    const generateDateFn = (currentDate: string, expense: Expense): Date => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (expense.frequency_type_variable || 1));
        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
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
export const generateMonthlyExpenses = (transactions: any[], skippedTransactions: any[], expense: Expense, toDate: string, fromDate: string): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: string, expense: Expense): Date => {
        const expenseDate: Date = new Date(expense.expense_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        expenseDate.setMonth(expenseDate.getMonth() + monthsIncremented + (expense.frequency_type_variable || 1));

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            let newDay: number;

            if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
                let daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
                daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = expenseDate.getDate() + daysUntilNextFrequency;
            }

            if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
                // first day of the month
                expenseDate.setDate(1);
                const daysToAdd: number = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
                // setting to the first occurrence of the desired day of week
                expenseDate.setDate(expenseDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay = expenseDate.getDate() + 7 * (expense.frequency_week_of_month);
            }

            expenseDate.setDate(newDay);
        }

        monthsIncremented += (expense.frequency_type_variable || 1);

        return expenseDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
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
export const generateWeeklyExpenses = (transactions: any[], skippedTransactions: any[], expense: Expense, toDate: string, fromDate: string): void => {
    const expenseDate: Date = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
        const startDay: number = new Date(expense.expense_begin_date).getDay();
        const frequency_day_of_week: number = expense.frequency_day_of_week;

        expenseDate.setDate(expenseDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    const generateDateFn = (currentDate: string, expense: Expense): Date => {
        const newDate: Date = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7 * (expense.frequency_type_variable || 1));
        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};

export const generateYearlyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    let yearsIncremented = 0;
    const generateDateFn = (currentDate, expense) => {
        const newDate = new Date(expense.expense_begin_date);
        newDate.setFullYear(newDate.getFullYear() + yearsIncremented + (expense.frequency_type_variable || 1));

        if (expense.frequency_month_of_year !== null && expense.frequency_month_of_year !== undefined) {
            newDate.setMonth(expense.frequency_month_of_year);
        }

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            const daysToAdd = (7 - newDate.getDay() + expense.frequency_day_of_week) % 7;
            newDate.setDate(newDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate = new Date(newDate.getTime());
                proposedDate.setDate(proposedDate.getDate() + 7 * (expense.frequency_week_of_month));

                if (proposedDate.getMonth() === newDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    newDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }

        yearsIncremented += (expense.frequency_type_variable || 1);

        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};
