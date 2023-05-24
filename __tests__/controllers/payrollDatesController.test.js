import { jest } from '@jest/globals';
import request from 'supertest';
import { payrollDates } from '../../models/mockData.js'; // Import the mock data

const newPayrollDate = {
    employee_id: 1,
    start_day: 1,
    end_day: 15,
};

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

    jest.unstable_mockModule('../../controllers/payrollDatesController.js', () => ({
        getPayrollDates: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the payroll dates array
                const payrollDate = payrollDates.filter(payrollDate => payrollDate.payroll_date_id === id);

                // Respond with the filtered array
                response.status(200).json(payrollDate);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(payrollDates);
            }
        }),
        createPayrollDate: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newPayrollDate);
        }),
        updatePayrollDate: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newPayrollDate);
        }),
        deletePayrollDate: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Payroll date successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/payroll/dates', () => {
    it('should respond with the full loans array', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/payroll/dates?employee_id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(payrollDates);
    });
});

describe('GET /api/payroll/dates with id query', () => {
    it('should respond with the filtered payroll dates array', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/payroll/dates?employee_id=1&id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(payrollDates.filter(payrollDate => payrollDate.payroll_date_id === id));
    });
});

describe('POST /api/payroll/dates', () => {
    it('should respond with the new payroll dates', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/payroll/dates')
            .send(newPayrollDate);
        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newPayrollDate);
    });
});

describe('PUT /api/payroll/dates', () => {
    it('should respond with the updated payroll dates', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/payroll/dates/1')
            .send(newPayrollDate);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newPayrollDate);
    });
});

describe('DELETE /api/payroll/dates', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/payroll/dates/1?employee_id=1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Payroll date successfully deleted');
    });
});