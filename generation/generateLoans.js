const generateLoans = (transactions, skippedTransactions, loan, toDate, fromDate, generateDateFn) => {
    let loanDate = new Date(loan.loan_begin_date);

    if (loan.frequency_month_of_year !== null && loan.frequency_month_of_year !== undefined) {
        loanDate.setMonth(loan.frequency_month_of_year);
    }

    if (loan.frequency_day_of_week !== null && loan.frequency_day_of_week !== undefined) {
        let newDay;

        if (loan.frequency_day_of_week !== null && loan.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency = (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
            daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = loanDate.getDate() + daysUntilNextFrequency;
        }

        if (loan.frequency_week_of_month !== null && loan.frequency_week_of_month !== undefined) {
            // first day of the month
            loanDate.setDate(1);
            let daysToAdd = (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            loanDate.setDate(loanDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = loanDate.getDate() + 7 * (loan.frequency_week_of_month);
        }

        loanDate.setDate(newDay);
    }

    while (loanDate <= toDate) {
        const newTransaction = {
            title: loan.loan_title + ' loan to ' + loan.loan_recipient,
            description: loan.loan_description,
            date: new Date(loanDate),
            amount: -loan.loan_plan_amount,
        };

        if (loanDate <= new Date()) {

        } else if (fromDate > loanDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }

        loanDate = generateDateFn(loanDate, loan);
    }
};

export const generateDailyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    const generateDateFn = (currentDate, loan) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (loan.frequency_type_variable || 1));
        return newDate;
    };

    generateLoans(transactions, skippedTransactions, loan, toDate, fromDate, generateDateFn);
};

export const generateMonthlyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    let monthsIncremented = 0;
    const generateDateFn = (currentDate, loan) => {
        const loanDate = new Date(loan.loan_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        loanDate.setMonth(loanDate.getMonth() + monthsIncremented + (loan.frequency_type_variable || 1));

        if (loan.frequency_day_of_week !== null && loan.frequency_day_of_week !== undefined) {
            let newDay;

            if (loan.frequency_day_of_week !== null && loan.frequency_day_of_week !== undefined) {
                let daysUntilNextFrequency = (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
                daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = loanDate.getDate() + daysUntilNextFrequency;
            }

            if (loan.frequency_week_of_month !== null && loan.frequency_week_of_month !== undefined) {
                // first day of the month
                loanDate.setDate(1);
                let daysToAdd = (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
                // setting to the first occurrence of the desired day of week
                loanDate.setDate(loanDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay = loanDate.getDate() + 7 * (loan.frequency_week_of_month);
            }

            loanDate.setDate(newDay);
        }

        monthsIncremented += (loan.frequency_type_variable || 1);

        return loanDate;
    };

    generateLoans(transactions, skippedTransactions, loan, toDate, fromDate, generateDateFn);
};

export const generateWeeklyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    let loanDate = new Date(loan.loan_begin_date);

    if (loan.frequency_day_of_week) {
        const startDay = loan.loan_begin_date.getDay();
        const frequency_day_of_week = loan.frequency_day_of_week;

        loanDate.setDate(loanDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    const generateDateFn = (currentDate, loan) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7 * (loan.frequency_type_variable || 1));
        return newDate;
    };

    generateLoans(transactions, skippedTransactions, loan, toDate, fromDate, generateDateFn);
};

export const generateYearlyLoans = (transactions, skippedTransactions, loan, toDate, fromDate) => {
    const generateDateFn = (currentDate, loan) => {
        const newDate = new Date(currentDate);

        if (loan.frequency_day_of_week) {
            let firstDate = new Date(
                newDate.getFullYear() + (loan.frequency_type_variable || 1),
                newDate.getMonth(),
                loan.frequency_week_of_month !== null ? 1 + 7 * loan.frequency_week_of_month : loan.loan_begin_date.getDate()
            );

            while (firstDate.getDay() !== loan.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1);
            }

            return firstDate;
        } else {
            newDate.setFullYear(newDate.getFullYear() + (loan.frequency_type_variable || 1));
            return newDate;
        }
    };

    generateLoans(transactions, skippedTransactions, loan, toDate, fromDate, generateDateFn);
};
