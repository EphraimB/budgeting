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
    job: any,
    payroll: any,
    fromDate: Dayjs,
): void => {
    const payroll_end_date: Dayjs = dayjs(payroll.payroll.end_date)
        .hour(11)
        .minute(30);

    const newTransaction = {
        id: uuidv4(),
        title: `Payroll for ${payroll.job_name}`,
        description: `payroll for ${payroll.job_name}`,
        date: payroll_end_date,
        amount: payroll.payroll.gross_pay,
        tax_rate:
            (payroll.payroll.gross_pay - payroll.payroll.net_pay) /
            payroll.payroll.gross_pay,
        total_amount: payroll.payroll.net_pay,
    };

    console.log(newTransaction);

    if (payroll_end_date.diff() > 0) {
        if (payroll_end_date.diff(fromDate) < 0) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generatePayrolls;
