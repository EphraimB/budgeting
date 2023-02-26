const pgmock2 = require('pgmock2').default;
const { types } = require('pg');
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { accountQueries } = require('../queryData');

// define a custom handler function for the SELECT query on the accounts table
const handleSelectAccounts = (query, params) => {
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
    client.add(accountQueries.getAccount, [accounts[0].account_id], {
        rowCount: 1,
        rows: handleSelectAccounts(),
    });
});

afterAll(async () => {
    await client.end();
});

describe('GET /accounts/:id', () => {
    test('GET /accounts/:id returns the correct account', async () => {
        await client.query(accountQueries.getAccount, [accounts[0].account_id])
            .then((data) => console.log(data))
            .catch((err) => console.log(err.message));
    });

    // test('POST /accounts/ returns the correct account', async () => {
    //     const name = accounts[0].account_name;
    //     const type = accounts[0].account_type;
    //     const balance = accounts[0].account_balance;

    //     await client.query(accountQueries.createAccount, [name, type, balance])
    //         .then((data) => console.log(data))
    //         .catch((err) => console.log(err.message));
    // });
});