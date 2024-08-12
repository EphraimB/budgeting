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
import { Income } from '../../src/types/types.js';

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

const income = [
    {
        income_id: 1,
        account_id: 1,
        tax_id: 1,
        income_amount: 1000,
        income_title: 'Test Income',
        income_description: 'Test Income to test the income route',
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        income_begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const incomeResponse: Income[] = [
    {
        id: 1,
        account_id: 1,
        tax_id: 1,
        income_amount: 1000,
        income_title: 'Test Income',
        income_description: 'Test Income to test the income route',
        frequency_type: 2,
        frequency_type_variable: 1,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        frequency_month_of_year: null,
        income_begin_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/income', () => {
    it('should respond with an array of income', async () => {
        // Arrange
        mockModule([income]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Add next date to the income response
        incomeResponse.map((income: any) => {
            income.next_date = '2020-01-01';
        });

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income',
            });
        });
    });

    it('should respond with an array of income with id', async () => {
        // Arrange
        mockModule([income]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Add next date to the income response
        incomeResponse.map((income: any) => {
            income.next_date = '2020-01-01';
        });

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income',
            });
        });
    });

    it('should respond with an array of income with account id', async () => {
        // Arrange
        mockModule([income]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Add next date to the income response
        incomeResponse.map((income: any) => {
            income.next_date = '2020-01-01';
        });

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting income for given account_id',
            });
        });
    });

    it('should respond with an array of income with account id and id', async () => {
        // Arrange
        mockModule([income]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Add next date to the income response
        incomeResponse.map((income: any) => {
            income.next_date = '2020-01-01';
        });

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

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

        const { getIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });
});

describe('POST /api/income', () => {
    it('should populate the request.income_id', async () => {
        // Arrange
        mockModule([[], income, [], [{ cron_job_id: 1 }], [], []]);

        const { createIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        await createIncome(mockRequest as Request, mockResponse, mockNext);

        // Add next date to the income response
        incomeResponse.map((income: any) => {
            income.next_date = undefined;
        });

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { createIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Act
        await createIncome(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating income',
            });
        });
    });

    it('should handle errors correctly in return object', async () => {
        // Arrange
        mockModule([]);

        const { createIncomeReturnObject } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Act
        await createIncomeReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating income',
            });
        });
    });

    it('should respond with an array of income', async () => {
        // Arrange
        mockModule([income, [{ cron_job_id: 1 }], [], []]);

        const { createIncomeReturnObject } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Call the function with the mock request and response
        await createIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });
});

describe('PUT /api/income/:id', () => {
    it('should call next in the middleware', async () => {
        mockModule([income, [{ cron_job_id: 1 }], [], []]);

        const { updateIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = income[0];

        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
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
        await updateIncome(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating income',
            });
        });
    });

    it('should handle errors correctly in the return object function', async () => {
        // Arrange
        mockModule([]);

        const { updateIncomeReturnObject } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Act
        await updateIncomeReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
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
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });

    it('should respond with an array of income', async () => {
        // Arrange
        mockModule([income, [{ cron_job_id: 1 }], [], []]);

        const { updateIncomeReturnObject } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.body = income[0];

        // Call the function with the mock request and response
        await updateIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(incomeResponse);
    });
});

describe('DELETE /api/income/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule([
            income,
            [],
            [],
            [{ cron_job_id: 1, unique_id: 'income-1' }],
            [],
        ]);

        const { deleteIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteIncome } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
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
        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });

    it('should respond with a success message', async () => {
        // Arrange
        mockModule(['Income deleted successfully']);

        const { deleteIncomeReturnObject } = await import(
            '../../src/controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        // Call the function with the mock request and response
        await deleteIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Income deleted successfully',
        );
    });
});
