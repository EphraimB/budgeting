const generateMonthlyExpenses = (transactions, expense, toDate) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week) {
        // If the expense day of week is set, generate expenses every week on specified day of week (0 = Sunday, 6 = Saturday)
        const startDay = expense.expense_begin_date.getDay();
        const frequency_day_of_week = expense.frequency_day_of_week;

        expenseDate.setDate(expenseDate.getDate() + (frequency_day_of_week + 28 - startDay) % 7);
    }

    while (expenseDate <= toDate) {
        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate),
            amount: -expense.expense_amount,
        });

        // Move to the next month
        expenseDate.setMonth(expenseDate.getMonth() + 1);
    }
};

module.exports = generateMonthlyExpenses;