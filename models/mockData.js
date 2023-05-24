export const accounts = [
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

export const transactions = [
    {
        transaction_id: 1,
        account_id: 1,
        deposit_amount: 1000,
        deposit_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 2,
        account_id: 1,
        deposit_amount: 2000,
        deposit_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 3,
        account_id: 1,
        withdrawal_amount: 1000,
        withdrawal_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        transaction_id: 4,
        account_id: 1,
        withdrawal_amount: 200,
        withdrawal_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const expenses = [
    {
        expense_id: 1,
        account_id: 1,
        expense_amount: 50,
        expense_title: 'Test Expense',
        expense_description: 'Test Expense to test the expense route',
        frequency: 0,
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
        frequency: 0,
        expense_begin_date: '2020-01-01',
        expense_end_date: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

export const loans = [
    {
        loan_id: 1,
        account_id: 1,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency: 0,
        loan_begin_date: '2020-01-01',
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

export const payrollDates = [
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

export const wishlist = [
    {
        wishlist_id: 1,
        account_id: 1,
        wishlist_amount: 1000,
        wishlist_title: 'Test Wishlist',
        wishlist_description: 'Test Wishlist to test the wishlist route',
        wishlist_priority: 0,
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];