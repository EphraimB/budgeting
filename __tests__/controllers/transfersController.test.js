import { jest } from '@jest/globals';
import { transfers } from '../../models/mockData.js';

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

describe('GET /api/transfers', () => {
    it('should respond with an array of transfers', async () => {
        // Arrange
        mockModule(transfers);

        mockRequest.query = { id: 1 };

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers.filter(transfer => transfer.transfer_id === 1));
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error getting transfers');

        const { getTransfers } = await import('../../controllers/transfersController.js');

        // Call the function with the mock request and response
        await getTransfers(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting transfers' });
    });
});

describe('POST /api/transfers', () => {
    it('should respond with the new transfer', async () => {
        // Arrange
        const newTransfer = transfers.filter(transfer => transfer.transfer_id === 1);

        mockModule(newTransfer);

        const { createTransfer } = await import('../../controllers/transfersController.js');

        mockRequest.body = newTransfer;

        await createTransfer(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTransfer);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule(null, 'Error creating transfer');

        const { createTransfer } = await import('../../controllers/transfersController.js');
        
        mockRequest.body = transfers.filter(transfer => transfer.transfer_id === 1);

        // Call the function with the mock request and response
        await createTransfer(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating transfer' });
    });
});

describe('PUT /api/transfer/:id', () => {
    it('should respond with the updated transfer', async () => {
        const updatedTransfer = transfers.filter(transfer => transfer.transfer_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedTransfer };

        await updateTransfer(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTransfer);
    });
});

describe('DELETE /api/transfer/:id', () => {
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 }, query: { account_id: 1 } };

        await deleteTransfer(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer deleted successfully');
    });
});
