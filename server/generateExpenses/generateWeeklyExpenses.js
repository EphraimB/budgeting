const generateWeeklyExpenses = (transactions, expense, toDate) => {
    const startDay = expense.expense_begin_date.getDay();

    if (expense.frequency_day_of_week) {
        // If the expense day of week is set, set it every week to that day, for example, every Monday
        expense.expense_begin_date.setDate(expense.expense_begin_date.getDate() + (expense.expense_day_of_week - 1 - expense.expense_begin_date.getDay() + 7) % 7);

        // If the expense date is after toDate, stop generating expenses
        if (expense.expense_begin_date > toDate) {
            return;
        }

        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: expense.expense_begin_date,
            amount: -expense.expense_amount,
        });
    }
};

module.exports = generateWeeklyExpenses;