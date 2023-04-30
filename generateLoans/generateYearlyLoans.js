const generateYearlyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    let loanDate = new Date(loan.loan_begin_date);

    // If the frequency day of week is set, generate expenses every month on specified day of week (0 = Sunday, 6 = Saturday). If the week of month is set, generate expenses every month on specified week of month (0 = first week, 1 = second week, 2 = third week, 3 = fourth week, 4 = last week)
    if (loan.frequency_day_of_week) {
        let firstDate = new Date(loanDate.getFullYear(), loanDate.getMonth(), loan.frequency_week_of_month !== null ? 1 + (7 * (loan.frequency_week_of_month)) : loan.loan_begin_date.getDate());

        while (firstDate.getDay() !== loan.frequency_day_of_week) {
            firstDate.setDate(firstDate.getDate() + 1)
        }

        loanDate = firstDate;
    }

    while (loanDate <= toDate) {
        const newTransaction = {
            title: loan.loan_title,
            description: loan.loan_description,
            date: new Date(loanDate),
            amount: -loan.loan_plan_amount,
        };

        if (fromDate > loanDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }

        if (loan.frequency_day_of_week) {
            let firstDate = new Date(loanDate.getFullYear() + (loan.frequency_type_variable || 1), loanDate.getMonth(), loan.frequency_week_of_month !== null ? 1 + (7 * (loan.frequency_week_of_month)) : loan.loan_begin_date.getDate());

            while (firstDate.getDay() !== loan.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1)
            }

            loanDate = firstDate;
        } else {
            loanDate.setFullYear(loanDate.getFullYear() + (loan.frequency_type_variable || 1));
        }
    }
};

module.exports = generateYearlyLoans;