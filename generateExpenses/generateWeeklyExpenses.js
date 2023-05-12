const generateWeeklyExpenses = (transactions, skippedTransactions, expense, toDate, fromDate) => {
    let expenseDate = new Date(expense.expense_begin_date);

    if (expense.frequency_day_of_week) {
        // If the expense day of week is set, generate expenses every week on specified day of week (0 = Sunday, 6 = Saturday)
        const startDay = expense.expense_begin_date.getDay();
        const frequency_day_of_week = expense.frequency_day_of_week;

        expenseDate.setDate(expenseDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    while (expenseDate <= toDate) {
        const newTransaction = {
            title: expense.expense_title,
            description: expense.expense_description,
            date: new Date(expenseDate), // create a new Date object to avoid modifying the same object in each iteration
            amount: -expense.expense_amount,
        };

        if (expenseDate <= new Date()) {
            return transactions;
        } else if (fromDate > expenseDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
        
        expenseDate.setDate((expenseDate.getDate() + 7) * (expense.frequency_type_variable || 1));
    }
};


export default generateWeeklyExpenses;