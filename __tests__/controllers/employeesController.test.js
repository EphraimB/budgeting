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
const mockModule = (executeQueryValue, errorMessage) => {
    jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
        executeQuery: errorMessage
            ? jest.fn().mockRejectedValue(new Error(errorMessage))
            : jest.fn().mockResolvedValue(executeQueryValue),
        handleError: jest.fn((res, message) => {
            res.status(400).json({ message });
        }),
    }));
};

describe('GET /api/payroll/employee', () => {
    it('should respond with an array of employees', async () => {
        // Arrange
        mockModule(employees.filter(employee => employee.employee_id === 1));

        mockRequest.query = { id: 1 };

        const { getEmployee } = await import('../../controllers/employeesController.js');

        // Call the function with the mock request and response
        await getEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(employees.filter(employee => employee.employee_id === 1));
    });

    it('should respond with an error message', async () => {
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
        const newEmployee = employees.filter(employee => employee.employee_id === 1);
        mockRequest = { body: newEmployee };

        await createEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newEmployee);
    });
});

describe('PUT /api/payroll/employee/:id', () => {
    it('should respond with the updated employee', async () => {
        const updatedEmployee = employees.filter(employee => employee.employee_id === 1);
        mockRequest = { params: { id: 1 }, body: updatedEmployee };

        await updateEmployee(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(updatedEmployee);
    });
});

describe('DELETE /api/payroll/employee/:id', () => {
    // it('should delete the employee if there are no related data', async () => {
    //     // executeQuery.mockResolvedValueOnce([]); // Mock getPayrollDates query
    //     // executeQuery.mockResolvedValueOnce([]); // Mock getPayrollTaxes query

    //     mockRequest = { params: { employee_id: 1 } };

    //     await deleteEmployee(mockRequest, mockResponse);

    //     // expect(executeQuery).toHaveBeenCalledTimes(3);
    //     // expect(getPayrolls).toHaveBeenCalledWith(1);
    //     expect(mockResponse.status).toHaveBeenCalledWith(200);
    //     expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted employee');
    // });

    it('should return an error if there are related data', async () => {
        mockRequest = { params: { employee_id: 1 } };

        await deleteEmployee(mockRequest, mockResponse);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({
            errors: {
                msg: 'You need to delete employee-related data before deleting the employee',
                param: null,
                location: 'query',
            },
        });
    });
});
