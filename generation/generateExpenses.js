const generateExpenses = (transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week !== null) {
        const daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
        
        if (daysUntilNextFrequency === 0) {
            daysUntilNextFrequency += 7;
        }

        expenseDate.setDate(expenseDate.getDate() + daysUntilNextFrequency);
    }

    console.log(expenseDate);

    while (expenseDate <= toDate) {
        const newTransaction = {
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -expense.expense_amount,
        };

        if (expenseDate <= new Date()) {

        } else if (fromDate > expenseDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }

        expenseDate = generateDateFn(expenseDate, expense);
    }
};

export const generateDailyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    const generateDateFn = (currentDate, expense) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (expense.frequency_type_variable || 1));
        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};

export const generateMonthlyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    const generateDateFn = (currentDate, expense) => {
        const newDate = new Date(currentDate);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        newDate.setMonth(newDate.getMonth() + (expense.frequency_type_variable || 1));

        if (expense.frequency_day_of_week !== null) {
            let daysToAdd = (7 + expense.frequency_day_of_week - newDate.getDay()) % 7;

            if (daysToAdd === 0) {
                daysToAdd += 7;
            }

            newDate.setDate(newDate.getDate() + daysToAdd);
        }

        console.log(newDate);

        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};

export const generateWeeklyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week) {
        const startDay = expense.expense_begin_date.getDay();
        const frequency_day_of_week = expense.frequency_day_of_week;

        expenseDate.setDate(expenseDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    const generateDateFn = (currentDate, expense) => {
        const newDate = new Date(currentDate);
        newDate.setDate((newDate.getDate() + 7) * (expense.frequency_type_variable || 1));
        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};

export const generateYearlyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    const generateDateFn = (currentDate, expense) => {
        const newDate = new Date(currentDate);

        if (expense.frequency_day_of_week) {
            let firstDate = new Date(
                newDate.getFullYear() + (expense.frequency_type_variable || 1),
                newDate.getMonth(),
                expense.frequency_week_of_month !== null
                    ? 1 + 7 * expense.frequency_week_of_month
                    : expense.expense_begin_date.getDate()
            );

            while (firstDate.getDay() !== expense.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1);
            }

            return firstDate;
        } else {
            newDate.setFullYear(newDate.getFullYear() + (expense.frequency_type_variable || 1));
            return newDate;
        }
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};