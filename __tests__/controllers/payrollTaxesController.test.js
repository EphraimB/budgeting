import { jest } from '@jest/globals';
import { payrollTaxes } from '../../models/mockData.js';

let getPayrollTaxes, createPayrollTax, updatePayrollTax, deletePayrollTax, mockRequest, mockResponse;

beforeAll(() => {
    jest.unstable_mockModule('../../getPayrolls.js', () => ({
        getPayrolls: jest.fn(),
    }));
});

describe('GET /api/payroll/taxes', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue(payrollTaxes.filter(payrollTax => payrollTax.employee_id === 1)),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollTaxesModule = await import('../../controllers/payrollTaxesController.js');
        getPayrollTaxes = payrollTaxesModule.getPayrollTaxes;
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
        await getPayrollTaxes(mockRequest, mockResponse);

        const payrollTaxesReturnObj = payrollTaxes.filter(payrollTax => payrollTax.employee_id === id).map(payrollTax => ({
            payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate),
        }));

        // Don't include employee_id in the return object
        const expentedReturnObj = {
            employee_id: id,
            payroll_taxes: payrollTaxesReturnObj,
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
