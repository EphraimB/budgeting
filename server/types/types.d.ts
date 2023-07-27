export interface GeneratedTransaction {
    expense_id?: number;
    loan_id?: number;
    transfer_id?: number;
    wishlist_id?: number;
    transaction_id?: number;
    title: string;
    description: string;
    amount: number;
    date: Date;
    date_modified?: Date;
    balance?: number;
}

export interface Transaction {
    account_id: number;
    transaction_id: number;
    transaction_title: string;
    transaction_description: string;
    date_created: string;
    date_modified: string;
    transaction_amount: number;
    balance?: number;
}

export interface TransactionHistory {
    transaction_id: number;
    account_id: number;
    transaction_amount: number;
    transaction_title: string;
    transaction_description: string;
    date_created: string;
    date_modified: string;
}

export interface Account {
    account_id: number;
    employee_id?: number;
    account_name: string;
    account_type: number;
    account_balance: number;
    date_created: string;
    date_modified: string;
}

export interface Employee {
    employee_id: number;
    name: string;
    hourly_rate: number;
    regular_hours: number;
    vacation_days: number;
    sick_days: number;
    work_schedule: string;
}

export interface Expense {
    expense_id?: number;
    account_id?: number;
    expense_amount: number;
    expense_title: string;
    expense_description: string;
    expense_begin_date: string;
    expense_end_date?: string;
    frequency_type?: number;
    frequency_type_variable?: number;
    frequency_day_of_month?: number;
    frequency_day_of_week?: number;
    frequency_week_of_month?: number;
    frequency_month_of_year?: number;
    date_created?: string;
    date_modified?: string;
}

export interface Loan {
    loan_id?: number;
    account_id?: number;
    cron_job_id?: number;
    loan_amount?: number;
    loan_plan_amount: number;
    loan_recipient: string;
    loan_title: string;
    loan_description: string;
    frequency_type?: number;
    frequency_type_variable?: number;
    frequency_day_of_month?: number;
    frequency_day_of_week?: number;
    frequency_week_of_month?: number;
    frequency_month_of_year?: number;
    loan_interest_rate?: number;
    loan_interest_frequency_type?: number;
    loan_subsidized?: number;
    fully_paid_back?: string;
    loan_fully_paid_back?: string;
    loan_begin_date: string;
    loan_end_date?: string;
    date_created?: string;
    date_modified?: string;
}

export interface Payroll {
    start_date?: string;
    end_date: string;
    net_pay: number;
    work_days?: number;
    regular_hours?: number;
    gross_pay?: number;
    hours_worked?: number;
}

export interface PayrollDate {
    payroll_date_id: number;
    employee_id: number;
    payroll_start_day: number;
    payroll_end_day: number;
}

export interface PayrollTax {
    payroll_taxes_id: number;
    employee_id: number;
    name: string;
    rate: number;
}

export interface Wishlist {
    wishlist_id?: number;
    account_id?: number;
    cron_job_id?: number;
    wishlist_amount: number;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_date_available?: string;
    wishlist_date_can_purchase?: string | null;
    wishlist_url_link?: string;
    wishlist_priority?: number;
    date_created?: string;
    date_modified?: string;
}

export interface Transfer {
    account_id?: number;
    transfer_id?: number;
    source_account_id: number;
    destination_account_id: number;
    transfer_amount: number;
    transfer_title: string;
    transfer_description: string;
    transfer_begin_date: string;
    transfer_end_date?: string;
    frequency_type?: number;
    frequency_type_variable?: number;
    frequency_day_of_month?: number;
    frequency_day_of_week?: number;
    frequency_week_of_month?: number;
    frequency_month_of_year?: number;
    date_created?: string;
    date_modified?: string;
}

interface CurrentBalance {
    account_id: number;
    account_balance: number;
}

declare module 'express-serve-static-core' {
    interface Request {
        transaction: any[];
        expenses: any[];
        loans: any[];
        payrolls: any[];
        wishlists: any[];
        transfers: any[];
        currentBalance: CurrentBalance[];
        transactions: any[];
        wishlist_id: number;
        expense_id: number;
        loan_id: number;
        transfer_id: number;
        payroll_date_id: number;
        employee_id: number;
        payroll_taxes_id: number;
        fullyPaidBackDates: Record<number, string>;
    }
}
