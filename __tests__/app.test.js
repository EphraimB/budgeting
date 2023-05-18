import request from 'supertest';
import app from '../app.js';
import db from '../models/db.js';

describe("Test application", () => {
    test("Not found for site 404", async () => {
        const response = await request(app).get("/no-such-path");
        expect(response.statusCode).toBe(404);
    });
});

afterAll(async () => {
    await db.end();
});