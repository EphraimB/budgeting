import { jest } from '@jest/globals';
import { employees, payrollDates, payrollTaxes } from '../../models/mockData.js';

jest.unstable_mockModule('../../bree/getPayrolls.js', () => ({
    getPayrolls: jest.fn(),
}));

// Mock request and response
let mockRequest;
let mockResponse;
let consoleSpy;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

// Helper function to generate mock module
const mockModule = (executeQueryValues, errorMessage) => {
    let callCount = 0;
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: jest.fn().mockImplementation(() => {
            if (errorMessage && callCount === executeQueryValues.length) {
                throw new Error(errorMessage);
            }
            const returnValue = executeQueryValues[callCount++];
            return Promise.resolve(returnValue);
        }),
        handleError: jest.fn((res, message) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/payroll/employee', () => {
    it('should respond with an array of employees', async () => {
        // Arrange
        mockModule([employees]);

        mockRequest.query = { employee_id: null };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        // Check that the response is an array of employees
        expect(mockResponse.json).toHaveBeenCalledWith(employees);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting employees';
        const error = new Error(errorMessage);
        mockModule([null, errorMessage]);

        mockRequest.query = { employee_id: null };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting employees' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of employees with id', async () => {
        // Arrange
        mockModule([employees.filter(employee => employee.employee_id === 1)]);

        mockRequest.query = { employee_id: 1 };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(employees.filter(employee => employee.employee_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1 };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting employee' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the employee does not exist', async () => {
        // Arrange
        mockModule([[], null, null]);

        const { getEmployee } = await import('../../controllers/employeesController.js');

        mockRequest.query = { employee_id: 3 };

        // Act
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Employee not found');
    });
});

describe('POST /api/payroll/employee', () => {
    it('should respond with the new employee', async () => {
        // Arrange
        const newEmployee = employees.filter(employee => employee.employee_id === 1);

        mockModule([newEmployee]);

        const { createEmployee } = await import('../../controllers/employeesController.js');

        mockRequest.body = newEmployee;

        await createEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newEmployee);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const newEmployee = employees.filter(employee => employee.employee_id === 1);

        const errorMessage = 'Error creating employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { createEmployee } = await import('../../controllers/employeesController.js');

        mockRequest.body = newEmployee;

        await createEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating employee' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/payroll/employee/:id', () => {
    it('should respond with the updated employee', async () => {
        // Arrange
        const updatedEmployee = employees.filter(employee => employee.employee_id === 1);

        mockModule([updatedEmployee]);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployee } = await import('../../controllers/employeesController.js');

        await updateEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedEmployee);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const updatedEmployee = employees.filter(employee => employee.employee_id === 1);

        const errorMessage = 'Error updating employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployee } = await import('../../controllers/employeesController.js');

        await updateEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating employee' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('DELETE /api/payroll/employee/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        const employee_id = 1;

        // Mock the executeQuery function to return different values based on the query
        mockModule([[], [], [], 'Successfully deleted employee']);

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

        mockRequest.params = { employee_id };

        // Act
        await deleteEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted employee');
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        // Mock the executeQuery function to throw an error
        const errorMessage = 'Error deleting employee';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

        // Act
        await deleteEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting employee' });

        // Check that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should not delete employee if there are related data', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        mockModule([employee_id, payrollDates, payrollTaxes]);

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

        // Act
        await deleteEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
    });
});
