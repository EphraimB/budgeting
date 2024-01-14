export interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

export interface Expense {
  id: number;
  account_id: number;
  tax_id: number;
  amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number;
  frequency_day_of_week: number;
  frequency_week_of_month: number;
  frequency_month_of_year: number;
  subsidized: number;
  begin_date: string;
  end_date: string | null;
  date_created: string;
  date_modified: string;
}

export interface Loan {
  id: number;
  account_id: number;
  tax_id: number;
  amount: number;
  title: string;
  description: string;
  frequency_type: number;
  frequency_type_variable: number;
  frequency_day_of_month: number;
  frequency_day_of_week: number;
  frequency_week_of_month: number;
  frequency_month_of_year: number;
  subsidized: number;
  begin_date: string;
  end_date: string | null;
  date_created: string;
  date_modified: string;
}
