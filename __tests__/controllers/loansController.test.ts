import { jest } from '@jest/globals';
import { loans } from '../../models/mockData.js';
import { Request, Response } from 'express';
import { QueryResultRow } from 'pg';

// Mock the modules
const mockScheduleCronJob = jest.fn().mockImplementation(() => Promise.resolve({ cronDate: '0 0 16 * *', uniqueId: '123' }));
const mockDeleteCronJob = jest.fn().mockImplementation(() => Promise.resolve('123'));

jest.mock('../../bree/jobs/scheduleCronJob.js', () => {
    return mockScheduleCronJob;
});

jest.mock('../../bree/jobs/deleteCronJob.js', () => {
    return mockDeleteCronJob;
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
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
const mockModule = (executeQueryValue: QueryResultRow[] | string, errorMessage?: string) => {
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

describe('GET /api/loans', () => {
    it('should respond with an array of loans', async () => {
        // Arrange
        mockModule(loans);

        mockRequest.query = { id: null };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting loans';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loans' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of loans with id', async () => {
        // Arrange
        mockModule(loans);

        mockRequest.query = { id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans.filter(loan => loan.loan_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of loans with account id', async () => {
        // Arrange
        mockModule(loans);

        mockRequest.query = { account_id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans.filter(loan => loan.account_id === 1));
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loans for given account_id' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of loans with account id and id', async () => {
        // Arrange
        mockModule(loans);

        mockRequest.query = { account_id: 1, id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans.filter(loan => loan.account_id === 1 && loan.loan_id === 1));
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1, id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getLoans } = await import('../../controllers/loansController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});

describe('POST /api/loans', () => {
    it('should respond with the new loan', async () => {
        const newLoan = loans.filter(loan => loan.loan_id === 1);

        mockModule(newLoan);

        const { createLoan } = await import('../../controllers/loansController.js');

        mockRequest.body = newLoan;

        await createLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newLoan);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createLoan } = await import('../../controllers/loansController.js');

        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        await createLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/loans/:id', () => {
    it('should respond with the updated loan', async () => {
        const updatedLoan = loans.filter(loan => loan.loan_id === 1);

        mockModule(updatedLoan);

        const { updateLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedLoan;

        await updateLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedLoan);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error updating loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        await updateLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        // Act
        await updateLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});

describe('DELETE /api/loans/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Loan deleted successfully');

        const { deleteLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan deleted successfully');
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting loan';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 3 };

        // Act
        await deleteLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});
