import { jest } from '@jest/globals';
import { loans } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(loans.filter(loan => loan.loan_id === 1)),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

jest.unstable_mockModule('../../bree/jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job scheduled' })
}));

jest.unstable_mockModule('../../bree/jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job deleted' })
}));

const { getLoans, createLoan, updateLoan, deleteLoan } = await import('../../controllers/loansController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/loans', () => {
    it('should respond with an array of loans', async () => {
        mockRequest = {
            query: {
                id: 1
            }
        }; // Set the mockRequest.query

        // Call the function with the mock request and response
        await getLoans(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans.filter(loan => loan.loan_id === 1));
    });
});

describe('POST /api/loans', () => {
    it('should respond with the new loan', async () => {
        const newLoan = loans.filter(loan => loan.loan_id === 1);
        mockRequest = { body: newLoan };

        await createLoan(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newLoan);
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
