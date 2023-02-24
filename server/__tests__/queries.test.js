const app = require("../app");
const pgmock2 = require('pgmock2').default;
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { getAccount } = require('../queries');

const client = new pgmock2();

beforeAll(async () => {
    client.connect();
});

afterAll(async () => {
    await client.end();
});

describe('GET /accounts/:id', () => {
    test('GET /accounts/:id returns the correct account', () => {
        const id = accounts[0].account_id;

        const request = { params: { id } };

        client.query(getAccount(request), (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                expect(res.rows[0]).toEqual(expectedAccount);
                expect(response.status).toHaveBeenCalledWith(200);
                done();
            }
        });
    });
});