import { type Payroll, type GeneratedTransaction } from '../types/types';

/**
 *
 * @param transactions - The transactions to generate payrolls for
 * @param skippedTransactions - The transactions to skip
 * @param payrolls - The payrolls to generate
 * @param fromDate - The date to generate payrolls from
 * Generate payrolls for a given payroll
 */
const generatePayrolls = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    payrolls: Payroll,
    fromDate: Date,
): void => {
    const payroll_end_date: Date = new Date(payrolls.end_date);

    const newTransaction = {
        title: 'Payroll',
        description: 'payroll',
        date: new Date(payroll_end_date),
        amount: payrolls.gross_pay,
        tax_rate: parseFloat(
            (
                (payrolls.gross_pay - payrolls.net_pay) /
                payrolls.gross_pay
            ).toFixed(4),
        ),
        total_amount: payrolls.net_pay,
    };

    if (payroll_end_date > new Date()) {
        if (fromDate > payroll_end_date) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generatePayrolls;
