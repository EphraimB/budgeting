const generateTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn) => {
    const startDate = transfer.transfer_begin_date.getDate();

    for (let i = 0; ; i += transfer.frequency_type_variable || 1) {
        const transferDate = new Date(transfer.transfer_begin_date);
        transferDate.setDate(startDate + i);

        if (transferDate > toDate) {
            break;
        }

        const newTransaction = {
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: transferDate,
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        };

        if (transferDate <= new Date()) {
            return transactions;
        } else if (fromDate > transferDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
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
            newDate.setMonth(newDate.getMonth() + (transfer.frequency_type_variable || 1));
            return newDate;
        }
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateWeeklyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const generateDateFn = (currentDate, transfer) => {
        const newDate = new Date(currentDate);
        newDate.setDate((newDate.getDate() + 7) * (transfer.frequency_type_variable || 1));
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