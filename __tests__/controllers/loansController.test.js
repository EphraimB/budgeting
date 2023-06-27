import { jest } from '@jest/globals';
import { loans } from '../../models/mockData.js';

jest.unstable_mockModule('../../bree/jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ cronDate: '0 0 16 * *', uniqueId: '123' })
}));

jest.unstable_mockModule('../../bree/jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue('123')
}));

// Mock request and response
let mockRequest;
let mockResponse;
let consoleSpy;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
});

afterEach(() => {
    jest.resetModules();
});

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

// Helper function to generate mock module
const mockModule = (executeQueryValue, errorMessage) => {
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: errorMessage
            ? jest.fn().mockRejectedValue(new Error(errorMessage))
            : jest.fn().mockResolvedValue(executeQueryValue),
        handleError: jest.fn((res, message) => {
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
        await getLoans(mockRequest, mockResponse);

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
        await getLoans(mockRequest, mockResponse);

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
        await getLoans(mockRequest, mockResponse);

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
        await getLoans(mockRequest, mockResponse);

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
        await getLoans(mockRequest, mockResponse);

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

        await createLoan(mockRequest, mockResponse);

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

        await createLoan(mockRequest, mockResponse);

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

        await updateLoan(mockRequest, mockResponse);

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

        await updateLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating loan' });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the expense does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateLoan } = await import('../../controllers/loansController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        // Act
        await updateLoan(mockRequest, mockResponse);

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

        await deleteLoan(mockRequest, mockResponse);

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

        await deleteLoan(mockRequest, mockResponse);

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
        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        // Act
        await deleteLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});
