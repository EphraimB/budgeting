import { Dayjs } from 'dayjs';

export interface GeneratedTransaction {
    id: string;
    expense_id?: number;
    loan_id?: number;
    income_id?: number;
    transfer_id?: number;
    commute_schedule_id?: number;
    wishlist_id?: number;
    transaction_id?: number;
    title: string;
    description: string;
    amount: number;
    tax_rate: number;
    total_amount: number;
    date: Dayjs;
    date_modified?: Dayjs;
    balance?: number;
}

export interface JobDetails {
    frequency_type?: number;
    frequency_type_variable?: number;
    frequency_day_of_month?: number;
    frequency_day_of_week?: number;
    frequency_week_of_month?: number;
    frequency_month_of_year?: number;
    date: string;
}

export interface Transaction {
    account_id: number;
    transaction_id: number;
    transaction_title: string;
    transaction_description: string;
    date_created: string;
    date_modified: string;
    transaction_amount: number;
    transaction_tax_rate?: number;
    balance?: number;
}

export interface Taxes {
    id: number;
    rate: number;
    title: string;
    description: string;
    type: number;
    date_created: string;
    date_modified: string;
}

export interface Income {
    id: number;
    account_id: number;
    tax_id?: number | null;
    tax_rate?: number;
    total_amount?: number;
    income_amount: number;
    income_title: string;
    income_description: string;
    income_begin_date: string;
    income_end_date?: string;
    frequency_type?: number;
    frequency_type_variable: number;
    frequency_day_of_month?: number | null | undefined;
    frequency_day_of_week?: number | null | undefined;
    frequency_week_of_month?: number | null | undefined;
    frequency_month_of_year?: number | null | undefined;
    date_created: string;
    date_modified: string;
}

export interface TransactionHistory {
    id: number;
    account_id: number;
    transaction_amount: number;
    transaction_tax_rate: number;
    transaction_title: string;
    transaction_description: string;
    date_created: string;
    date_modified: string;
}

export interface Account {
    account_id: number;
    account_name: string;
    account_balance: number;
    date_created: string;
    date_modified: string;
}

interface JobSchedule {
    job_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface Job {
    id: number;
    account_id: number;
    name: string;
    hourly_rate: number;
    vacation_days: number;
    sick_days: number;
    total_hours_per_week: number;
    job_schedule: JobSchedule[];
}

export interface Expense {
    id?: number;
    account_id?: number;
    cron_job_id?: number;
    tax_id?: number | null | undefined;
    tax_rate?: number;
    amount: number;
    title: string;
    description: string;
    begin_date: string;
    end_date?: string;
    frequency_type?: number;
    frequency_type_variable: number;
    frequency_day_of_month?: number | null | undefined;
    frequency_day_of_week?: number | null | undefined;
    frequency_week_of_month?: number | null | undefined;
    frequency_month_of_year?: number | null | undefined;
    subsidized?: number;
    next_date?: string | null;
    date_created?: string;
    date_modified?: string;
}

export interface Loan {
    id?: number;
    account_id?: number;
    cron_job_id?: number;
    amount?: number;
    plan_amount: number;
    recipient: string;
    title: string;
    description: string;
    frequency_type?: number;
    frequency_type_variable: number;
    frequency_day_of_month?: number | null;
    frequency_day_of_week?: number | null;
    frequency_week_of_month?: number | null;
    frequency_month_of_year?: number | null;
    interest_rate?: number;
    interest_frequency_type?: number;
    subsidized?: number;
    fully_paid_back?: string | null;
    begin_date: string;
    end_date?: string;
    next_date?: string | null;
    date_created?: string;
    date_modified?: string;
}

export interface Payroll {
    job_name?: string;
    start_date?: string;
    end_date: string;
    net_pay: number;
    work_days?: number;
    regular_hours?: number;
    gross_pay: number;
    hours_worked?: number;
}

export interface PayrollDate {
    id: number;
    job_id: number;
    payroll_day: number;
}

export interface PayrollTax {
    id: number;
    job_id: number;
    name: string;
    rate: number;
}

export interface Wishlist {
    id?: number;
    account_id?: number;
    tax_id?: number | null;
    tax_rate?: number;
    cron_job_id?: number;
    wishlist_amount: number;
    wishlist_tax_rate?: number;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_date_available?: string | null;
    wishlist_date_can_purchase?: string | null;
    wishlist_url_link?: string;
    wishlist_priority?: number;
    date_created?: string;
    date_modified?: string;
}

export interface Transfer {
    account_id?: number;
    id?: number;
    cron_job_id?: number;
    source_account_id: number;
    destination_account_id: number;
    transfer_amount: number;
    transfer_title: string;
    transfer_description: string;
    transfer_begin_date: string;
    transfer_end_date?: string | null | undefined;
    frequency_type?: number;
    frequency_type_variable: number;
    frequency_day_of_month?: number | null | undefined;
    frequency_day_of_week?: number | null | undefined;
    frequency_week_of_month?: number | null | undefined;
    frequency_month_of_year?: number | null | undefined;
    date_created?: string;
    date_modified?: string;
}

export interface CommuteSystem {
    id: number;
    name: string;
    fare_cap: number | null;
    fare_cap_duration: number | null;
    date_created: string;
    date_modified: string;
}

export interface CommuteHistory {
    id: number;
    account_id: number;
    fare_amount: number;
    commute_system: string;
    fare_type: string;
    timestamp: string;
    date_created: string;
    date_modified: string;
}

export interface FareDetails {
    fare_detail_id: number;
    commute_system_id: number;
    system_name: string;
    fare_type: string;
    fare_amount: number;
    timeslots: Timeslots[];
    timed_pass_duration: number | null;
    alternate_fare_detail_id: number | null;
    date_created: string;
    date_modified: string;
}

export interface Timeslots {
    timeslot_id: number;
    fare_detail_id: number;
    day_of_week: number;
    start_time: string;
    end_time: string;
}

export interface CommuteTicket {
    commute_ticket_id: number;
    fare_detail_id: number;
    name: string;
    date_created: string;
    date_modified: string;
}

export interface CommuteSchedule {
    id: number;
    commute_system_id: number;
    account_id: number;
    day_of_week: number;
    fare_detail_id: number;
    start_time: string;
    end_time: string;
    duration: number | null;
    day_start: number | null;
    fare_amount: number;
    pass: string;
    date_created: string;
    date_modified: string;
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
        income: any[];
        commuteExpenses: any[];
        currentBalance: CurrentBalance[];
        transactions: any[];
        wishlist_id: number | null | undefined;
        expense_id: number | null | undefined;
        loan_id: number | null | undefined;
        transfer_id: number | null | undefined;
        payroll_date_id: number;
        job_id: number;
        payroll_taxes_id: number;
        income_id: number;
        commute_schedule_id: number;
        fullyPaidBackDates: Record<number, string | null>;
        alerts: object[];
    }
}
