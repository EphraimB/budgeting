import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { transfers } from '../../models/mockData.js';
import { QueryResultRow } from 'pg';

jest.mock('../../crontab/scheduleCronJob.js', () => {
    return jest.fn().mockImplementation(() => Promise.resolve({ cronDate: '0 0 16 * *', uniqueId: '123' }));
});

jest.mock('../../crontab/deleteCronJob.js', () => {
    return jest.fn().mockImplementation(() => Promise.resolve('123'));
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
    };
    mockNext = jest.fn();
});

afterEach(() => {
    jest.resetModules();
});

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

/**
 * 
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (executeQueryValue: QueryResultRow[] | string | null, errorMessage?: string) => {
    const executeQuery = errorMessage
        ? jest.fn(() => Promise.reject(new Error(errorMessage)))
        : jest.fn(() => Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/transfers', () => {
    it('should respond with an array of transfers', async () => {
        // Arrange
        mockModule(transfers);

        mockRequest.query = { id: null };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting transfers';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfers' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of transfers with id', async () => {
        // Arrange
        mockModule(transfers.filter(transfer => transfer.transfer_id === 1));

        mockRequest.query = { id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers.filter(transfer => transfer.transfer_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfer' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of transfers with account_id', async () => {
        // Arrange
        mockModule(transfers.filter(transfer => transfer.source_account_id === 1));

        mockRequest.query = { account_id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers.filter(transfer => transfer.source_account_id === 1));
    });

    it('should respond with an error message with account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfers for given account_id' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of transfers with id and account_id', async () => {
        // Arrange
        mockModule(transfers.filter(transfer => transfer.transfer_id === 1 && transfer.source_account_id === 1));

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers.filter(transfer => transfer.transfer_id === 1 && transfer.source_account_id === 1));
    });

    it('should respond with an error message with id and account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfer' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getTransfers } = await import('../../controllers/transfersController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer not found');
    });
});

describe('POST /api/transfers', () => {
    it('should populate request.transfer_id', async () => {
        // Arrange
        const newTransfer = transfers.filter(transfer => transfer.transfer_id === 1);

        mockModule(newTransfer);

        const { createTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.body = newTransfer;

        await createTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.transfer_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.body = transfers.filter(transfer => transfer.transfer_id === 1);

        // Call the function with the mock request and response
        await createTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating transfer' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/transfer/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        const updatedTransfer = transfers.filter(transfer => transfer.transfer_id === 1);

        mockModule(updatedTransfer);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTransfer;

        const { updateTransfer } = await import('../../controllers/transfersController.js');

        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = transfers.filter(transfer => transfer.transfer_id === 1);

        const { updateTransfer } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating transfer' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = transfers.filter(transfer => transfer.transfer_id === 1);

        // Act
        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer not found');
    });
});

describe('DELETE /api/transfer/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Transfer deleted successfully');

        const { deleteTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.params = { id: 1 };

        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.params = { id: 1 };
        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting transfer' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.params = { id: 3 };
        mockRequest.query = { account_id: 1 };

        // Act
        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer not found');
    });
});
