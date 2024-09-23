export interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
}

export interface TransactionHistory {
  id: number;
  accountId: number;
  amount: number;
  title: string;
  description: string;
  dateCreated: string;
  dateModified: string;
}

export interface Account {
  accountId: number;
  name: string;
  balance: number;
  dateCreated: string;
  dateModified: string;
}

interface Frequency {
  type: number;
  typeVariable: number;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  weekOfMonth: number | null;
  monthOfYear: number | null;
}

export interface Expense {
  id: number;
  accountId: number;
  taxId: number | null;
  amount: number;
  title: string;
  description: string;
  frequency: Frequency;
  subsidized: number;
  beginDate: string;
  endDate: string | null;
  nextDate: string | null;
  dateCreated: string;
  dateModified: string;
}

export interface Loan {
  id: number;
  accountId: number;
  recipient: string;
  amount: number;
  planAmount: number;
  title: string;
  description: string;
  frequency: Frequency;
  subsidized: number;
  interestRate: number;
  interestFrequencyType: number;
  beginDate: string;
  endDate: string | null;
  fullyPaidBack: string | null;
  nextDate: string | null;
  dateCreated: string;
  dateModified: string;
}

export interface Wishlist {
  id: number;
  accountId: number;
  taxId: number | null;
  taxRate: number;
  amount: number;
  title: string;
  description: string;
  dateAvailable: string | null;
  dateCanPurchase: string | null;
  urlLink: string;
  priority: number;
  dateCreated?: string;
  dateModified?: string;
}

export interface Tax {
  id: number;
  rate: number;
  title: string;
  description: string;
  type: number;
  dateCreated: string;
  dateModified: string;
}

interface Transaction {
  id: string;
  title: string;
  description: string;
  date: string;
  amount: number;
  taxRate: number | null;
  totalAmount: number;
  balance: number;
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
  totalHoursPerWeek: number;
  jobSchedule: JobSchedule[];
}

export interface PayrollDate {
  id: number;
  jobId: number;
  payrollDay: number;
}

export interface Transfer {
  id: number;
  sourceAccountId: number;
  destinationAccountId: number;
  amount: number;
  title: string;
  description: string;
  beginDate: string;
  endDate: string | null;
  frequency: Frequency;
  nextDate: string;
  dateCreated: string;
  dateModified: string;
}

export interface PayrollTax {
  id: number;
  jobId: number;
  name: string;
  rate: number;
}

export interface GeneratedTransaction {
  accountId: number;
  currentCalance: number;
  transactions: Transaction[];
}
