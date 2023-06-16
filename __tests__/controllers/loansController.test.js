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

        mockRequest.query = { id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans.filter(loan => loan.loan_id === 1));
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error getting loans');

        mockRequest.query = { id: 1 };

        const { getLoans } = await import('../../controllers/loansController.js');

        // Call the function with the mock request and response
        await getLoans(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting loan' });
    });
});

describe('POST /api/loans', () => {
    it('should respond with the new loan', async () => {
        const newLoan = loans.filter(loan => loan.loan_id === 1);

        mockModule(newLoan.filter(loan => loan.loan_id === 1));

        const { createLoan } = await import('../../controllers/loansController.js');

        mockRequest.body = newLoan;

        await createLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newLoan);
    });

    it('should respond with an error message', async () => {
        mockModule(null, 'Error creating loan');

        const { createLoan } = await import('../../controllers/loansController.js');

        mockRequest.body = loans.filter(loan => loan.loan_id === 1);

        await createLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating loan' });
    });
});

describe('PUT /api/loans/:id', () => {
    it('should respond with the updated loan', async () => {
        const updatedLoan = loans.filter(loan => loan.loan_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedLoan };

        await updateLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedLoan);
    });
});

describe('DELETE /api/loans/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deleteLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan deleted successfully');
    });
});
