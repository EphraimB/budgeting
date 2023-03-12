const generateDailyLoans = (transactions, loan, toDate) => {
    const startDay = loan.loan_begin_date.getDay();
    const planAmount = loan.loan_plan_amount;

    for (let i = 0; ; i++) {
        const loanDate = new Date(loan.loan_begin_date);
        console.log(loanDate);
        loanDate.setDate(startDay + i);
        console.log(loanDate);

        // If the loan date is after toDate, stop generating loans
        if (loanDate > toDate) {
            break;
        }

        transactions.push({
            title: loan.loan_title + ' loan to ' + loan.loan_recipient,
            description: loan.loan_description,
            date: loanDate,
            amount: -planAmount,
        });
    }
};

module.exports = generateDailyLoans;