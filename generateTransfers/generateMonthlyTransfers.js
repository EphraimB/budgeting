const generateMonthlyTransfers = (transactions, transfer, toDate, account_id) => {
    let transferDate = new Date(transfer.transfer_begin_date);

    // If the frequency day of week is set, generate transfers every month on specified day of week (0 = Sunday, 6 = Saturday). If the week of month is set, generate expenses every month on specified week of month (0 = first week, 1 = second week, 2 = third week, 3 = fourth week, 4 = last week)
    if (transfer.frequency_day_of_week) {
        let firstDate = new Date(transferDate.getFullYear(), transferDate.getMonth(), transfer.frequency_week_of_month !== null ? 1 + (7 * (transfer.frequency_week_of_month)) : transfer.loan_begin_date.getDate());

        while (firstDate.getDay() !== transfer.frequency_day_of_week) {
            firstDate.setDate(firstDate.getDate() + 1)
        }

        transferDate = firstDate;
    }

    while (transferDate <= toDate) {
        transactions.push({
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: new Date(transferDate),
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        });

        if (transfer.frequency_day_of_week) {
            let firstDate = new Date(transferDate.getFullYear(), transferDate.getMonth() + (transfer.frequency_type_variable || 1), transfer.frequency_week_of_month !== null ? 1 + (7 * (transfer.frequency_week_of_month)) : transfer.transfer_begin_date.getDate());

            while (firstDate.getDay() !== transfer.frequency_day_of_week) {
                firstDate.setDate(firstDate.getDate() + 1)
            }

            transferDate = firstDate;
        } else {
            transferDate.setMonth(transferDate.getMonth() + (transfer.frequency_type_variable || 1));
        }
    }
};

module.exports = generateMonthlyTransfers;