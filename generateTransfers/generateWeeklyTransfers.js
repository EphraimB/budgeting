const generateWeeklyTransfers = (transactions, transfer, toDate, account_id) => {
    let transferDate = new Date(transfer.transfer_begin_date);

    if (transfer.frequency_day_of_week) {
        // If the transfer day of week is set, generate expenses every week on specified day of week (0 = Sunday, 6 = Saturday)
        const startDay = transfer.transfer_begin_date.getDay();
        const frequency_day_of_week = transfer.frequency_day_of_week;

        transferDate.setDate(transferDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    while (transferDate <= toDate) {
        transactions.push({
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: new Date(transferDate), // create a new Date object to avoid modifying the same object in each iteration
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        });
        transferDate.setDate(transferDate.getDate() + 7 * (transfer.frequency_type_variable || 1));
    }
};


module.exports = generateWeeklyTransfers;