import { jest } from '@jest/globals';
import { payrollDates } from '../../models/mockData.js';

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

describe('GET /api/payroll/dates', () => {
    it('should respond with an array of payroll dates', async () => {
        // Arrange
        mockModule(payrollDates);

        mockRequest.query = { id: null, employee_id: 1 };

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        const payrollDatesReturnObj = payrollDates.map(payrollDate => ({
            payroll_date_id: parseInt(payrollDate.payroll_date_id),
            payroll_start_day: parseInt(payrollDate.payroll_start_day),
            payroll_end_day: parseInt(payrollDate.payroll_end_day),
        }));

        const expectedReturnObj = {
            employee_id: 1,
            payroll_dates: payrollDatesReturnObj,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedReturnObj);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting payroll dates';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { id: null, employee_id: 1 };

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error getting payroll dates" });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll dates with id', async () => {
        // Arrange
        const id = 1;

        mockModule(payrollDates.filter(payrollDate => payrollDate.employee_id === id));

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        mockRequest.query = { id: 1, employee_id: id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        const payrollDatesReturnObj = payrollDates.filter(payrollDate => payrollDate.employee_id === id).map(payrollDate => ({
            payroll_date_id: parseInt(payrollDate.payroll_date_id),
            payroll_start_day: parseInt(payrollDate.payroll_start_day),
            payroll_end_day: parseInt(payrollDate.payroll_end_day),
        }));

        // Don't include employee_id in the return object
        const expentedReturnObj = {
            employee_id: id,
            payroll_dates: payrollDatesReturnObj,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expentedReturnObj);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const id = 1;

        const errorMessage = 'Error getting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        mockRequest.query = { id: 1, employee_id: id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error getting payroll date" });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        mockRequest.query = { employee_id: 3 };

        // Act
        await getPayrollDates(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll date not found');
    });
});

describe('POST /api/payroll/dates', () => {
    it('should respond with the new payroll date', async () => {
        // Arrange
        mockModule(payrollDates.filter(payrollDate => payrollDate.payroll_date_id === 1));

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest, mockResponse);

        const newPayrollDatesReturnObj = {
            payroll_date_id: 1,
            payroll_start_day: 1,
            payroll_end_day: 15,
        };

        const expectedReturnObj = {
            employee_id: 1,
            payroll_date: [newPayrollDatesReturnObj],
        };

        // Assert
        // expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedReturnObj);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const newPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { createPayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.body = newPayrollDate;

        await createPayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error creating payroll date" });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/payroll/dates/:id', () => {
    it('should respond with the updated payroll date', async () => {
        // Arrange
        mockModule(payrollDates.filter(payrollDate => payrollDate.payroll_date_id === 1));

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDate(mockRequest, mockResponse);

        const newPayrollDatesReturnObj = [{
            payroll_date_id: 1,
            payroll_start_day: 1,
            payroll_end_day: 15,
        }];

        // Include employee_id in the return object
        const expectedReturnObj = {
            employee_id: 1,
            payroll_date: newPayrollDatesReturnObj, // Adjust the key name here
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedReturnObj);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const updatedPayrollDate = {
            employee_id: 1,
            start_day: 1,
            end_day: 15,
        };

        const { updatePayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollDate;

        await updatePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error updating payroll date" });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updatePayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollDates.filter(payrollDate => payrollDate.payroll_date_id === 1);

        // Act
        await updatePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll date not found');
    });
});

describe('DELETE /api/payroll/dates/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule('Successfully deleted payroll date');

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollDate } = await import('../../controllers/payrollDatesController.js');

        await deletePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted payroll date');
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting payroll date';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollDate } = await import('../../controllers/payrollDatesController.js');

        await deletePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error deleting payroll date" });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deletePayrollDate } = await import('../../controllers/payrollDatesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.query = { employee_id: 1 };

        // Act
        await deletePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll date not found');
    });
});
