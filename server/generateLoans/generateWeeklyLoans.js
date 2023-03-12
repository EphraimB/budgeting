const generateWeeklyLoans = (transactions, loan, toDate) => {
    let loanDate = new Date(loan.loan_begin_date);

    if (loan.frequency_day_of_week) {
        // If the expense day of week is set, generate expenses every week on specified day of week (0 = Sunday, 6 = Saturday)
        const startDay = loan.loan_begin_date.getDay();
        const frequency_day_of_week = loan.frequency_day_of_week;

        loanDate.setDate(loanDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    while (loanDate <= toDate) {
        transactions.push({
            title: loan.loan_title,
            description: loan.loan_description,
            date: new Date(loanDate), // create a new Date object to avoid modifying the same object in each iteration
            amount: -loan.loan_amount,
        });
        loanDate.setDate(loanDate.getDate() + 7);
    }
};


module.exports = generateWeeklyLoans;