const pgmock2 = require('pgmock2').default;
const { types } = require('pg');
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { accountQueries, depositQueries, withdrawalQueries, expenseQueries, loanQueries, wishlistQueries } = require('../queryData');

// define a custom handler function for the SELECT query on the accounts table
const handleSelectAccounts = () => {
    const results = [];

    // loop through each account in the mock data
    for (const account of accounts) {
        let balance = account.account_balance; // start with the account balance

        // loop through each deposit for this account and add the deposit amount to the balance
        for (const deposit of deposits.filter(d => d.account_id === account.account_id)) {
            balance += deposit.deposit_amount;
        }

        // loop through each withdrawal for this account and subtract the withdrawal amount from the balance
        for (const withdrawal of withdrawals.filter(w => w.account_id === account.account_id)) {
            balance -= withdrawal.withdrawal_amount;
        }

        // create a new account object with the calculated balance and add it to the results array
        results.push({
            account_id: account.account_id,
            account_name: account.account_name,
            account_type: account.account_type,
            account_balance: balance,
            date_created: account.date_created,
            date_modified: account.date_modified
        });
    }

    // return the results array
    return results;
};

const client = new pgmock2({
    accountQueries,
    handleSelectAccounts
});

beforeAll(async () => {
    await client.connect();

    // Add the expected query and its result to the client
    client.add(accountQueries.getAccounts, [], {
        rowCount: accounts.length,
        rows: handleSelectAccounts(),
    });

    client.add(accountQueries.getAccount, [1], {
        rowCount: 1,
        rows: handleSelectAccounts().filter(a => a.account_id === 1)
    });

    client.add(depositQueries.getDeposits, [], {
        rowCount: deposits.length,
        rows: deposits
    });

    client.add(depositQueries.getDeposit, [1], {
        rowCount: 1,
        rows: deposits.filter(d => d.deposit_id === 1)
    });

    client.add(withdrawalQueries.getWithdrawals, [], {
        rowCount: withdrawals.length,
        rows: withdrawals
    });

    client.add(withdrawalQueries.getWithdrawal, [1], {
        rowCount: 1,
        rows: withdrawals.filter(w => w.withdrawal_id === 1)
    });

    client.add(expenseQueries.getExpenses, [], {
        rowCount: expenses.length,
        rows: expenses
    });

    client.add(expenseQueries.getExpense, [1], {
        rowCount: 1,
        rows: expenses.filter(e => e.expense_id === 1)
    });

    client.add(loanQueries.getLoans, [], {
        rowCount: loans.length,
        rows: loans
    });

    client.add(loanQueries.getLoan, [1], {
        rowCount: 1,
        rows: loans.filter(l => l.loan_id === 1)
    });

    client.add(wishlistQueries.getWishlists, [], {
        rowCount: wishlist.length,
        rows: wishlist
    });

    client.add(wishlistQueries.getWishlist, [1], {
        rowCount: 1,
        rows: wishlist.filter(w => w.wishlist_id === 1)
    });
});

afterAll(async () => {
    await client.end();
});

describe('query tests', () => {
    test('GET /accounts returns all accounts', async () => {
        await client.query(accountQueries.getAccounts)
            .then((data) => {
                expect(data.rowCount).toBe(accounts.length);
                expect(data.rows).toEqual(handleSelectAccounts());
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /accounts/:id returns a single account', async () => {
        await client.query(accountQueries.getAccount, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(handleSelectAccounts().filter(a => a.account_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /deposits returns all deposits', async () => {
        await client.query(depositQueries.getDeposits)
            .then((data) => {
                expect(data.rowCount).toBe(deposits.length);
                expect(data.rows).toEqual(deposits);
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /deposits/:id returns a single deposit', async () => {
        await client.query(depositQueries.getDeposit, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(deposits.filter(d => d.deposit_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /withdrawals returns all withdrawals', async () => {
        await client.query(withdrawalQueries.getWithdrawals)
            .then((data) => {
                expect(data.rowCount).toBe(withdrawals.length);
                expect(data.rows).toEqual(withdrawals);
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /withdrawals/:id returns a single withdrawal', async () => {
        await client.query(withdrawalQueries.getWithdrawal, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(withdrawals.filter(w => w.withdrawal_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /expenses returns all expenses', async () => {
        await client.query(expenseQueries.getExpenses)
            .then((data) => {
                expect(data.rowCount).toBe(expenses.length);
                expect(data.rows).toEqual(expenses);
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /expenses/:id returns a single expense', async () => {
        await client.query(expenseQueries.getExpense, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(expenses.filter(e => e.expense_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /loans returns all loans', async () => {
        await client.query(loanQueries.getLoans)
            .then((data) => {
                expect(data.rowCount).toBe(loans.length);
                expect(data.rows).toEqual(loans);
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /loans/:id returns a single loan', async () => {
        await client.query(loanQueries.getLoan, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(loans.filter(l => l.loan_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /wishlists returns all wishlists', async () => {
        await client.query(wishlistQueries.getWishlists)
            .then((data) => {
                expect(data.rowCount).toBe(wishlist.length);
                expect(data.rows).toEqual(wishlist);
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });

    test('GET /wishlists/:id returns a single wishlist', async () => {
        await client.query(wishlistQueries.getWishlist, [1])
            .then((data) => {
                expect(data.rowCount).toBe(1);
                expect(data.rows).toEqual(wishlist.filter(w => w.wishlist_id === 1));
                console.log(data);
            })
            .catch((err) => console.log(err.message));
    });
});