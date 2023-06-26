const generateTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn) => {
    let transferDate = new Date(transfer.transfer_begin_date);

    if (transfer.frequency_month_of_year !== null && transfer.frequency_month_of_year !== undefined) {
        transferDate.setMonth(transfer.frequency_month_of_year);
    }

    if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
        let newDay;

        if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
            daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = transferDate.getDate() + daysUntilNextFrequency;
        }

        if (transfer.frequency_week_of_month !== null && transfer.frequency_week_of_month !== undefined) {
            // first day of the month
            transferDate.setDate(1);
            let daysToAdd = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            transferDate.setDate(transferDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = transferDate.getDate() + 7 * (transfer.frequency_week_of_month);
        }

        transferDate.setDate(newDay);
    }

    while (transferDate <= toDate) {
        const newTransaction = {
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: new Date(transferDate),
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        };

        if (transferDate <= new Date()) {

        } else if (fromDate > transferDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }

        transferDate = generateDateFn(transferDate, transfer);
    }
};

export const generateDailyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const generateDateFn = (currentDate, transfer) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + (transfer.frequency_type_variable || 1));
        return newDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateMonthlyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    let monthsIncremented = 0;
    const generateDateFn = (currentDate, transfer) => {
        const transferDate = new Date(transfer.transfer_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        transferDate.setMonth(transferDate.getMonth() + monthsIncremented + (transfer.frequency_type_variable || 1));

        if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
            let newDay;

            if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
                let daysUntilNextFrequency = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
                daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = transferDate.getDate() + daysUntilNextFrequency;
            }

            if (transfer.frequency_week_of_month !== null && transfer.frequency_week_of_month !== undefined) {
                // first day of the month
                transferDate.setDate(1);
                let daysToAdd = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
                // setting to the first occurrence of the desired day of week
                transferDate.setDate(transferDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay = transferDate.getDate() + 7 * (transfer.frequency_week_of_month);
            }

            transferDate.setDate(newDay);
        }

        monthsIncremented += (transfer.frequency_type_variable || 1);

        return transferDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateWeeklyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const transferDate = new Date(transfer.transfer_begin_date);

    if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
        const startDay = new Date(transfer.transfer_begin_date).getDay();
        const frequency_day_of_week = transfer.frequency_day_of_week;

        transferDate.setDate(transferDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    const generateDateFn = (currentDate, transfer) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7 * (transfer.frequency_type_variable || 1));
        return newDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateYearlyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const generateDateFn = (currentDate, transfer) => {
        const newDate = new Date(currentDate);

        if (transfer.frequency_day_of_week) {
            let firstDate = new Date(
                newDate.getFullYear() + (transfer.frequency_type_variable || 1),
                newDate.getMonth(),
                transfer.frequency_week_of_month !== null ? 1 + 7 * transfer.frequency_week_of_month : transfer.transfer_begin_date.getDate()
            );

            while (firstDate.getDay() !== transfer.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1);
            }

            return firstDate;
        } else {
            newDate.setFullYear(newDate.getFullYear() + (transfer.frequency_type_variable || 1));
            return newDate;
        }
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};