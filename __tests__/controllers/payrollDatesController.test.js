import { jest } from '@jest/globals';
import { payrollDates } from '../../models/mockData.js';

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

describe('GET /api/payroll/dates', () => {
    it('should respond with an array of payroll dates', async () => {
        // Arrange
        mockModule(payrollDates);

        mockRequest.params = { id: null };
        mockRequest.query = { employee_id: 1 };

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
        mockModule(null, 'Error getting payroll dates');

        mockRequest.params = { id: null };
        mockRequest.query = { employee_id: 1 };

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error getting payroll dates" });
    });

    it('should respond with an array of payroll dates with id', async () => {
        // Arrange
        const id = 1;

        mockModule(payrollDates.filter(payrollDate => payrollDate.employee_id === id));

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        mockRequest.query = { employee_id: id };

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

        mockModule(null, 'Error getting payroll dates');

        const { getPayrollDates } = await import('../../controllers/payrollDatesController.js');

        mockRequest.query = { employee_id: id };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ "message": "Error getting payroll dates" });
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
        mockModule(null, 'Error creating payroll date');

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
    });
});

describe('PUT /api/payroll/dates/:id', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue([{
                payroll_date_id: 3,
                employee_id: 1,
                payroll_start_day: 1,
                payroll_end_day: 15,
            }]),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollDatesModule = await import('../../controllers/payrollDatesController.js');
        updatePayrollDate = payrollDatesModule.updatePayrollDate;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with the updated payroll date', async () => {
        const id = 1;

        const updatedPayrollDate = {
            employee_id: id,
            start_day: 1,
            end_day: 15,
        };
        mockRequest = { params: { id: 1 }, body: updatedPayrollDate };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),  // Mock send method
        };

        await updatePayrollDate(mockRequest, mockResponse);

        const newPayrollDatesReturnObj = [{
            payroll_date_id: 3,
            payroll_start_day: 1,
            payroll_end_day: 15,
        }];

        // Include employee_id in the return object
        const expectedReturnObj = {
            employee_id: id,
            payroll_date: newPayrollDatesReturnObj, // Adjust the key name here
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedReturnObj);
    });
});

describe('DELETE /api/payroll/dates/:id', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue([{
                payroll_date_id: 3,
                employee_id: 1,
                payroll_start_day: 1,
                payroll_end_day: 15,
            }]),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollDatesModule = await import('../../controllers/payrollDatesController.js');
        deletePayrollDate = payrollDatesModule.deletePayrollDate;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 }, query: { employee_id: 1 } };

        await deletePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted payroll date');
    });
});
