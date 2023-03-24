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

test('mockData should contain accounts with specific account names', () => {
    expect(accounts).toHaveLength(2);
    expect(accounts[0].account_name).toBe('Test Account');
    expect(accounts[1].account_name).toBe('Test Account 2');
});

test('mockData should contain deposits with specific deposit descriptions', () => {
    expect(deposits).toHaveLength(2);
    expect(deposits[0].deposit_description).toBe('Test Deposit');
    expect(deposits[1].deposit_description).toBe('Test Deposit 2');
});

test('mockData should contain withdrawals with specific withdrawal descriptions', () => {
    expect(withdrawals).toHaveLength(2);
    expect(withdrawals[0].withdrawal_description).toBe('Test Withdrawal');
    expect(withdrawals[1].withdrawal_description).toBe('Test Withdrawal 2');
});

test('mockData should contain expenses with specific expense titles', () => {
    expect(expenses).toHaveLength(2);
    expect(expenses[0].expense_title).toBe('Test Expense');
    expect(expenses[1].expense_title).toBe('Test Expense 2');
});

test('mockData should contain loans with specific loan titles', () => {
    expect(loans).toHaveLength(1);
    expect(loans[0].loan_title).toBe('Test Loan');
});

test('mockData should contain wishlist with specific wishlist titles', () => {
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].wishlist_title).toBe('Test Wishlist');
});

module.exports = {
    accounts,
    deposits,
    withdrawals,
    expenses,
    loans,
    wishlist
};