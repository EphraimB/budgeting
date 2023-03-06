const generateExpenses = (transactions, expense, balance, months) => {
    const startMonth = expense.expense_begin_date.getMonth();
    const currentDate = new Date();
    const amount = parseFloat(expense.expense_amount.substring(1));

    for (let i = 0; i < months; i++) {
        const expenseDate = new Date(expense.expense_begin_date);
        expenseDate.setMonth(startMonth + i);

        // If the expense date is in the future, skip this month
        if (expenseDate.getMonth() >= currentDate.getMonth()) {
            continue;
        }

        transactions.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date: expenseDate,
            amount,
            balance: balance - amount
        });

        balance -= expense.amount;
    }
};

module.exports = generateExpenses;