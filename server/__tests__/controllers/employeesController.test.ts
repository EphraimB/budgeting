import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import {
    employees,
    payrollDates,
    payrollTaxes,
} from '../../models/mockData.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

jest.mock('child_process', () => {
    return {
        exec: jest.fn(
            (
                command: string,
                callback: (
                    error: Error | null,
                    stdout: string,
                    stderr: string,
                ) => void,
            ) => {
                callback(null, 'mock stdout', 'mock stderr');
            },
        ),
    };
});

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

/**
 *
 * @param executeQueryValues - An array of values to return from executeQuery
 * @param [errorMessage] - An error message to throw
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValues: any[] | null,
    errorMessage?: string,
) => {
    let callCount: number = 0;
    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery: jest.fn().mockImplementation(async () => {
            if (errorMessage && callCount === 0) {
                throw new Error(errorMessage);
            }
            const returnValue: number[] | undefined =
                executeQueryValues != null
                    ? executeQueryValues[callCount++]
                    : undefined;
            return await Promise.resolve(returnValue);
        }),
        handleError: jest.fn((res: Response, message) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/payroll/employee', () => {
    it('should respond with an array of employees', async () => {
        // Arrange
        mockModule([employees]);

        mockRequest.query = { employee_id: null };

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Call the function with the mock request and response
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        // Check that the response is an array of employees
        expect(mockResponse.json).toHaveBeenCalledWith(employees);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting employees';
        const error = new Error(errorMessage);
        mockModule([], errorMessage);

        mockRequest.query = { employee_id: null };

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Call the function with the mock request and response
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting employees',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of employees with id', async () => {
        // Arrange
        mockModule([
            employees.filter((employee) => employee.employee_id === 1),
        ]);

        mockRequest.query = { employee_id: 1 };

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Call the function with the mock request and response
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            employees.filter((employee) => employee.employee_id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1 };

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Call the function with the mock request and response
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting employee',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        // Arrange
        mockModule([[], null, null]);

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.query = { employee_id: 3 };

        // Act
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Employee not found');
    });
});

describe('POST /api/payroll/employee', () => {
    it('should respond with the new employee', async () => {
        // Arrange
        const newEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        mockModule([newEmployee]);

        const { createEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.body = newEmployee;

        await createEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newEmployee);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const newEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        const errorMessage = 'Error creating employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.body = newEmployee;

        await createEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating employee',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/payroll/employee/:id', () => {
    it('should call next on middleware', async () => {
        // Arrange
        const updatedEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        mockModule([updatedEmployee]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const updatedEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        const errorMessage = 'Error updating employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating employee',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an error message in return object', async () => {
        // Arrange
        const updatedEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        const errorMessage = 'Error updating employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployeeReturnObject } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployeeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating employee',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        // Arrange
        mockModule([[], null, null]);

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.params = { employee_id: 3 };
        mockRequest.body = employees.filter(
            (employee) => employee.employee_id === 3,
        );

        // Act
        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Employee not found');
    });

    it('should respond with a 500 error message when the script fails', async () => {
        // Arrange
        const updatedEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        mockModule([updatedEmployee]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        // Mock the exec function to throw an error
        const errorMessage = 'Error updating employee';
        const error = new Error(errorMessage);
        jest.mock('child_process', () => {
            return {
                exec: jest.fn(
                    (
                        command: string,
                        callback: (
                            error: Error | null,
                            stdout: string,
                            stderr: string,
                        ) => void,
                    ) => {
                        callback(error, 'mock stdout', 'mock stderr');
                    },
                ),
            };
        });

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Act
        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Failed to execute script',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with the updated employee', async () => {
        // Arrange
        const updatedEmployee = employees.filter(
            (employee) => employee.employee_id === 1,
        );

        mockModule([updatedEmployee]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployeeReturnObject } = await import(
            '../../controllers/employeesController.js'
        );

        // Act
        await updateEmployeeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedEmployee);
    });
});

describe('DELETE /api/payroll/employee/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        const employee_id = 1;

        // Mock the executeQuery function to return different values based on the query
        mockModule([[employee_id], [], [], 'Successfully deleted employee']);

        const { deleteEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.params = { employee_id };

        // Act
        await deleteEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted employee',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        // Mock the executeQuery function to throw an error
        const errorMessage = 'Error deleting employee';
        const error = new Error(errorMessage);
        mockModule([], errorMessage);

        const { deleteEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Act
        await deleteEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting employee',
        });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should not delete employee if there are related data', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        mockModule([employee_id, payrollDates, payrollTaxes]);

        const { deleteEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Act
        await deleteEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({
            errors: {
                msg: 'You need to delete employee-related data before deleting the employee',
                param: null,
                location: 'query',
            },
        });
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        // Arrange
        mockModule([[], null, null]);

        const { deleteEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.params = { employee_id: 3 };

        // Act
        await deleteEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Employee not found');
    });

    it('should respond with a 500 error message when the script fails', async () => {
        // Arrange
        const employee_id = 1;

        // Mock the executeQuery function to return different values based on the query
        mockModule([[employee_id], [], [], 'Successfully deleted employee']);

        const { deleteEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.params = { employee_id };

        // Mock the exec function to throw an error
        const errorMessage = 'Error deleting employee';
        const error = new Error(errorMessage);
        jest.mock('child_process', () => {
            return {
                exec: jest.fn(
                    (
                        command: string,
                        callback: (
                            error: Error | null,
                            stdout: string,
                            stderr: string,
                        ) => void,
                    ) => {
                        callback(error, 'mock stdout', 'mock stderr');
                    },
                ),
            };
        });

        // Act
        await deleteEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Failed to execute script',
        });
    });
});
