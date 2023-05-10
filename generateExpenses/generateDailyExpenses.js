const generateDailyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    const startDate = expense.expense_begin_date.getDate();

    for (let i = 0; ; i += (expense.frequency_type_variable || 1)) {
        const expenseDate = new Date(expense.expense_begin_date);
        expenseDate.setDate(startDate + i);

        // If the expense date is after toDate, stop generating expenses
        if (expenseDate > toDate) {
            break;
        }

        const newTransaction = {
            title: expense.expense_title,
            description: expense.expense_description,
            date: expenseDate,
            amount: -expense.expense_amount,
        };

        if (expenseDate <= new Date()) {
            return transactions;
        } else if (fromDate > expenseDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

module.exports = generateDailyExpenses;