const generateExpenses = (transactions, expense, balance, months) => {
    const startMonth = expense.expense_begin_date.getMonth();
    const currentDate = new Date();
    const amount = parseFloat(expense.expense_amount.substring(1));

    console.log(currentDate);

    for (let i = 0; i < months; i++) {
        const expenseDate = new Date(expense.expense_begin_date.getFullYear(), expense.expense_begin_date.getMonth() + i, expense.expense_begin_date.getDate());

        console.log(expenseDate);

        // If the expense date is in the future, skip this month
        if (startMonth > currentDate.getMonth()) {
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