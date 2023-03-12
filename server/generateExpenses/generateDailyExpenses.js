const generateDailyExpenses = (transactions, expense, toDate) => {
    const startDate = expense.expense_begin_date.getDate();

    for (let i = 0; ; i++) {
        const expenseDate = new Date(expense.expense_begin_date);
        expenseDate.setDate(startDate + i);

        // If the expense date is after toDate, stop generating expenses
        if (expenseDate > toDate) {
            break;
        }

        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: expenseDate,
            amount: -expense.expense_amount,
        });
    }
};

module.exports = generateDailyExpenses;