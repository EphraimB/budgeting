const request = require("supertest");
const app = require("../app");
const db = require("../db");

describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/");
        expect(response.statusCode).toBe(200);
    });
});

describe('Accounts routes', () => {
    beforeAll(async () => {
        await db.connect();
    });

    afterAll(async () => {
        await db.end();
    });

    it('should create a new account', async () => {
        const response = await request(app)
            .post('/accounts')
            .send({
                name: "Test Account",
                type: 0,
                balance: 1000.00
            });

        expect(response.statusCode).toBe(201);
        expect(response.body[0].account_name).toBe("Test Account");
        expect(response.body[0].account_type).toBe(0);
        expect(response.body[0].account_balance).toBe("$1,000.00");
    });
});