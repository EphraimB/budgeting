import { jest } from '@jest/globals';
import request from 'supertest';
import { expenses } from '../../models/mockData.js'; // Import the mock data

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

    // Mock the getAccounts route function
    jest.unstable_mockModule('../../controllers/expensesController.js', () => ({
        getExpenses: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the accounts array
                const expense = expenses.filter(expense => expense.expense_id === id);

                // Respond with the filtered array
                response.status(200).json(expense);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(expenses);
            }
        }),
        createExpense: jest.fn().mockImplementation((request, response) => {
            const newExpense = {
                account_id: 1,
                amount: 100,
                title: 'test',
                description: 'test',
                frequency_type: 1,
                frequency_type_variable: 1,
                frequency_day_of_week: 1,
                frequency_week_of_month: 1,
                frequency_day_of_month: 1,
                frequency_month_of_year: 1,
                begin_date: new Date().toISOString()
            };

            // Respond with the new account
            response.status(200).json(newExpense);
        }),
        updateExpense: jest.fn().mockImplementation((request, response) => {
            const newExpense = {
                account_id: 1,
                amount: 100,
                title: 'test',
                description: 'test',
                frequency_type: 1,
                frequency_type_variable: 1,
                frequency_day_of_week: 1,
                frequency_week_of_month: 1,
                frequency_day_of_month: 1,
                frequency_month_of_year: 1,
                begin_date: new Date().toISOString()
            };

            // Respond with the new account
            response.status(200).json(newExpense);
        }),
        deleteExpense: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Expense successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/accounts', () => {
    it('should respond with an array of expenses', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get('/api/expenses');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expenses);
    });
});

describe('GET /api/expenses with id query', () => {
    it('should respond with an array of expenses', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default).get(`/api/expenses?id=${id}`);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expenses.filter(expense => expense.expense_id === id));
    });
});

describe('POST /api/expenses', () => {
    it('should respond with the new expense', async () => {
        // Act
        const app = await import('../../app.js');
        const newExpense = {
            account_id: 1,
            amount: 100,
            title: 'test',
            description: 'test',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 1,
            frequency_week_of_month: 1,
            frequency_day_of_month: 1,
            frequency_month_of_year: 1,
            begin_date: new Date().toISOString()
        };
        const response = await request(app.default)
            .post('/api/expenses')
            .send(newExpense);

        console.log(response.body);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newExpense);
    });
});

describe('PUT /api/expenses/:id', () => {
    it('should respond with the updated expense', async () => {
        // Act
        const app = await import('../../app.js');
        const newExpense = {
            account_id: 1,
            amount: 100,
            title: 'test',
            description: 'test',
            frequency_type: 1,
            frequency_type_variable: 1,
            frequency_day_of_week: 1,
            frequency_week_of_month: 1,
            frequency_day_of_month: 1,
            frequency_month_of_year: 1,
            begin_date: new Date().toISOString()
        };
        const response = await request(app.default)
            .put('/api/expenses/1')
            .send(newExpense);

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(newExpense);
    });
});

describe('DELETE /api/accounts/:id', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/expenses/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Expense successfully deleted');
    });
});