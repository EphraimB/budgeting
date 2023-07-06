import { Expense, Loan, Wishlist, Transfer, Account, Employee, Transaction, PayrollDate, PayrollTax } from "../types/types";

export const employees: Employee[] = [
    {
        employee_id: 1,
        name: 'Test Employee',
        hourly_rate: 10,
        regular_hours: 40,
        vacation_days: 10,
        sick_days: 10,
        work_schedule: '0111100'
    }
];

export const accounts: Account[] = [
    {
        account_id: 1,
        account_name: 'Test Account',
        account_type: 0,
        account_balance: 1000,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        account_id: 2,
        account_name: 'Test Account 2',
        account_type: 1,
        account_balance: 2000,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const transactions: Transaction[] = [
    {
        transaction_id: 1,
        account_id: 1,
        transaction_amount: 1000,
        transaction_title: 'Test Deposit',
        transaction_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 2,
        account_id: 1,
        transaction_amount: 2000,
        transaction_title: 'Test Deposit 2',
        transaction_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 3,
        account_id: 1,
        transaction_amount: 1000,
        transaction_title: 'Test Withdrawal',
        transaction_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 4,
        account_id: 1,
        transaction_amount: 200,
        transaction_title: 'Test Withdrawal 2',
        transaction_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const expenses: Expense[] = [
    {
        expense_id: 1,
        account_id: 1,
        expense_amount: 50,
        expense_title: 'Test Expense',
        expense_description: 'Test Expense to test the expense route',
        frequency_type: 2,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        expense_begin_date: '2020-01-01',
        expense_end_date: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        expense_id: 2,
        account_id: 1,
        expense_amount: 100,
        expense_title: 'Test Expense 2',
        expense_description: 'Test Expense 2 to test the expense route',
        frequency_type: 2,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        expense_begin_date: '2020-01-01',
        expense_end_date: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const loans: Loan[] = [
    {
        loan_id: 1,
        account_id: 1,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_begin_date: '2020-01-01',
        loan_end_date: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const payrolls = [
    {
        start_date: '2020-01-01',
        end_date: '2020-01-15',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40
    },
    {
        start_date: '2020-01-15',
        end_date: '2020-01-31',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40
    }
];

export const payrollDates: PayrollDate[] = [
    {
        payroll_date_id: 1,
        employee_id: 1,
        payroll_start_day: 1,
        payroll_end_day: 15
    },
    {
        payroll_date_id: 2,
        employee_id: 1,
        payroll_start_day: 15,
        payroll_end_day: 31
    }
];

export const payrollTaxes: PayrollTax[] = [
    {
        payroll_taxes_id: 1,
        employee_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1
    },
    {
        payroll_taxes_id: 2,
        employee_id: 1,
        name: 'State Income Tax',
        rate: 0.05
    }
];

export const wishlists: Wishlist[] = [
    {
        wishlist_id: 1,
        account_id: 1,
        wishlist_amount: 1000,
        wishlist_title: 'Test Wishlist',
        wishlist_description: 'Test Wishlist to test the wishlist route',
        wishlist_date_available: null,
        wishlist_url_link: 'https://www.google.com/',
        wishlist_priority: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const transfers: Transfer[] = [
    {
        transfer_id: 1,
        source_account_id: 1,
        destination_account_id: 2,
        transfer_amount: 100,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 2,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];
