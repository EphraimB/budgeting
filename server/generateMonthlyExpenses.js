const generateMonthlyExpenses = (transactions, expense, toDate) => {
    const startMonth = expense.expense_begin_date.getMonth();
    const amount = parseFloat(expense.expense_amount.substring(1).replaceAll(',', ''));

    for (let i = 0; ; i++) {
        const expenseDate = new Date(expense.expense_begin_date);
        expenseDate.setMonth(startMonth + i);

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

module.exports = generateMonthlyExpenses;