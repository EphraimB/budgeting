import { jest } from '@jest/globals';
import request from 'supertest';
import { payrolls } from '../../models/mockData.js'; // Import the mock data

beforeAll(() => {
    // Mock the breeManager module
    jest.unstable_mockModule('../../breeManager.js', () => ({
        initializeBree: jest.fn(),
        getBree: jest.fn(),
    }));

    // Mock the getJobs module
    jest.unstable_mockModule('../../getJobs.js', () => ({
        default: jest.fn(),
    }));

    jest.unstable_mockModule('../../controllers/payrollsController.js', () => ({
        getPayrolls: jest.fn().mockImplementation((request, response) => {
            // If no id was provided, respond with the full accounts array
            response.status(200).json(payrolls);
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/payrolls with id query', () => {
    it('should respond with an array of payrolls', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get(`/api/payroll?employee_id=${id}`);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(payrolls);
    });
});