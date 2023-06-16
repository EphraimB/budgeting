import { jest } from '@jest/globals';
import { employees } from '../../models/mockData.js';

jest.unstable_mockModule('../../bree/getPayrolls.js', () => ({
    getPayrolls: jest.fn(),
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
const mockModule = (executeQueryResponses, errorMessage) => {
    let callCount = 0;

    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: jest.fn().mockImplementation(() => {
            if (errorMessage) {
                throw new Error(errorMessage);
            }

            return Promise.resolve(executeQueryResponses[callCount++]);
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

        mockRequest.query = { id: null };

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
        mockModule(null, 'Error getting employees');

        mockRequest.query = { id: null };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting employee' });
    });

    it('should respond with an array of employees with id', async () => {
        // Arrange
        mockModule([employees.filter(employee => employee.employee_id === 1)]);

        mockRequest.query = { id: 1 };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(employees.filter(employee => employee.employee_id === 1));
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule(null, 'Error getting employee');

        mockRequest.query = { id: 1 };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting employee' });
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

        mockModule(null, 'Error creating employee');

        const { createEmployee } = await import('../../controllers/employeesController.js');

        mockRequest.body = newEmployee;

        await createEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating employee' });
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

        mockModule(null, 'Error updating employee');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedEmployee;

        const { updateEmployee } = await import('../../controllers/employeesController.js');

        await updateEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating employee' });
    });
});

describe('DELETE /api/payroll/employee/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        // Mock the executeQuery function to return different values based on the query
        mockModule([[], [], 'Successfully deleted employee']);

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

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
        mockModule(null, 'Error deleting employee');

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

        // Act
        await deleteEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting employee' });
    });

    it('should not delete employee if there are related data', async () => {
        // Arrange
        const employee_id = 1;
        mockRequest.params = { employee_id };

        mockModule([[], [{ employee_id }]]);

        const { deleteEmployee } = await import('../../controllers/employeesController.js');

        // Act
        await deleteEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
    });
});
