const generatePayrolls = (transactions, payrolls, toDate) => {
    let payroll_end_date = new Date(payrolls.end_date);

    transactions.push({
        title: "Payroll",
        description: "payroll",
        date: new Date(payroll_end_date),
        amount: parseInt(payrolls.net_pay),
    });
}

module.exports = generatePayrolls;