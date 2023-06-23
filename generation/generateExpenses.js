const generateExpenses = (transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week) {
        let firstDate = new Date(
            expenseDate.getFullYear(),
            expenseDate.getMonth(),
            expense.frequency_week_of_month !== null
                ? 1 + 7 * expense.frequency_week_of_month
                : expense.expense_begin_date.getDate()
        );

        while (firstDate.getDay() !== expense.frequency_day_of_week) {
            firstDate.setDate(firstDate.getDate() + 1);
        }

        expenseDate = firstDate;
    }

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

        if (expense.frequency_day_of_week !== null) {
            newDate.setMonth(newDate.getMonth() + (expense.frequency_type_variable || 1));
            newDate.setDate(1 + 7 * expense.frequency_week_of_month);
            // let firstDate = new Date(
            //     newDate.getFullYear(),
            //     newDate.getMonth() + (expense.frequency_type_variable || 1),
            //     expense.frequency_week_of_month !== null
            //         ? 1 + 7 * expense.frequency_week_of_month
            //         : expense.expense_begin_date.getDate()
            // );            

            while (newDate.getDay() !== expense.frequency_day_of_week) {
                newDate.setDate(newDate.getDate() + 1);
            }

            return newDate;
        } else {
            newDate.setMonth(newDate.getMonth() + (expense.frequency_type_variable || 1));
            return newDate;
        }
    };

    console.log(generateDateFn);

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