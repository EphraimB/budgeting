const request = require("supertest");
const app = require("../app");
// const db = require("../queries");
const sinon = require("sinon");

const dbMock = sinon.mock(db);

describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe('Accounts routes', () => {
    // beforeAll(async () => {
    //     await db.connect();
    // });

    // afterAll(async () => {
    //     await db.end();
    // });

    it('should create a new account', async () => {
        const data = { name: "Test Account", type: 0, balance: 1000.00 };

        // Mock the createAccount function
        dbMock.expects('createAccount').once().withArgs(data).returns({ account_id: 1, ...data });

        // Make the request
        const response = await request(app).post('/accounts').send(data);
        expect(response.statusCode).toBe(201);
        expect(response.body).toEqual({ account_id: 1, ...data });
    });

    it('should get an account', async () => {
        const data = { account_id: 1, name: "Test Account", type: 0, balance: 1000.00 };

        // Mock the getAccount function
        dbMock.expects('getAccount').once().withArgs(data.account_id).returns(data);

        // Make the request
        const response = await request(app).get('/accounts/1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(data);
    });
});