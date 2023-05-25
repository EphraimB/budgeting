import { jest } from '@jest/globals';
import request from 'supertest';
import { employees } from '../../models/mockData.js'; // Import the mock data

const newPayrollEmployee = {
    name: 'test',
    hourly_rate: 10,
    regular_hours: 40,
    vacation_days: 10,
    sick_days: 10,
    work_schedule: '0111100',
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

    jest.unstable_mockModule('../../controllers/employeesController.js', () => ({
        getEmployee: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the payroll dates array
                const employee = employees.filter(employee => employee.employee_id === id);

                // Respond with the filtered array
                response.status(200).json(employee);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(employees);
            }
        }),
        createEmployee: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newPayrollEmployee);
        }),
        updateEmployee: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(newPayrollEmployee);
        }),
        deleteEmployee: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Employee successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/payroll/employee', () => {
    it('should respond with the full employees array', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/payroll/employee')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(employees);
    });
});

describe('GET /api/payroll/employee with id query', () => {
    it('should respond with the filtered employee array', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/payroll/employee?employee_id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(employees.filter(employee => employee.employee_id === id));
    });
});

describe('POST /api/payroll/employee', () => {
    it('should respond with the new employee', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/payroll/employee')
            .send(newPayrollEmployee);
        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newPayrollEmployee);
    });
});

describe('PUT /api/payroll/employee', () => {
    it('should respond with the updated employee', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/payroll/employee/1')
            .send(newPayrollEmployee);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newPayrollEmployee);
    });
});

describe('DELETE /api/payroll/employee', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/payroll/employee/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Employee successfully deleted');
    });
});