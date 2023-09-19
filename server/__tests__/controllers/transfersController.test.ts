import { expect, jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { transfers } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';
import { parseIntOrFallback } from '../../utils/helperFunctions.js';

const modifiedTransfers = transfers.map((transfer) => ({
    transfer_id: transfer.transfer_id,
    source_account_id: transfer.source_account_id,
    destination_account_id: transfer.destination_account_id,
    transfer_amount: transfer.transfer_amount,
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    frequency_type: transfer.frequency_type,
    frequency_type_variable: transfer.frequency_type_variable,
    frequency_month_of_year: transfer.frequency_month_of_year,
    frequency_day_of_month: transfer.frequency_day_of_month,
    frequency_day_of_week: transfer.frequency_day_of_week,
    frequency_week_of_month: transfer.frequency_week_of_month,
    date_created: transfer.date_created,
    date_modified: transfer.date_modified,
}));

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

jest.mock('../../crontab/scheduleCronJob.js', () => {
    return jest.fn().mockImplementation(
        async () =>
            await Promise.resolve({
                cronDate: '0 0 16 * *',
                uniqueId: '123',
            }),
    );
});

jest.mock('../../crontab/deleteCronJob.js', () => {
    return jest
        .fn()
        .mockImplementation(async () => await Promise.resolve('123'));
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;

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
    const executeQuery =
        errorMessage !== null && errorMessage !== undefined
            ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
            : jest.fn(async () => await Promise.resolve(executeQueryValue));

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
    }));
};

describe('GET /api/transfers', () => {
    it('should respond with an array of transfers', async () => {
        // Arrange
        mockModule(transfers);

        mockRequest.query = { id: null };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedTransfers);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting transfers';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfers',
        });
    });

    it('should respond with an array of transfers with id', async () => {
        // Arrange
        mockModule(transfers.filter((transfer) => transfer.transfer_id === 1));

        mockRequest.query = { id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            modifiedTransfers.filter((transfer) => transfer.transfer_id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfer',
        });
    });

    it('should respond with an array of transfers with account_id', async () => {
        // Arrange
        mockModule(
            transfers.filter((transfer) => transfer.source_account_id === 1),
        );

        mockRequest.query = { account_id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            modifiedTransfers.filter(
                (transfer) => transfer.source_account_id === 1,
            ),
        );
    });

    it('should respond with an error message with account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { account_id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfers for given account_id',
        });
    });

    it('should respond with an array of transfers with id and account_id', async () => {
        // Arrange
        mockModule(
            transfers.filter(
                (transfer) =>
                    transfer.transfer_id === 1 &&
                    transfer.source_account_id === 1,
            ),
        );

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            modifiedTransfers.filter(
                (transfer) =>
                    transfer.transfer_id === 1 &&
                    transfer.source_account_id === 1,
            ),
        );
    });

    it('should respond with an error message with id and account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: 1, account_id: 1 };

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfer',
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getTransfers } = await import(
            '../../controllers/transfersController.js'
        );

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
        const newTransfer = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule(newTransfer);

        const { createTransfer } = await import(
            '../../controllers/transfersController.js'
        );

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

        const { createTransfer } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        // Call the function with the mock request and response
        await createTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating transfer',
        });
    });

    it('should respond with an error message with return object', async () => {
        // Arrange
        const errorMessage = 'Error creating transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createTransferReturnObject } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        // Call the function with the mock request and response
        await createTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating transfer',
        });
    });

    it('should respond with the created transfer', async () => {
        // Arrange
        const newTransfer = modifiedTransfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule(newTransfer);

        const { createTransferReturnObject } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.body = newTransfer;

        await createTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newTransfer);
    });
});

describe('PUT /api/transfer/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        const updatedTransfer = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule(updatedTransfer);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTransfer;

        const { updateTransfer } = await import(
            '../../controllers/transfersController.js'
        );

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
        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        const { updateTransfer } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating transfer',
        });
    });

    it('should respond with an error message in the return object', async () => {
        // Arrange
        const errorMessage = 'Error updating transfer';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        const { updateTransferReturnObject } = await import(
            '../../controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await updateTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting transfer',
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateTransfer } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        // Act
        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer not found');
    });

    it('should respond with the updated transfer', async () => {
        // Arrange
        const updatedTransfer = modifiedTransfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule(updatedTransfer);

        const { updateTransferReturnObject } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest = { transfer_id: 1 };

        await updateTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedTransfer);
    });
});

describe('DELETE /api/transfer/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule('Transfer deleted successfully');

        const { deleteTransfer } = await import(
            '../../controllers/transfersController.js'
        );

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

        const { deleteTransfer } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting transfer',
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteTransfer } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { account_id: 1 };

        // Act
        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Transfer not found');
    });

    it('should respond with a success message with account_id', async () => {
        // Arrange
        mockModule('Transfer deleted successfully');

        const { deleteTransferReturnObject } = await import(
            '../../controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { account_id: 1 };

        await deleteTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Transfer deleted successfully',
        );
    });
});
