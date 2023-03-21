const generateDailyTransfers = (transactions, transfer, toDate, account_id) => {
    const startDate = transfer.transfer_begin_date.getDate();

    for (let i = 0; ; i += (transfer.frequency_type_variable || 1)) {
        const transferDate = new Date(transfer.transfer_begin_date);
        transferDate.setDate(startDate + i);

        // If the loan date is after toDate, stop generating loans
        if (transferDate > toDate) {
            break;
        }

        transactions.push({
            title: transfer.transfer_title,
            description: transferDate.transferDate_description,
            date: transferDate,
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        });
    }
};

module.exports = generateDailyTransfers;