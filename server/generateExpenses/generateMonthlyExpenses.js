const generateMonthlyExpenses = (transactions, expense, toDate) => {
    const expenseDate = new Date(expense.expense_begin_date);

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