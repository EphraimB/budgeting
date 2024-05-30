export interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

export interface TransactionHistory {
  id: number;
  account_id: number;
  amount: number;
  title: string;
  description: string;
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

export interface Expense {
  id: number;
  account_id: number;
  tax_id: number | null;
  amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number | null;
  frequency_day_of_month: number | null;
  frequency_day_of_week: number | null;
  frequency_week_of_month: number | null;
  frequency_month_of_year: number | null;
  subsidized: number;
  begin_date: string;
  end_date: string | null;
  next_date: string | null;
  date_created: string;
  date_modified: string;
}

export interface Loan {
  id: number;
  account_id: number;
  recipient: string;
  amount: number;
  plan_amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number | null;
  frequency_day_of_week: number | null;
  frequency_week_of_month: number | null;
  frequency_month_of_year: number | null;
  subsidized: number;
  interest_rate: number;
  interest_frequency_type: number;
  begin_date: string;
  end_date: string | null;
  fully_paid_back: string | null;
  next_date: string | null;
  date_created: string;
  date_modified: string;
}

export interface Wishlist {
  id: number;
  account_id: number;
  tax_id: number | null;
  tax_rate: number;
  wishlist_amount: number;
  wishlist_title: string;
  wishlist_description: string;
  wishlist_date_available: string | null;
  wishlist_date_can_purchase: string | null;
  wishlist_url_link: string;
  wishlist_priority: number;
  date_created?: string;
  date_modified?: string;
}

export interface Tax {
  id: number;
  rate: number;
  title: string;
  description: string;
  type: number;
  date_created: string;
  date_modified: string;
}

interface Transaction {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
  tax_rate: number | null;
  total_amount: number;
  balance: number;
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

export interface PayrollDate {
  id: number;
  job_id: number;
  payroll_day: number;
}

export interface Transfer {
  account_id: number;
  id: number;
  source_account_id: number;
  destination_account_id: number;
  transfer_amount: number;
  transfer_title: string;
  transfer_description: string;
  transfer_begin_date: string;
  transfer_end_date: string | null;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number | null;
  frequency_day_of_week: number | null;
  frequency_week_of_month: number | null;
  frequency_month_of_year: number | null;
  next_date: string;
  date_created: string;
  date_modified: string;
}

export interface GeneratedTransaction {
  account_id: number;
  current_balance: number;
  transactions: Transaction[];
}
