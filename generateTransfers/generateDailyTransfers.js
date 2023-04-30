const generateDailyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const startDate = transfer.transfer_begin_date.getDate();

    for (let i = 0; ; i += (transfer.frequency_type_variable || 1)) {
        const transferDate = new Date(transfer.transfer_begin_date);
        transferDate.setDate(startDate + i);

        // If the loan date is after toDate, stop generating loans
        if (transferDate > toDate) {
            break;
        }

        const newTransaction = {
            title: transfer.transfer_title,
            description: transferDate.transferDate_description,
            date: transferDate,
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount,
        };

        if (fromDate > transferDate) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

module.exports = generateDailyTransfers;