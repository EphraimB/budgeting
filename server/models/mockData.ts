import {
    type Income,
    type Expense,
    type Loan,
    type Wishlist,
    type Transfer,
    type Account,
    type Employee,
    type Transaction,
    type PayrollDate,
    type PayrollTax,
    type Taxes,
    FareDetails,
    CommuteTicket,
    Timeslots,
} from '../types/types';

export const employees: Employee[] = [
    {
        employee_id: 1,
        name: 'Test Employee',
        hourly_rate: 10,
        regular_hours: 40,
        vacation_days: 10,
        sick_days: 10,
        work_schedule: '0111100',
    },
];

export const accounts: Account[] = [
    {
        account_id: 1,
        account_name: 'Test Account',
        account_balance: 1000,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        account_id: 2,
        account_name: 'Test Account 2',
        account_balance: 2000,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const transactions: Transaction[] = [
    {
        transaction_id: 1,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit',
        transaction_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 2,
        account_id: 1,
        transaction_amount: 2000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Deposit 2',
        transaction_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 3,
        account_id: 1,
        transaction_amount: 1000,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal',
        transaction_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        transaction_id: 4,
        account_id: 1,
        transaction_amount: 200,
        transaction_tax_rate: 0,
        transaction_title: 'Test Withdrawal 2',
        transaction_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const taxes: Taxes[] = [
    {
        tax_id: 1,
        tax_rate: 0,
        tax_title: 'Test Tax',
        tax_description: 'Test Tax',
        tax_type: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const income: Income[] = [
    {
        id: 1,
        account_id: 1,
        tax_id: 1,
        income_amount: 1000,
        income_title: 'Test Income',
        income_description: 'Test Income to test the income route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        income_begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const expenses: Expense[] = [
    {
        id: 1,
        account_id: 1,
        tax_id: 1,
        amount: 50,
        title: 'Test Expense',
        description: 'Test Expense to test the expense route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0,
        begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        account_id: 1,
        tax_id: 1,
        amount: 100,
        title: 'Test Expense 2',
        description: 'Test Expense 2 to test the expense route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0.1,
        begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 3,
        account_id: 1,
        tax_id: 1,
        amount: 50,
        title: 'Test Expense 3',
        description: 'Test Expense 3 to test the expense route',
        frequency_type: 0,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0.15,
        begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 4,
        account_id: 1,
        tax_id: 1,
        amount: 25,
        title: 'Test Expense 3',
        description: 'Test Expense 3 to test the expense route',
        frequency_type: 1,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0.05,
        begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 5,
        account_id: 1,
        tax_id: null,
        amount: 50,
        title: 'Test Expense 3',
        description: 'Test Expense 3 to test the expense route',
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        subsidized: 0.05,
        begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const loans: Loan[] = [
    {
        id: 1,
        cron_job_id: 1,
        account_id: 1,
        tax_id: null,
        loan_amount: 10000,
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
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0,
        loan_begin_date: '2020-01-02',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        cron_job_id: 2,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 0,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.15,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 3,
        cron_job_id: 3,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 1,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.1,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 4,
        cron_job_id: 4,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.05,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const payrolls = [
    {
        start_date: '2020-01-01',
        end_date: '2020-01-15',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40,
    },
    {
        start_date: '2020-01-15',
        end_date: '2020-01-31',
        work_days: 5,
        gross_pay: 500,
        net_pay: 400,
        hours_worked: 40,
    },
];

export const payrollDates: PayrollDate[] = [
    {
        payroll_date_id: 1,
        employee_id: 1,
        payroll_start_day: 1,
        payroll_end_day: 15,
    },
    {
        payroll_date_id: 2,
        employee_id: 1,
        payroll_start_day: 15,
        payroll_end_day: 31,
    },
];

export const payrollTaxes: PayrollTax[] = [
    {
        payroll_taxes_id: 1,
        employee_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        payroll_taxes_id: 2,
        employee_id: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

export const wishlists: Wishlist[] = [
    {
        wishlist_id: 1,
        cron_job_id: 1,
        tax_id: 1,
        account_id: 1,
        wishlist_amount: 1000,
        wishlist_title: 'Test Wishlist',
        wishlist_description: 'Test Wishlist to test the wishlist route',
        wishlist_date_available: null,
        wishlist_url_link: 'https://www.google.com/',
        wishlist_priority: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const transfers: Transfer[] = [
    {
        id: 1,
        cron_job_id: 1,
        source_account_id: 1,
        destination_account_id: 2,
        transfer_amount: 100,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        cron_job_id: 2,
        source_account_id: 1,
        destination_account_id: 2,
        transfer_amount: 25,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 0,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 3,
        cron_job_id: 3,
        source_account_id: 1,
        destination_account_id: 2,
        transfer_amount: 50,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 1,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 4,
        cron_job_id: 4,
        source_account_id: 1,
        destination_account_id: 2,
        transfer_amount: 200,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 5,
        cron_job_id: 5,
        source_account_id: 2,
        destination_account_id: 1,
        transfer_amount: 200,
        transfer_title: 'Test Transfer',
        transfer_description: 'Test Transfer to test the transfer route',
        transfer_begin_date: '2020-01-01',
        transfer_end_date: null,
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const commuteSystems = [
    {
        commute_system_id: 1,
        name: 'OMNY',
        fare_cap: 33,
        fare_cap_duration: 1,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        commute_system_id: 2,
        name: 'LIRR',
        fare_cap: null,
        fare_cap_duration: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const commuteHistory = [
    {
        commute_history_id: 1,
        account_id: 1,
        fare_amount: 2.75,
        commute_system: 'OMNY',
        fare_type: 'Single Ride',
        timestamp: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        commute_history_id: 2,
        account_id: 1,
        fare_amount: 9.75,
        commute_system: 'LIRR',
        fare_type: 'Off-Peak',
        timestamp: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const fareDetails: any[] = [
    {
        fare_detail_id: 1,
        commute_system_id: 1,
        system_name: 'OMNY',
        fare_type: 'Single Ride',
        fare_amount: 2.75,
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        fare_detail_id: 2,
        commute_system_id: 1,
        system_name: 'LIRR',
        fare_type: 'Weekly',
        fare_amount: 33,
        alternate_fare_detail_id: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

export const timeslots: Timeslots[] = [
    {
        timeslot_id: 1,
        fare_detail_id: 1,
        day_of_week: 0,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
    {
        timeslot_id: 2,
        fare_detail_id: 2,
        day_of_week: 0,
        start_time: '00:00:00',
        end_time: '23:59:59',
    },
];

export const commuteTickets: CommuteTicket[] = [
    {
        commute_ticket_id: 1,
        fare_detail_id: 1,
        name: 'OMNY Single Ride',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        commute_ticket_id: 2,
        fare_detail_id: 2,
        name: 'LIRR Weekly',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];
