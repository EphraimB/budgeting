import { jest } from '@jest/globals';
import request from 'supertest';
import { transfers } from '../../models/mockData.js'; // Import the mock data

const createFutureTransfer = () => {
    const dateInFuture = new Date();
    dateInFuture.setDate(dateInFuture.getDate() + 7);

    return {
        source_account_id: 1,
        destination_account_id: 2,
        amount: 100,
        title: 'test',
        description: 'test',
        frequency_type: 2,
        begin_date: dateInFuture
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

    jest.unstable_mockModule('../../controllers/transfersController.js', () => ({
        getTransfers: jest.fn().mockImplementation((request, response) => {
            // Check if an id query parameter was provided
            if (request.query.id !== undefined) {
                // Convert id to number, because query parameters are strings
                const id = Number(request.query.id);

                // Filter the loans array
                const transfer = transfers.filter(transfer => transfer.transfer_id === id);

                // Respond with the filtered array
                response.status(200).json(transfer);
            } else {
                // If no id was provided, respond with the full accounts array
                response.status(200).json(transfers);
            }
        }),
        createTransfer: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(createFutureTransfer());
        }),
        updateTransfer: jest.fn().mockImplementation((request, response) => {
            // Respond with the new account
            response.status(200).json(createFutureTransfer());
        }),
        deleteTransfer: jest.fn().mockImplementation((request, response) => {
            // Response with a success message
            response.status(200).send('Transfer successfully deleted');
        }),
    }));
});

afterAll(() => {
    // Restore the original console.log function
    jest.restoreAllMocks();
});

describe('GET /api/transfers', () => {
    it('should respond with the full transfers array', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/transfers?account_id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(transfers);
    });
});

describe('GET /api/transfers with id query', () => {
    it('should respond with the filtered transfers array', async () => {
        const id = 1;

        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .get('/api/transfers?account_id=1&id=1')
            .set('Accept', 'application/json');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(transfers.filter(transfer => transfer.transfer_id === id));
    });
});

describe('POST /api/transfers', () => {
    it('should respond with the new transfer', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .post('/api/transfers')
            .send(createFutureTransfer());

        const responseDate = new Date(response.body.begin_date);
        const currentDate = new Date();

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseDate.getTime()).toBeGreaterThan(currentDate.getTime());
    });
});

describe('PUT /api/transfers', () => {
    it('should respond with the updated wishlist', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .put('/api/transfers/1')
            .send(createFutureTransfer());

        const responseDate = new Date(response.body.begin_date);
        const currentDate = new Date();

        // Assert
        expect(response.statusCode).toBe(200);
        expect(responseDate.getTime()).toBeGreaterThan(currentDate.getTime());
    });
});

describe('DELETE /api/transfers', () => {
    it('should respond with a success message', async () => {
        // Act
        const app = await import('../../app.js');
        const response = await request(app.default)
            .delete('/api/transfers/1?account_id=1');

        // Assert
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Transfer successfully deleted');
    });
});