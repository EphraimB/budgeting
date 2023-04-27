const generatePayrolls = (transactions, payrolls) => {
    let payroll_end_date = new Date(payrolls.end_date);

    transactions.push({
        title: "Payroll",
        description: "payroll",
        date: new Date(payroll_end_date),
        amount: parseFloat(payrolls.net_pay),
    });
}

module.exports = generatePayrolls;