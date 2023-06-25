const generateExpenses = (transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
        // let daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;

        // if (daysUntilNextFrequency === 0) {
        //     daysUntilNextFrequency += 7;
        // }

        // expenseDate.setDate(expenseDate.getDate() + daysUntilNextFrequency);

        // // set to the corresponding week of the month
        // if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
        //     // add the number of weeks, but check if it overflows into the next month
        //     expenseDate.setDate(7 * (expense.frequency_week_of_month)); // subtract one because we've already found the first week
        // }

        let newDay;

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = expenseDate.getDate() + daysUntilNextFrequency;
        }

        if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
            // first day of the month
            expenseDate.setDate(1);
            let daysToAdd = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            expenseDate.setDate(expenseDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = expenseDate.getDate() + 7 * (expense.frequency_week_of_month - 1);
        }

        expenseDate.setDate(newDay);
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
    let monthsIncremented = 0;
    const generateDateFn = (currentDate, expense) => {
        const expenseDate = new Date(expense.expense_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        expenseDate.setMonth(expenseDate.getMonth() + monthsIncremented + (expense.frequency_type_variable || 1));

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency = (7 + expense.frequency_day_of_week - expenseDate.getDay()) % 7;

            if (daysUntilNextFrequency === 0) {
                daysUntilNextFrequency += 7;
            }

            expenseDate.setDate(expenseDate.getDate() + daysUntilNextFrequency);

            // set to the corresponding week of the month
            if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
                // add the number of weeks, but check if it overflows into the next month
                expenseDate.setDate(7 * (expense.frequency_week_of_month) - 1); // subtract one because we've already found the first week
            }
        }

        console.log(expenseDate);

        monthsIncremented += (expense.frequency_type_variable || 1);

        return expenseDate;
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
        const newDate = new Date(expense.expense_begin_date);
        newDate.setMonth(newDate.getMonth() + monthsIncremented + (expense.frequency_type_variable || 1));

        if (expense.frequency_day_of_week !== null && expense.frequency_day_of_week !== undefined) {
            let daysToAdd = (7 - newDate.getDay() + expense.frequency_day_of_week) % 7;
            newDate.setDate(newDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (expense.frequency_week_of_month !== null && expense.frequency_week_of_month !== undefined) {
                // add the number of weeks, but check if it overflows into the next month
                let proposedDate = new Date(newDate.getTime());
                proposedDate.setDate(proposedDate.getDate() + 7 * (expense.frequency_week_of_month - 1)); // subtract one because we've already found the first week

                if (proposedDate.getMonth() === newDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    newDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }

        monthsIncremented += (expense.frequency_type_variable || 1);

        return newDate;
    };

    generateExpenses(transactions, skippedTransactions, expense, toDate, fromDate, generateDateFn);
};