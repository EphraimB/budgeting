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
  id: number;
  name: string;
  balance: number;
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
  date_created: string;
  date_modified: string;
}

export interface Loan {
  id: number;
  account_id: number;
  amount: number;
  plan_amount: number;
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
  fully_paid_back: string | null;
  date_created: string;
  date_modified: string;
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

export interface GeneratedTransaction {
  id: number;
  account_id: number;
  amount: number;
  tax_rate: number | null;
  total_amount: number;
  title: string;
  description: string;
  date_created: string;
  date_modified: string;
}
