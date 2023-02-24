const accounts = [
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

const deposits = [
    {
        deposit_id: 1,
        account_id: 1,
        deposit_amount: 1000,
        deposit_description: 'Test Deposit',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        deposit_id: 2,
        account_id: 1,
        deposit_amount: 2000,
        deposit_description: 'Test Deposit 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

const withdrawals = [
    {
        withdrawal_id: 1,
        account_id: 1,
        withdrawal_amount: 1000,
        withdrawal_description: 'Test Withdrawal',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    },
    {
        withdrawal_id: 2,
        account_id: 1,
        withdrawal_amount: 200,
        withdrawal_description: 'Test Withdrawal 2',
        date_created: '2020-01-01',
        date_modified: '2020-01-01'
    }
];

const expenses = [
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

const loans = [
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

const wishlist = [
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

module.exports = {
    accounts,
    deposits,
    withdrawals,
    expenses,
    loans,
    wishlist
};