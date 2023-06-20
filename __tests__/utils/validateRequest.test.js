import { jest } from '@jest/globals';
import supertest from 'supertest';
import express from 'express';
import { validationResult } from 'express-validator';

describe('validateRequest', () => {
    afterEach(() => {
        jest.resetModules();
    });
    
    it('should return 400 and an error array if validation fails', async () => {
        jest.unstable_mockModule('express-validator', () => ({
            validationResult: jest.fn().mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(false),
                array: jest.fn().mockReturnValue([{ msg: 'Test error message' }]),
            })
        }));
        
        const { default: validateRequest } = await import('../../utils/validateRequest.js');
        
        const app = express();
        app.use(express.json());
        
        app.get('/test', validateRequest, (req, res) => {
            res.status(200).json({ message: 'Test passed!' });
        });

        const response = await supertest(app).get('/test');

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ errors: [{ msg: 'Test error message' }] });
    });

    it('should call next if validation succeeds', async () => {
        jest.unstable_mockModule('express-validator', () => ({
            validationResult: jest.fn().mockReturnValue({
                isEmpty: jest.fn().mockReturnValue(true),
                array: jest.fn().mockReturnValue([]),
            })
        }));
        
        const { default: validateRequest } = await import('../../utils/validateRequest.js');
        
        const app = express();
        app.use(express.json());
        
        app.get('/test', validateRequest, (req, res) => {
            res.status(200).json({ message: 'Test passed!' });
        });

        const response = await supertest(app).get('/test');

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: 'Test passed!' });
    });
});
