const generateDailyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    const startDate = loan.loan_begin_date.getDate();
    const planAmount = loan.loan_plan_amount;

    for (let i = 0; ; i += (loan.frequency_type_variable || 1)) {
        const loanDate = new Date(loan.loan_begin_date);
        loanDate.setDate(startDate + i);

        // If the loan date is after toDate, stop generating loans
        if (loanDate > toDate) {
            break;
        }

        const newTransaction = {
            title: loan.loan_title + ' loan to ' + loan.loan_recipient,
            description: loan.loan_description,
            date: loanDate,
            amount: -planAmount,
        };

        if (fromDate > loanDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

module.exports = generateDailyLoans;