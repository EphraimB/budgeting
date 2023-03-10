const generateWeeklyExpenses = (transactions, expense, toDate) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week) {
        // If the expense day of week is set, generate expenses every week on specified day of week (0 = Sunday, 6 = Saturday)
        const startDay = expense.expense_begin_date.getDay();
        const frequency_day_of_week = expense.frequency_day_of_week;

        expenseDate.setDate(expenseDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    while (expenseDate <= toDate) {
        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate), // create a new Date object to avoid modifying the same object in each iteration
            amount: -expense.expense_amount,
        });
        expenseDate.setDate((expenseDate.getDate() + 7) * (expense.frequency_type_variable || 1));
    }
};


module.exports = generateWeeklyExpenses;