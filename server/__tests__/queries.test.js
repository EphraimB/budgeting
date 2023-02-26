const pgmock2 = require('pgmock2').default;
const { types } = require('pg');
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { accountQueries } = require('../queryData');

const client = new pgmock2();

beforeAll(async () => {
    await client.connect();

    const id = accounts[0].account_id;

    client.add('SELECT * FROM accounts', [id], {
        rowCount: accounts.length,
        rows: accounts.map((account) => account)
    });
});

afterAll(async () => {
    await client.end();
});

describe('GET /accounts/:id', () => {
    test('GET /accounts/:id returns the correct account', async () => {
        const id = accounts[0].account_id;

        await client.query(accountQueries.getAccount, [id])
            .then((data) => console.log(data))
            .catch((err) => console.log(err.message));
    });

    test('POST /accounts/ returns the correct account', async () => {
        const name = accounts[0].account_name;
        const type = accounts[0].account_type;
        const balance = accounts[0].account_balance;

        await client.query(accountQueries.createAccount, [name, type, balance])
            .then((data) => console.log(data))
            .catch((err) => console.log(err.message));
    });
});