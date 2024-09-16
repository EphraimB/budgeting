import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';
import { Transfer } from '../../src/types/types.js';

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const transfers = [
    {
        id: 1,
        cronJobId: 1,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 100,
        title: 'Test Transfer',
        description: 'Test Transfer to test the transfer route',
        beginDate: '2020-01-01',
        endDate: null,
        frequencyType: 2,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        nextDate: '2020-02-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        cronJobId: 2,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 25,
        title: 'Test Transfer',
        description: 'Test Transfer to test the transfer route',
        beginDate: '2020-01-01',
        endDate: null,
        frequencyType: 0,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        nextDate: '2020-01-02',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 3,
        cronJobId: 3,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 50,
        title: 'Test Transfer',
        description: 'Test Transfer to test the transfer route',
        beginDate: '2020-01-01',
        endDate: null,
        frequencyType: 1,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        nextDate: '2020-01-08',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 4,
        cronJobId: 4,
        sourceAccountId: 1,
        destinationAccountId: 2,
        amount: 200,
        title: 'Test Transfer',
        description: 'Test Transfer to test the transfer route',
        beginDate: '2020-01-01',
        endDate: null,
        frequencyType: 3,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        nextDate: '2021-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 5,
        cronJobId: 5,
        sourceAccountId: 2,
        destinationAccountId: 1,
        amount: 200,
        title: 'Test Transfer',
        description: 'Test Transfer to test the transfer route',
        beginDate: '2020-01-01',
        endDate: null,
        frequencyType: 3,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        nextDate: '2021-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/transfers', () => {
    it('should respond with an array of transfers', async () => {
        // Arrange
        mockModule([transfers], transfers);

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(transfers);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting transfers',
            });
        });
    });

    it('should respond with an array of transfers with account id', async () => {
        // Arrange
        mockModule(
            [transfers.filter((transfer) => transfer.sourceAccountId === 1)],
            transfers.filter((transfer) => transfer.sourceAccountId === 1),
        );

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transfers.filter((transfer) => transfer.sourceAccountId === 1),
        );
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        mockModule([]);

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting transfers for given account id',
            });
        });
    });
});

describe('GET /api/transfers/:id', () => {
    it('should respond with an array of transfers with id', async () => {
        // Arrange
        mockModule(
            [transfers.filter((transfer) => transfer.id === 1)],
            transfers.filter((transfer) => transfer.id === 1),
        );

        const { getTransfersById } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getTransfersById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transfers.filter((transfer) => transfer.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getTransfersById } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await getTransfersById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting transfer',
                });
            },
        );
    });

    it('should respond with an array of transfers with id and account id', async () => {
        // Arrange
        mockModule([
            transfers.filter(
                (transfer) =>
                    transfer.id === 1 && transfer.sourceAccountId === 1,
            ),
        ]);

        const { getTransfersById } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransfersById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transfers.filter(
                (transfer) =>
                    transfer.id === 1 && transfer.sourceAccountId === 1,
            ),
        );
    });

    it('should respond with an error message with id and account id', async () => {
        // Arrange
        mockModule([]);

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getTransfers(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting transfer',
            });
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getTransfers } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 3 };

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

        mockModule([
            [],
            newTransfer,
            [],
            [{ cron_job_id: 1, unique_id: 'transfers-1' }, []],
            [],
        ]);

        const { createTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.body = newTransfer;

        await createTransfer(mockRequest as Request, mockResponse, mockNext);

        // Add next date to the transfers response
        transfersResponse.map((transfer: any) => {
            transfer.next_date = undefined;
        });

        // Assert
        expect(mockRequest.transfer_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { createTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        // Call the function with the mock request and response
        await createTransfer(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating transfer',
            });
        });
    });

    it('should respond with an error message with return object', async () => {
        // Arrange
        mockModule([]);

        const { createTransferReturnObject } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        // Call the function with the mock request and response
        await createTransferReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating transfer',
            });
        });
    });

    it('should respond with the created transfer', async () => {
        // Arrange
        const newTransfer = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule([newTransfer]);

        const { createTransferReturnObject } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.body = newTransfer;

        await createTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transfersResponse.filter((transfer) => transfer.id === 1),
        );
    });
});

describe('PUT /api/transfer/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        const updatedTransfer = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule([
            updatedTransfer,
            [{ cron_job_id: 1, unique_id: 'transfers-1' }],
            [],
            [],
            [],
            [],
        ]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedTransfer;

        const { updateTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        await updateTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        const { updateTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await updateTransfer(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating transfer',
            });
        });
    });

    it('should respond with an error message in the return object', async () => {
        // Arrange
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        const { updateTransferReturnObject } = await import(
            '../../src/controllers/transfersController.js'
        );

        // Call the function with the mock request and response
        await updateTransferReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting transfer',
            });
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateTransfer } = await import(
            '../../src/controllers/transfersController.js'
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
        const updatedTransfer = transfers.filter(
            (transfer) => transfer.transfer_id === 1,
        );

        mockModule([updatedTransfer]);

        const { updateTransferReturnObject } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest = { transfer_id: 1 };

        await updateTransferReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            transfersResponse.filter((transfer) => transfer.id === 1),
        );
    });
});

describe('DELETE /api/transfer/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule([
            transfers.filter((transfer) => transfer.transfer_id === 1),
            [],
            [],
            [{ cron_job_id: 1, unique_id: 'transfers-1' }],
            [],
            [],
        ]);

        const { deleteTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteTransfer(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { deleteTransfer } = await import(
            '../../src/controllers/transfersController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await deleteTransfer(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting transfer',
            });
        });
    });

    it('should respond with a 404 error message when the transfer does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteTransfer } = await import(
            '../../src/controllers/transfersController.js'
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
        mockModule(['Transfer deleted successfully']);

        const { deleteTransferReturnObject } = await import(
            '../../src/controllers/transfersController.js'
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
