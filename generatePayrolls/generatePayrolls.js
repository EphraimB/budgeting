const generatePayrolls = (transactions, payrolls, toDate) => {
    let payroll_end_date = new Date(payrolls.payroll_end_date);

    transactions.push({
        title: "Payroll",
        description: "payroll",
        date: new Date(payroll_end_date),
        amount: payrolls.net_pay,
    });

    // Payroll_end_day should jump to the next month
    payroll_end_date.setMonth(payroll_end_date.getMonth() + 1);
}

module.exports = generatePayrolls;