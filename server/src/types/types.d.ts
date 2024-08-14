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
    frequencyType?: number;
    frequencyTypeVariable?: number;
    frequencyDayOfMonth?: number;
    frequencyDayOfWeek?: number;
    frequencyWeekOfMonth?: number;
    frequencyMonthOfYear?: number;
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
    dateCreated: string;
    dateModified: string;
}

export interface Income {
    id: number;
    accountId: number;
    taxId?: number | null;
    taxRate?: number;
    totalAmount?: number;
    incomeAmount: number;
    incomeTitle: string;
    incomeDescription: string;
    incomeBeginDate: string;
    incomeEndDate?: string;
    frequencyType?: number;
    frequencyTypeVariable: number;
    frequencyDayOfMonth?: number | null | undefined;
    frequencyDayOfWeek?: number | null | undefined;
    frequencyWeekOfMonth?: number | null | undefined;
    frequencyMonthOfYear?: number | null | undefined;
    dateCreated: string;
    dateModified: string;
}

export interface TransactionHistory {
    id: number;
    accountId: number;
    transactionAmount: number;
    transactionTaxRate: number;
    transactionTitle: string;
    transactionDescription: string;
    dateCreated: string;
    dateModified: string;
}

export interface Account {
    accountId: number;
    accountName: string;
    accountBalance: number;
    dateCreated: string;
    dateModified: string;
}

interface JobSchedule {
    jobId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

export interface Job {
    id: number;
    accountId: number;
    name: string;
    hourlyRate: number;
    vacationDays: number;
    sickDays: number;
    totalHoursPerWeek: number;
    jobSchedule: JobSchedule[];
}

export interface Expense {
    id?: number;
    accountId?: number;
    cronJobId?: number;
    taxId?: number | null | undefined;
    taxRate?: number;
    amount: number;
    title: string;
    description: string;
    beginDate: string;
    endDate?: string;
    frequencyType?: number;
    frequencyTypeVariable: number;
    frequencyDayOfMonth?: number | null | undefined;
    frequencyDayOfWeek?: number | null | undefined;
    frequencyWeekOfMonth?: number | null | undefined;
    frequencyMonthOfYear?: number | null | undefined;
    subsidized?: number;
    nextDate?: string | null;
    dateCreated?: string;
    dateModified?: string;
}

export interface Loan {
    id?: number;
    accountId?: number;
    cronJobId?: number;
    amount?: number;
    planAmount: number;
    recipient: string;
    title: string;
    description: string;
    frequencyType?: number;
    frequencyTypeVariable: number;
    frequencyDayOfMonth?: number | null;
    frequencyDayOfWeek?: number | null;
    frequencyWeekOfMonth?: number | null;
    frequencyMonthOfYear?: number | null;
    interestRate?: number;
    interestFrequencyType?: number;
    subsidized?: number;
    fullyPaidBack?: string | null;
    beginDate: string;
    endDate?: string;
    nextDate?: string | null;
    dateCreated?: string;
    dateModified?: string;
}

export interface Payroll {
    jobName?: string;
    startDate?: string;
    endDate: string;
    netPay: number;
    workDays?: number;
    regularHours?: number;
    grossPay: number;
    hoursWorked?: number;
}

export interface PayrollDate {
    id: number;
    jobId: number;
    payrollDay: number;
}

export interface PayrollTax {
    id: number;
    jobId: number;
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
    accountId?: number;
    id?: number;
    cronJobId?: number;
    sourceAccountId: number;
    destinationAccountId: number;
    transferAmount: number;
    transferTitle: string;
    transferDescription: string;
    transferBeginDate: string;
    transferEndDate?: string | null | undefined;
    frequencyType?: number;
    frequencyTypeVariable: number;
    frequencyDayOfMonth?: number | null | undefined;
    frequencyDayOfWeek?: number | null | undefined;
    frequencyWeekOfMonth?: number | null | undefined;
    frequencyMonthOfYear?: number | null | undefined;
    dateCreated?: string;
    dateModified?: string;
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
    accountId: number;
    fareAmount: number;
    commuteSystem: string;
    fareType: string;
    timestamp: string;
    dateCreated: string;
    dateModified: string;
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
        expenseId: number | null | undefined;
        loanId: number | null | undefined;
        transferId: number | null | undefined;
        payrollDateId: number;
        jobId: number;
        payrollTaxesId: number;
        incomeId: number;
        commute_schedule_id: number;
        fullyPaidBackDates: Record<number, string | null>;
        alerts: object[];
    }
}
