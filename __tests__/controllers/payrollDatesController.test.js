import { jest } from '@jest/globals';
import { payrollDates } from '../../models/mockData.js';

let getPayrollDates, createPayrollDate, updatePayrollDate, deletePayrollDate, mockRequest, mockResponse;

beforeAll(() => {
    jest.unstable_mockModule('../../getPayrolls.js', () => ({
        getPayrolls: jest.fn(),
    }));
});

describe('GET /api/payroll/dates', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(payrollDates.filter(payrollDate => payrollDate.employee_id === 1)),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollDatesModule = await import('../../controllers/payrollDatesController.js');
        getPayrollDates = payrollDatesModule.getPayrollDates;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with an array of payroll dates', async () => {
        const id = 1;

        mockRequest = {
            query: {
                employee_id: id
            }
        }; // Set the mockRequest.query

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),  // Mock send method
        }; // Set the mockResponse

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
});

describe('POST /api/payroll/dates', () => {
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
        createPayrollDate = payrollDatesModule.createPayrollDate;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with the new payroll date', async () => {
        const id = 1;

        const newPayrollDate = {
            employee_id: id,
            start_day: 1,
            end_day: 15,
        };

        mockRequest = { body: newPayrollDate };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),  // Mock send method
        };

        await createPayrollDate(mockRequest, mockResponse);

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
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(expectedReturnObj);
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
    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 } };

        await deletePayrollDate(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted payroll date');
    });
});
