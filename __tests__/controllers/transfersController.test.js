import { jest } from '@jest/globals';
import { transfers } from '../../models/mockData.js';

jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
    executeQuery: jest.fn().mockResolvedValue(transfers.filter(transfer => transfer.transfer_id === 1)),
    handleError: jest.fn().mockReturnValue({ message: 'Error' }),
}));

jest.unstable_mockModule('../../jobs/scheduleCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job scheduled' })
}));

jest.unstable_mockModule('../../jobs/deleteCronJob.js', () => ({
    default: jest.fn().mockReturnValue({ message: 'Cron job deleted' })
}));

const { getTransfers, createTransfer, updateTransfer, deleteTransfer } = await import('../../controllers/transfersController.js');

let mockRequest = {};
let mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),  // Mock send method
};

afterEach(() => {
    jest.clearAllMocks();
});

describe('GET /api/transfers', () => {
    it('should respond with an array of transfers', async () => {
        mockRequest = {
            query: {
                id: 1
            }
        }; // Set the mockRequest.query

        // Call the function with the mock request and response
        await getTransfers(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers.filter(transfer => transfer.transfer_id === 1));
    });
});

describe('POST /api/transfers', () => {
    it('should respond with the new transfer', async () => {
        const newTransfer = transfers.filter(transfer => transfer.transfer_id === 1);
        mockRequest = { body: newTransfer };

        await createTransfer(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTransfer);
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
