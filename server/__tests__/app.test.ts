import { jest } from '@jest/globals';
import request from 'supertest';
import { type Express } from 'express';
import { Volume } from 'memfs';

describe('Test application', () => {
    it('should trigger not found for site 404', async () => {
        const vol = Volume.fromJSON(
            {
                'dist/views/swagger.json': '[]',
            },
            process.cwd(),
        );

        jest.mock('fs', () => ({
            __esModule: true,
            default: vol,
        }));

        // Import the module that uses the mock
        const appModule = await import('../app.js');
        const app: Express = appModule.default;

        const response: request.Response = await request(app).get(
            '/no-such-path',
        );
        expect(response.statusCode).toBe(404);
    });
});
