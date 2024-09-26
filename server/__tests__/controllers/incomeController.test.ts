import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { type Request } from 'express';
import { mockModule } from '../__mocks__/mockModule.js';

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

// Mock request and response
let mockRequest: any;
let mockResponse: any;

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

const income = [
    {
        id: 1,
        accountId: 1,
        taxId: 1,
        amount: 1000,
        title: 'Test Income',
        description: 'Test Income to test the income route',
        frequencyType: 2,
        frequencyTypeVariable: 1,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        frequencyMonthOfYear: null,
        beginDate: '2020-01-01',
        nextDate: '2020-06-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/income', () => {
    it('should respond with an array of income', async () => {
        // Arrange
        mockModule([income], income);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { accountId: null };

        // Act
        await getIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income',
            });
        });
    });
});

it('should respond with an array of income with account id', async () => {
    // Arrange
    mockModule([income], income);

    const { getIncome } = await import(
        '../../src/controllers/incomeController.js'
    );

    mockRequest.query = { accountId: 1 };

    // Call the function with the mock request and response
    await getIncome(mockRequest as Request, mockResponse);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(income);
});

it('should handle errors correctly with account id', async () => {
    // Arrange
    mockModule([]);

    const { getIncome } = await import(
        '../../src/controllers/incomeController.js'
    );

    mockRequest.query = { accountId: 1 };

    // Act
    await getIncome(mockRequest as Request, mockResponse).catch(() => {
        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income for given account id',
        });
    });
});

describe('GET /api/income/:id', () => {
    it('should respond with an array of income with id', async () => {
        // Arrange
        mockModule([income], income);

        const { getIncomeById } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getIncomeById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        mockModule([]);

        const { getIncomeById } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Act
        await getIncomeById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income',
            });
        });
    });

    it('should respond with an array of income with account id and id', async () => {
        // Arrange
        mockModule([income], income);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income',
            });
        });
    });

    it('should respond with a 404 error message when the income does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getIncomeById } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: null };

        // Act
        await getIncomeById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });
});

describe('POST /api/income', () => {
    it('should respond with an income', async () => {
        // Arrange
        mockModule(
            [[], [], [{ id: 1, unique_id: 'sb27gwihp' }], income, []],
            income,
        );

        const { createIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = {
            accountId: 1,
            taxId: 1,
            amount: 1000,
            title: 'Test Income',
            description: 'Test Income to test the income route',
            frequency: {
                type: 2,
                typeVariable: 1,
                dayOfMonth: null,
                dayOfWeek: null,
                weekOfMonth: null,
                monthOfYear: null,
            },
            beginDate: '2020-01-01',
        };

        await createIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Act
        await createIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating income',
            });
        });
    });
});

describe('PUT /api/income/:id', () => {
    it('should respond with an income', async () => {
        mockModule(
            [
                [{ id: 1, cron_job_id: 1 }],
                [{ id: 1, unique_id: 'd82vdb2c2x' }],
                [],
                [],
                [],
                [],
                income,
                [],
            ],
            income,
        );

        const { updateIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            taxId: 1,
            amount: 1000,
            title: 'Test Income',
            description: 'Test Income to test the income route',
            frequency: {
                type: 2,
                typeVariable: 1,
                dayOfMonth: null,
                dayOfWeek: null,
                weekOfMonth: null,
                monthOfYear: null,
            },
            beginDate: '2020-01-01',
        };

        await updateIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = income[0];

        // Act
        await updateIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating income',
            });
        });
    });

    it('should respond with a 404 error message when the income does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = income[0];

        // Act
        await updateIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });
});

describe('DELETE /api/income/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ id: 1, cron_job_id: 1 }],
            [],
            [],
            [{ id: 1, unique_id: 'bdb82vcbi' }],
            income,
            [],
            [],
            [],
        ]);

        const { deleteIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Income deleted successfully',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting income',
            });
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });
});
