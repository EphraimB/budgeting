import { jest } from '@jest/globals';
import { payrollTaxes } from '../../models/mockData.js';

let mockRequest
let mockResponse;

jest.unstable_mockModule('../../bree/getPayrolls.js', () => ({
    getPayrolls: jest.fn(),
}));

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

describe('GET /api/payroll/taxes', () => {
    it('should respond with an array of payroll taxes', async () => {
        mockModule(payrollTaxes);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        const payrollTaxesReturnObj = payrollTaxes.map(payrollTax => ({
            payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate),
        }));

        const expentedReturnObj = {
            employee_id: 1,
            payroll_taxes: payrollTaxesReturnObj,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(expentedReturnObj);
    });

    it('should respond with an error message', async () => {
        mockModule(null, 'Error getting payroll taxes');

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes' });
    });

    it('should respond with an array of payroll taxes with id', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === id));

        mockRequest.query = { employee_id: id, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

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

    it('should respond with an error message', async () => {
        const id = 1;

        mockModule(null, 'Error getting payroll taxes');

        mockRequest.query = { employee_id: id, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes' });
    });
});

describe('POST /api/payroll/taxes', () => {
    it('should respond with the new payroll tax', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === id));

        const newPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.15,
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest, mockResponse);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1,
        }];

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newPayrollTaxesReturnObj);
    });

    it('should respond with an error message', async () => {
        mockModule(null, 'Error creating payroll tax');

        const newPayrollTax = {
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.15,
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating payroll tax' });
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
