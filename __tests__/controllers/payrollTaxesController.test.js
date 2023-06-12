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

    it('should respond with an array of payroll taxes', async () => {
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

describe('POST /api/payroll/taxes', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue([{
                payroll_taxes_id: 3,
                employee_id: 1,
                name: 'Federal Income Tax',
                rate: 0.15,
            }]),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollTaxesModule = await import('../../controllers/payrollTaxesController.js');
        createPayrollTax = payrollTaxesModule.createPayrollTax;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with the new payroll tax', async () => {
        const id = 1;

        const newPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.15,
        };

        mockRequest = { body: newPayrollTax };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),  // Mock send method
        };

        await createPayrollTax(mockRequest, mockResponse);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: 3,
            name: 'Federal Income Tax',
            rate: 0.15,
        }];

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newPayrollTaxesReturnObj);
    });
});

describe('PUT /api/payroll/taxes/:id', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue([{
                payroll_taxes_id: 3,
                employee_id: 1,
                name: 'Federal Income Tax',
                rate: 0.15,
            }]),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollTaxesModule = await import('../../controllers/payrollTaxesController.js');
        updatePayrollTax = payrollTaxesModule.updatePayrollTax;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with the updated payroll tax', async () => {
        const id = 1;

        const updatedPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.15,
        };
        mockRequest = { params: { id: 1 }, body: updatedPayrollTax };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn(),  // Mock send method
        };

        await updatePayrollTax(mockRequest, mockResponse);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: 3,
            name: 'Federal Income Tax',
            rate: 0.15,
        }];

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newPayrollTaxesReturnObj);
    });
});

describe('DELETE /api/payroll/taxes/:id', () => {
    beforeAll(async () => {
        jest.unstable_mockModule('../../utils/helperFunctions.js', () => ({
            executeQuery: jest.fn().mockResolvedValue([{
                payroll_taxes_id: 3,
                employee_id: 1,
                name: 'Federal Income Tax',
                rate: 0.15,
            }]),
            handleError: jest.fn().mockReturnValue({ message: 'Error' }),
        }));

        const payrollDatesModule = await import('../../controllers/payrollTaxesController.js');
        deletePayrollTax = payrollDatesModule.deletePayrollTax;
    });

    afterAll(() => {
        jest.resetModules();
    });

    it('should respond with a success message', async () => {
        mockRequest = { params: { id: 1 }, query: { employee_id: 1 } };

        await deletePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted payroll tax');
    });
});
