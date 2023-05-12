const generatePayrolls = (transactions, skippedTransactions, payrolls, fromDate) => {
    let payroll_end_date = new Date(payrolls.end_date);

    const newTransaction = {
        title: "Payroll",
        description: "payroll",
        date: new Date(payroll_end_date),
        amount: parseFloat(payrolls.net_pay),
    };

    if (payroll_end_date <= new Date()) {
        return transactions;
    } else if(fromDate > payroll_end_date) {
        skippedTransactions.push(newTransaction);
    } else {
        transactions.push(newTransaction);
    }
}

export default generatePayrolls;