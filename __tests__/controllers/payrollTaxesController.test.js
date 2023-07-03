import { jest } from '@jest/globals';
import { payrollTaxes } from '../../models/mockData.js';

let mockRequest;
let mockResponse;
let consoleSpy;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
});

jest.unstable_mockModule('../../bree/getPayrolls.js', () => ({
    getPayrolls: jest.fn()
}));

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn()
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
        })
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
            employee_id: parseInt(payrollTax.employee_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate)
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error getting payroll taxes';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: null, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
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
            employee_id: parseInt(payrollTax.employee_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate)
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message with id', async () => {
        const errorMessage = 'Error getting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: null, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should response with an array of payroll taxes with employee_id', async () => {
        const employee_id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id));

        mockRequest.query = { employee_id, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        const payrollTaxesReturnObj = payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id).map(payrollTax => ({
            payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
            employee_id: parseInt(payrollTax.employee_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate)
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message with employee_id', async () => {
        const errorMessage = 'Error getting payroll taxes';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll taxes for given employee_id' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of payroll taxes with employee_id and id', async () => {
        const employee_id = 1;
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id && payrollTax.payroll_taxes_id === id));

        mockRequest.query = { employee_id, id };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        const payrollTaxesReturnObj = payrollTaxes.filter(payrollTax => payrollTax.employee_id === employee_id && payrollTax.payroll_taxes_id === id).map(payrollTax => ({
            payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
            employee_id: parseInt(payrollTax.employee_id),
            name: payrollTax.name,
            rate: parseFloat(payrollTax.rate)
        }));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesReturnObj);
    });

    it('should respond with an error message with employee_id and id', async () => {
        const errorMessage = 'Error getting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.query = { employee_id: 1, id: 1 };

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error getting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollTaxes } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.query = { id: 3 };

        // Act
        await getPayrollTaxes(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('POST /api/payroll/taxes', () => {
    it('should respond with the new payroll tax', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === id));

        const newPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.15
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest, mockResponse);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: 1,
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1
        }];

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(newPayrollTaxesReturnObj);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const newPayrollTax = {
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.15
        };

        mockRequest.body = newPayrollTax;

        const { createPayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await createPayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error creating payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });
});

describe('PUT /api/payroll/taxes/:id', () => {
    it('should respond with the updated payroll tax', async () => {
        const id = 1;

        mockModule(payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === id));

        const updatedPayrollTax = {
            employee_id: id,
            name: 'Federal Income Tax',
            rate: 0.1
        };

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollTax;

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await updatePayrollTax(mockRequest, mockResponse);

        const newPayrollTaxesReturnObj = [{
            payroll_taxes_id: id,
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1
        }];

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(newPayrollTaxesReturnObj);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error updating payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        const updatedPayrollTax = {
            employee_id: 1,
            name: 'Federal Income Tax',
            rate: 0.1
        };

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedPayrollTax;

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await updatePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error updating payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { updatePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollTaxes.filter(payrollTax => payrollTax.payroll_taxes_id === 1);

        // Act
        await updatePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('DELETE /api/payroll/taxes/:id', () => {
    it('should respond with a success message', async () => {
        mockModule('Successfully deleted payroll tax');

        mockRequest.params = { id: 1 };
        mockRequest.query = { employee_id: 1 };

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await deletePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith('Successfully deleted payroll tax');
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error deleting payroll tax';
        const error = new Error(errorMessage);
        mockModule(null, errorMessage);

        mockRequest.params = { id: 3 };

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        await deletePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error deleting payroll tax' });

        // Assert that the error was logged
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([]);

        const { deletePayrollTax } = await import('../../controllers/payrollTaxesController.js');

        mockRequest.params = { id: 3 };
        mockRequest.query = { employee_id: 1 };

        // Act
        await deletePayrollTax(mockRequest, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});
