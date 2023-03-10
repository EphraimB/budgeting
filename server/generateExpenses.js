const generateExpenses = (transactions, expense, toDate) => {
    const startDay = expense.expense_begin_date.getDay();
    const amount = expense.expense_amount;

    for (let i = 0; ; i += expense.frequency) {
        const expenseDate = new Date(expense.expense_begin_date);
        expenseDate.setDate(startDay + i);

        // If the expense date is after toDate, stop generating expenses
        if (expenseDate > toDate) {
            break;
        }

        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: expenseDate,
            amount: -amount,
        });
    }
};

module.exports = generateExpenses;