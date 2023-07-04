export interface Transaction {
    transaction_id: number;
    account_id: number;
    transaction_amount: number;
    transaction_type: string;
    transaction_title: string;
    transaction_description: string;
    transaction_date: string;
    date_created: string;
    date_modified: string;
}

export interface Expense {
    expense_id: number;
    account_id: number;
    expense_amount: number;
    expense_title: string;
    expense_description: string;
    expense_begin_date: string;
    frequency_type: number;
    frequency_type_variable: number;
    frequency_day_of_month: number;
    frequency_day_of_week: number;
    frequency_week_of_month: number;
    frequency_month_of_year: number;
    date_created: string;
    date_modified: string;
}

export interface Loan {
    loan_id: number;
    account_id: number;
    cron_job_id?: number;
    loan_amount: number;
    loan_plan_amount: number;
    loan_recipient: string;
    loan_title: string;
    loan_description: string;
    frequency_type: number;
    frequency_type_variable: number;
    frequency_day_of_month: number;
    frequency_day_of_week: number;
    frequency_week_of_month: number;
    frequency_month: number;
    loan_begin_date: string;
    loan_end_date: string;
    date_created: string;
    date_modified: string;
}

export interface Payroll {
    payroll_id: number;
    account_id: number;
    payroll_amount: number;
    payroll_title: string;
    payroll_description: string;
    payroll_date: string;
    date_created: string;
    date_modified: string;
}

export interface Wishlist {
    wishlist_id: number;
    account_id: number;
    wishlist_amount: number;
    wishlist_title: string;
    wishlist_description: string;
    wishlist_date: string;
    date_created: string;
    date_modified: string;
}

export interface Transfer {
    transfer_id: number;
    account_id: number;
    transfer_amount: number;
    transfer_title: string;
    transfer_description: string;
    transfer_date: string;
    frequency_type: number;
    date_created: string;
    date_modified: string;
}

declare module 'express-serve-static-core' {
    interface Request {
        transaction: Transaction[];
        expenses: Expense[];
        loans: Loan[];
        payrolls: Payroll[];
        wishlists: Wishlist[];
        transfers: Transfer[];
        currentBalance: number;
    }
}
