const generateExpenses = (expense, balance, months) => {
    const expenses = [];

    for (let i = 0; i < months; i++) {
        const date = new Date(expense.expense_begin_date);
        console.log(date);
        date.setMonth(date.getMonth() + i + 1);

        expenses.push({
            title: expense.expense_title,
            description: expense.expense_description,
            date,
            type: 0,
            amount: expense.expense_amount,
            balance: balance -= parseFloat(expense.expense_amount.substring(1)),
        });
    }

    return expenses;
};

module.exports = generateExpenses;