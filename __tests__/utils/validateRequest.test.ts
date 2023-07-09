import { jest } from '@jest/globals';
import supertest from 'supertest';
import express, { Express, Request, Response } from 'express';

describe('validateRequest', () => {
    let app: Express;
    let validateRequest;

    beforeEach(async () => {
        jest.resetModules();

        app = express();
        app.use(express.json());
    });

    const importAndUseValidateRequest = async (validationResultMock: any) => {
        jest.mock('express-validator', () => ({
            validationResult: jest.fn().mockReturnValue(validationResultMock)
        }));

        const { default: importedValidateRequest } = await import('../../utils/validateRequest.js');
        validateRequest = importedValidateRequest;

        app.get('/test', validateRequest, (req: Request, res: Response) => {
            res.status(200).json({ message: 'Test passed!' });
        });
    };

    it('should return 400 and an error array if validation fails', async () => {
        const validationResultMock = {
            isEmpty: jest.fn().mockReturnValue(false),
            array: jest.fn().mockReturnValue([{ msg: 'Test error message' }]),
            formatter: jest.fn(),
            errors: jest.fn(),
            mapped: jest.fn(),
            formatWith: jest.fn(),
            throw: jest.fn()
        };

        await importAndUseValidateRequest(validationResultMock);

        const response = await supertest(app).get('/test');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ errors: [{ msg: 'Test error message' }] });
    });

    it('should call next if validation succeeds', async () => {
        const validationResultMock = {
            isEmpty: jest.fn().mockReturnValue(true),
            array: jest.fn().mockReturnValue([])
        };

        await importAndUseValidateRequest(validationResultMock);

        const response = await supertest(app).get('/test');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Test passed!' });
    });
});
