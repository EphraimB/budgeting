import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { accounts, taxes } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
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
const mockModule = (
    executeQueryValue: QueryResultRow[] | string | null,
    errorMessage?: string,
) => {
    const executeQuery = errorMessage
        ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
        : jest.fn(async () => await Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/taxes', () => {
    it('should respond with an array of taxes', async () => {
        // Arrange
        mockModule(taxes);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(taxes);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting taxes';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting taxes',
        });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of taxes with id', async () => {
        // Arrange
        mockModule(taxes.filter((tax) => tax.tax_id === 1));

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            taxes.filter((tax) => tax.tax_id === 1),
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting tax',
        });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getTaxes } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});

describe('POST /api/taxes', () => {
    it('should respond with the new tax', async () => {
        const newTax = taxes.filter((tax) => tax.tax_id === 1);

        mockModule(newTax);

        const { createTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.body = newTax;

        await createTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTax);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.body = taxes.filter((tax) => tax.tax_id === 1);

        // Act
        await createTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating tax',
        });

        // Check that console.error was called with the expected error
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/taxes/:id', () => {
    it('should respond with the updated tax', async () => {
        const updatedTax = taxes.filter((tax) => tax.tax_id === 1);

        mockModule(updatedTax);

        const { updateTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTax;

        await updateTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTax);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = taxes.filter((tax) => tax.tax_id === 1);

        // Act
        await updateTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating tax',
        });

        // Check that console.error was called with the expected error
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = taxes.filter((tax) => tax.tax_id === 1);

        // Act
        await updateTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});

describe('DELETE /api/taxes/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted tax');

        const { deleteTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted tax',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting tax',
        });

        // Check that console.error was called with the expected error
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteTax } = await import(
            '../../controllers/taxesController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Tax not found');
    });
});
