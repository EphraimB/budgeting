import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { payrollDates, payrollTaxes } from '../../models/mockData.js';

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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
 * @param executeQueryResponses - Array of responses for executeQuery
 * @param handleErrorResponses - Array of responses for handleError
 * @param scheduleQueryResponses - Array of responses for scheduleQuery
 * @param unscheduleQueryResponses - Array of responses for unscheduleQuery
 * Mock module with mock implementations for executeQuery, handleError, scheduleQuery, and unscheduleQuery
 */
const mockModule = (
    executeQueryResponses: any = [], // Array of responses for executeQuery
    handleErrorResponses: any = [], // Array of responses for handleError
    scheduleQueryResponses: any = [], // Array of responses for scheduleQuery
    unscheduleQueryResponses: any = [], // Array of responses for unscheduleQuery
) => {
    const executeQuery = jest.fn();
    const handleError = jest.fn();
    const scheduleQuery = jest.fn();
    const unscheduleQuery = jest.fn();

    // Set up mock implementations for executeQuery
    executeQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            executeQuery.mockImplementationOnce(() => Promise.reject(response));
        } else {
            executeQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for handleError
    handleErrorResponses.forEach((response: any) => {
        handleError.mockImplementationOnce((res: any, message: any) => {
            res.status(response.status || 400).json({
                message: response.message || message,
            });
        });
    });

    // Set up mock implementations for scheduleQuery
    scheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for unscheduleQuery
    unscheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError,
        scheduleQuery,
        unscheduleQuery,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));
};

describe('GET /api/payroll/employee', () => {
    it('should respond with an array of employees', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        const employeeResponse = [
            {
                id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

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
        expect(mockResponse.json).toHaveBeenCalledWith(employeeResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting employees';
        mockModule([], [errorMessage]);

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
    });

    it('should respond with an array of employees with id', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        const employeeResponse = [
            {
                id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        mockModule([employees]);

        mockRequest.query = { employee_id: 1 };

        const { getEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        // Call the function with the mock request and response
        await getEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(employeeResponse);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting employee';
        mockModule([], [errorMessage]);

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
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        // Arrange
        mockModule([[]]);

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
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        const employeeResponse = [
            {
                id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        mockModule([employees]);

        const { createEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.body = employees;

        await createEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(employeeResponse);
    });

    it('should respond with an error message', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        const errorMessage = 'Error creating employee';
        mockModule([], [errorMessage]);

        const { createEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.body = employees;

        await createEmployee(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating employee',
        });
    });
});

describe('PUT /api/payroll/employee/:id', () => {
    it('should call next on middleware', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        mockModule([employees]);

        mockRequest.params = { id: 1 };
        mockRequest.body = employees;

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        const errorMessage = 'Error updating employee';
        mockModule([], [errorMessage]);

        mockRequest.params = { id: 1 };
        mockRequest.body = employees;

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating employee',
        });
    });

    it('should respond with an error message in return object', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        const errorMessage = 'Error updating employee';
        mockModule([], [errorMessage]);

        mockRequest.params = { id: 1 };
        mockRequest.body = employees;

        const { updateEmployeeReturnObject } = await import(
            '../../controllers/employeesController.js'
        );

        await updateEmployeeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating employee',
        });
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        mockModule([[]]);

        const { updateEmployee } = await import(
            '../../controllers/employeesController.js'
        );

        mockRequest.params = { employee_id: 3 };
        mockRequest.body = employees;

        // Act
        await updateEmployee(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Employee not found');
    });

    it('should respond with the updated employee', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        const employeeResponse = [
            {
                id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        mockModule([employees]);

        mockRequest.params = { id: 1 };
        mockRequest.body = employees;

        const { updateEmployeeReturnObject } = await import(
            '../../controllers/employeesController.js'
        );

        // Act
        await updateEmployeeReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(employeeResponse);
    });
});

describe('DELETE /api/payroll/employee/:id', () => {
    it('should respond with a success message', async () => {
        const employees = [
            {
                employee_id: 1,
                name: 'Test Employee',
                hourly_rate: 10,
                regular_hours: 40,
                vacation_days: 10,
                sick_days: 10,
                work_schedule: '0111100',
            },
        ];

        // Arrange
        const employee_id = 1;

        // Mock the executeQuery function to return different values based on the query
        mockModule([
            employees,
            [],
            [],
            [],
            [],
            'Successfully deleted employee',
        ]);

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
        mockModule([], [errorMessage]);

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
    });

    it('should not delete employee if there are related data', async () => {
        const payrollDates = [
            {
                id: 1,
                employee_id: 1,
                payroll_start_day: 1,
                payroll_end_day: 15,
            },
            {
                id: 2,
                employee_id: 1,
                payroll_start_day: 15,
                payroll_end_day: 31,
            },
        ];

        const payrollTaxes = [
            {
                id: 1,
                employee_id: 1,
                name: 'Federal Income Tax',
                rate: 0.1,
            },
            {
                id: 2,
                employee_id: 1,
                name: 'State Income Tax',
                rate: 0.05,
            },
        ];

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
        mockModule([[]]);

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
});

//     it('should respond with a 500 error message when the script fails', async () => {
//         // Arrange
//         const employee_id = 1;

//         // Mock the executeQuery function to return different values based on the query
//         mockModule([[employee_id], [], [], 'Successfully deleted employee']);

//         const { deleteEmployee } = await import(
//             '../../controllers/employeesController.js'
//         );

//         mockRequest.params = { employee_id };

//         // Mock the exec function to throw an error
//         const errorMessage = 'Error deleting employee';
//         const error = new Error(errorMessage);
//         jest.mock('child_process', () => {
//             return {
//                 exec: jest.fn(
//                     (
//                         command: string,
//                         callback: (
//                             error: Error | null,
//                             stdout: string,
//                             stderr: string,
//                         ) => void,
//                     ) => {
//                         callback(error, 'mock stdout', 'mock stderr');
//                     },
//                 ),
//             };
//         });

//         // Act
//         await deleteEmployee(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(500);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             status: 'error',
//             message: 'Failed to execute script',
//         });
//     });
// });
