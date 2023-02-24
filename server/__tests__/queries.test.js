const app = require("../app");
const pgmock2 = require('pgmock2').default;
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { accountQueries } = require('../queryData');

const client = new pgmock2();

beforeAll(async () => {
    client.connect();

    const id = accounts[0].account_id;

    client.add(accountQueries.getAccount, [id], {
        rowCount: accounts.length,
        rows: accounts.map((account) => account)
    });
});

afterAll(async () => {
    await client.end();
});

describe('GET /accounts/:id', () => {
    test('GET /accounts/:id returns the correct account', () => {
        const id = accounts[0].account_id;

        client.query(accountQueries.getAccount, [id])
            .then((data) => console.log(data))
            .catch((err) => console.log(err.message));
    });
});