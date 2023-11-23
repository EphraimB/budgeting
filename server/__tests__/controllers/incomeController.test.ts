import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { accounts, income } from '../../models/mockData.js';
import { type QueryResultRow } from 'pg';
import {
    parseIntOrFallback,
    parseFloatOrFallback,
} from '../../utils/helperFunctions.js';

jest.mock('../../config/winston', () => ({
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

/**
 *
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValueFirst: QueryResultRow[] | string | null,
    errorMessage?: string,
    executeQueryValueSecond?: QueryResultRow[] | string | null,
    executeQueryValueThird?: QueryResultRow[] | string | null,
    executeQueryValueFourth?: QueryResultRow[] | string | null,
) => {
    const executeQuery = jest.fn();

    if (errorMessage !== null && errorMessage !== undefined) {
        executeQuery.mockImplementationOnce(
            async () => await Promise.reject(new Error(errorMessage)),
        );
    } else {
        executeQuery.mockImplementationOnce(
            async () => await Promise.resolve(executeQueryValueFirst),
        );
        if (executeQueryValueSecond !== undefined) {
            executeQuery.mockImplementationOnce(
                async () => await Promise.resolve(executeQueryValueSecond),
            );

            if (executeQueryValueThird !== undefined) {
                executeQuery.mockImplementationOnce(
                    async () => await Promise.resolve(executeQueryValueThird),
                );

                if (executeQueryValueFourth !== undefined) {
                    executeQuery.mockImplementationOnce(
                        async () =>
                            await Promise.resolve(executeQueryValueFourth),
                    );
                }
            }
        }
    }

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseIntOrFallback,
        parseFloatOrFallback,
        manipulateCron: jest
            .fn()
            .mockImplementation(
                async () => await Promise.resolve([true, '123']),
            ),
    }));
};

describe('GET /api/income', () => {
    it('should respond with an array of income', async () => {
        // Arrange
        mockModule(income);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { id: null };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(income);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { id: null };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income',
        });
    });

    it('should respond with an array of income with id', async () => {
        // Arrange
        mockModule(income.filter((inc) => inc.id === 1));

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            income.filter((inc) => inc.id === 1),
        );
    });

    it('should handle errors correctly with id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income',
        });
    });

    it('should respond with an array of income with account id', async () => {
        // Arrange
        mockModule(income.filter((inc) => inc.account_id === 1));

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            income.filter((inc) => inc.account_id === 1),
        );
    });

    it('should handle errors correctly with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income for given account_id',
        });
    });

    it('should respond with an array of income with account id and id', async () => {
        // Arrange
        mockModule(
            income.filter((inc) => inc.account_id === 1 && inc.id === 1),
        );

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        // Call the function with the mock request and response
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            income.filter((inc) => inc.account_id === 1 && inc.id === 1),
        );
    });

    it('should handle errors correctly with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.query = { account_id: 1, id: 1 };

        // Act
        await getIncome(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting income',
        });
    });

    it('should respond with a 404 error message when the income does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getIncome } = await import(
            '../../controllers/incomeController.js'
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
        const newIncome = income.filter((inc) => inc.id === 1);

        mockModule(newIncome, undefined, [{ cron_job_id: 1 }], []);

        const { createIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = {
            account_id: income[0].account_id,
            tax_id: income[0].tax_id,
            amount: income[0].income_amount,
            title: income[0].income_title,
            description: income[0].income_description,
            frequency_type: income[0].frequency_type,
            frequency_type_variable: income[0].frequency_type_variable,
            frequency_day_of_month: income[0].frequency_day_of_month,
            frequency_day_of_week: income[0].frequency_day_of_week,
            frequency_week_of_month: income[0].frequency_week_of_month,
            frequency_month_of_year: income[0].frequency_month_of_year,
            begin_date: income[0].income_begin_date,
            end_date: income[0].income_end_date,
        };

        await createIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error creating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = income.filter((inc) => inc.id === 1);

        // Act
        await createIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating income',
        });
    });

    it('should handle errors correctly in return object', async () => {
        // Arrange
        const errorMessage = 'Error creating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createIncomeReturnObject } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = income.filter((inc) => inc.id === 1);

        // Act
        await createIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating income',
        });
    });

    it('should respond with an array of income', async () => {
        // Arrange
        const newIncome = income.filter((inc) => inc.id === 1);

        mockModule(newIncome);

        const { createIncomeReturnObject } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = newIncome;

        // Call the function with the mock request and response
        await createIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newIncome);
    });
});

describe('PUT /api/income/:id', () => {
    it('should call next in the middleware', async () => {
        const updatedIncome = income.filter((inc) => inc.id === 1);

        mockModule(updatedIncome, undefined, '1', []);

        const { updateIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedIncome;

        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.income_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error updating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = income.filter((inc) => inc.id === 1);

        // Act
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating income',
        });
    });

    it('should handle errors correctly in the return object function', async () => {
        // Arrange
        const errorMessage = 'Error updating income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { updateIncomeReturnObject } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = income.filter((inc) => inc.id === 1);

        // Act
        await updateIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating income',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updateIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = accounts.filter(
            (account) => account.account_id === 1,
        );

        // Act
        await updateIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Income not found');
    });

    it('should respond with an array of income', async () => {
        // Arrange
        const newIncome = income.filter((inc) => inc.id === 1);

        mockModule(newIncome);

        const { updateIncomeReturnObject } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.body = newIncome;

        // Call the function with the mock request and response
        await updateIncomeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newIncome);
    });
});

describe('DELETE /api/income/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule(
            [
                {
                    income_id: 1,
                    account_id: 1,
                    cron_job_id: 1,
                    tax_id: 1,
                    tax_rate: 1,
                    income_amount: 1,
                    income_title: 'test',
                    income_description: 'test',
                    date_created: 'test',
                    date_modified: 'test',
                },
            ],
            undefined,
            '1',
            [{ unique_id: 'wo4if43' }],
            [],
        );

        const { deleteIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error deleting income';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteIncome } = await import(
            '../../controllers/incomeController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteIncome(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting income',
        });
    });

    it('should respond with a 404 error message when the account does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deleteIncome } = await import(
            '../../controllers/incomeController.js'
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
        mockModule('Income deleted successfully');

        const { deleteIncomeReturnObject } = await import(
            '../../controllers/incomeController.js'
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
