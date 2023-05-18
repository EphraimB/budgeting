import request from 'supertest';
import app from '../app';

let server;

beforeAll(() => {
    server = app.listen();
});

afterAll(() => {
    server.close();
});

describe('GET /api', () => {
    it('should respond with "Hello, World!"', async () => {
        const response = await request(app).get('/api');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});