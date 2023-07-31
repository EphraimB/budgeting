import { GeneratedTransaction, Payroll } from '../../types/types';
import generatePayrolls from '../../generation/generatePayrolls';
import MockDate from 'mockdate';

beforeAll(() => {
    MockDate.set('2020-01-01');
});

afterAll(() => {
    MockDate.reset();
});

let transactions: GeneratedTransaction[];
let skippedTransactions: GeneratedTransaction[];

beforeEach(() => {
    transactions = [];
    skippedTransactions = [];
});

describe('generatePayrolls', () => {
    it('should generate payroll transaction', () => {
        const payroll: Payroll = {
            end_date: '2023-08-01',
            net_pay: 2000,
            gross_pay: 3000,
        };
        const fromDate: Date = new Date('2023-07-01');

        generatePayrolls(transactions, skippedTransactions, payroll, fromDate);

        // check if transactions array has one new element
        expect(transactions).toHaveLength(1);
        const payrollTransaction: GeneratedTransaction = transactions[0];

        // check if the new transaction has correct properties
        expect(payrollTransaction.title).toBe('Payroll');
        expect(payrollTransaction.description).toBe('payroll');
        expect(payrollTransaction.date).toEqual(new Date(payroll.end_date));
        expect(payrollTransaction.amount).toBe(payroll.gross_pay);
        expect(payrollTransaction.tax_rate).toBe(parseFloat(((payroll.gross_pay - payroll.net_pay) / payroll.gross_pay).toFixed(4)));
        expect(payrollTransaction.total_amount).toBe(payroll.net_pay);
    });

    it('should not generate payroll transaction for past date', () => {
        const payroll: Payroll = {
            end_date: '2022-08-01',
            net_pay: 2000,
            gross_pay: 3000,
        };
        const fromDate: Date = new Date('2023-07-01');

        generatePayrolls(transactions, skippedTransactions, payroll, fromDate);

        // check if transactions array is still empty
        expect(transactions).toHaveLength(0);
    });

    it('should add payroll transaction to skippedTransactions for future date before fromDate', () => {
        const payroll: Payroll = {
            end_date: '2023-06-01',
            net_pay: 2000,
            gross_pay: 3000,
        };
        const fromDate: Date = new Date('2023-07-01');

        generatePayrolls(transactions, skippedTransactions, payroll, fromDate);

        // check if transactions array is still empty
        expect(transactions).toHaveLength(0);

        // check if skippedTransactions array has one new element
        expect(skippedTransactions).toHaveLength(1);
        const payrollTransaction: GeneratedTransaction = skippedTransactions[0];

        // check if the new transaction has correct properties
        expect(payrollTransaction.title).toBe('Payroll');
        expect(payrollTransaction.description).toBe('payroll');
        expect(payrollTransaction.date).toEqual(new Date(payroll.end_date));
        expect(payrollTransaction.amount).toBe(payroll.gross_pay);
        expect(payrollTransaction.tax_rate).toBe(parseFloat(((payroll.gross_pay - payroll.net_pay) / payroll.gross_pay).toFixed(4)));
        expect(payrollTransaction.total_amount).toBe(payroll.net_pay);
    });

    it('should do nothing if payroll date is in the past', () => {
        const payroll: Payroll = {
            end_date: '2019-08-01',
            net_pay: 2000,
            gross_pay: 3000,
        };
        const fromDate: Date = new Date('2020-10-01');

        generatePayrolls(transactions, skippedTransactions, payroll, fromDate);

        // check if transactions array has no elements
        expect(transactions).toHaveLength(0);
    });
});
