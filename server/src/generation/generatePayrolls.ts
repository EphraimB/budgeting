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
    jobName: string,
    payroll: any,
    fromDate: Dayjs,
): void => {
    const payrollEndDate: Dayjs = dayjs(payroll.end_date).hour(11).minute(30);

    const newTransaction = {
        id: uuidv4(),
        title: `Payroll for ${jobName}`,
        description: `payroll for ${jobName}`,
        date: payrollEndDate,
        amount: payroll.gross_pay,
        taxRate: (payroll.gross_pay - payroll.net_pay) / payroll.gross_pay,
        totalAmount: payroll.net_pay,
    };

    if (payrollEndDate.diff() > 0) {
        if (payrollEndDate.diff(fromDate) < 0) {
            skippedTransactions.push(newTransaction);
        } else {
            transactions.push(newTransaction);
        }
    }
};

export default generatePayrolls;
