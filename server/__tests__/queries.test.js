const app = require("../app");
const pgmock2 = require('pgmock2').default;
const { accounts, deposits, withdrawals, expenses, loans, wishlist } = require('./testData/mockData');
const { getAccount } = require('../queries');
const httpMocks = require('node-mocks-http');

const client = new pgmock2();

beforeAll(async () => {
    client.connect();
});

afterAll(async () => {
    await client.end();
});

describe('GET /accounts/:id', () => {
    test('GET /accounts/:id returns the correct account', () => {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/accounts/1',
            params: {
                id: 1
            }
        });
        const response = httpMocks.createResponse();
        const sql = getAccount(accounts[0].account_id);

        client.query(sql, [accounts[0].account_id], (err, res) => {
            if (err) {
                console.log(err.stack);
            } else {
                expect(response.status).toHaveBeenCalledWith(200);
                expect(res.rows[0].account_name).toBe('Chequing');
                expect(res.rows[0].account_type).toBe('chequing');
                expect(res.rows[0].account_balance).toBe(1550);
                expect(res.rows[0].date_created).toBeDefined();
                expect(res.rows[0].date_modified).toBeDefined();
            }
        });
    });
});