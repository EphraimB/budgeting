import { jest } from '@jest/globals';
import request from 'supertest';
import { type Express } from 'express';
import { Volume } from 'memfs';
import { describe, it, expect } from '@jest/globals';

const vol = Volume.fromJSON(
    {
        'swagger.json': '[]',
    },
    process.cwd(),
);

jest.doMock('fs', () => ({
    __esModule: true,
    default: vol,
}));

jest.mock('../src/config/winston', () => ({
    __esModule: true,
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        log: jest.fn(),
    },
}));

describe('Test application', () => {
    it('should trigger not found for site 404', async () => {
        // Import the module that uses the mock
        const appModule = await import('../src/app.js');
        const app: Express = appModule.default;

        const response: request.Response = await request(app).get(
            '/no-such-path',
        );
        expect(response.statusCode).toBe(404);
    });
});
