import { type Payroll, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { type Dayjs } from 'dayjs';

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
    fromDate: Dayjs,
): void => {
    const payroll_end_date: Dayjs = dayjs(payrolls.end_date)
        .hour(11)
        .minute(30);

    const newTransaction = {
        id: uuidv4(),
        title: 'Payroll',
        description: 'payroll',
        date: payroll_end_date,
        amount: payrolls.gross_pay,
        tax_rate: (payrolls.gross_pay - payrolls.net_pay) / payrolls.gross_pay,
        total_amount: payrolls.net_pay,
    };

    if (payroll_end_date.diff() > 0) {
        if (payroll_end_date.diff(fromDate) < 0) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generatePayrolls;
