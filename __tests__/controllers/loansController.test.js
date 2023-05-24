import { jest } from '@jest/globals';
import request from 'supertest';
import { loans } from '../../models/mockData.js'; // Import the mock data

const createFutureLoan = () => {
    const dateInFuture = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
        account_id: 1,
        amount: 1000,
        plan_amount: 100,
        recipient: 'test',
        title: 'test',
        description: 'test',
        frequency_type: 1,
        frequency_type_variable: 1,
        frequency_day_of_week: 1,
        frequency_week_of_month: 1,
        frequency_day_of_month: 1,
        frequency_month_of_year: 1,
        begin_date: dateInFuture.toISOString()
    };
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

    jest.unstable_mockModule('../../controllers/loansController.js', () => ({
        getLoans: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the loans array
                const loan = loans.filter(loan => loan.loan_id === id);

                // Respond with the filtered array
                response.status(200).json(loan);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(loans);
            }
        }),
        createLoan: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(createFutureLoan());
        }),
        updateLoan: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(createFutureLoan());
        }),
        deleteLoan: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Loan successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/loans', () => {
    it('should respond with the full loans array', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/loans')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(loans);
    });
});

describe('GET /api/loans with id query', () => {
    it('should respond with the filtered loans array', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/loans?id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(loans.filter(loan => loan.loan_id === id));
    });
});

describe('POST /api/loans', () => {
    it('should respond with the new loan', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/loans')
            .send(createFutureLoan());

        const responseDate = new Date(response.body.begin_date);
        const currentDate = new Date();

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseDate.getTime()).toBeGreaterThan(currentDate.getTime());
    });
});

describe('PUT /api/loans', () => {
    it('should respond with the updated loan', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/loans/1')
            .send(createFutureLoan());

        const responseDate = new Date(response.body.begin_date);
        const currentDate = new Date();

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseDate.getTime()).toBeGreaterThan(currentDate.getTime());
    });
});

describe('DELETE /api/loans', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/loans/1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Loan successfully deleted');
    });
});