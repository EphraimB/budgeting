const generateYearlyExpenses = (transactions, expense, toDate) => {
    let expenseDate = new Date(expense.expense_begin_date);

    // If the frequency day of week is set, generate expenses every month on specified day of week (0 = Sunday, 6 = Saturday). If the week of month is set, generate expenses every month on specified week of month (0 = first week, 1 = second week, 2 = third week, 3 = fourth week, 4 = last week)
    if (expense.frequency_day_of_week) {
        let firstDate = new Date(expenseDate.getFullYear(), expenseDate.getMonth(), expense.frequency_week_of_month !== null ? 1 + (7 * (expense.frequency_week_of_month)) : expense.expense_begin_date.getDate());

        while (firstDate.getDay() !== expense.frequency_day_of_week) {
            firstDate.setDate(firstDate.getDate() + 1)
        }

        expenseDate = firstDate;
    }

    while (expenseDate <= toDate) {
        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -expense.expense_amount,
        });

        if (expense.frequency_day_of_week) {
            let firstDate = new Date(expenseDate.getFullYear() + 1, expenseDate.getMonth(), expense.frequency_week_of_month !== null ? 1 + (7 * (expense.frequency_week_of_month)) : expense.expense_begin_date.getDate());

            while (firstDate.getDay() !== expense.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1)
            }

            expenseDate = firstDate;
        } else {
            expenseDate.setFullYear(expenseDate.getFullYear() + 1);
        }
    }
};

module.exports = generateYearlyExpenses;