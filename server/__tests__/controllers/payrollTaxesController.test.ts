import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule.js';

let mockRequest: any;
let mockResponse: any;
let mockNext: any;

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

beforeEach(() => {
    mockRequest = {};
    mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        send: jest.fn(),
    };
    mockNext = jest.fn();
});

afterEach(() => {
    jest.resetModules();
});

const payrollTaxes = [
    {
        id: 1,
        jobId: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        id: 2,
        jobId: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

describe('GET /api/jobs/payroll/taxes', () => {
    it('should respond with an array of payroll taxes', async () => {
        mockModule([payrollTaxes], payrollTaxes);

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxes);
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll taxes',
                });
            },
        );
    });

    it('should response with an array of payroll taxes with job id', async () => {
        mockModule(
            [payrollTaxes.filter((payrollTax) => payrollTax.jobId === 1)],
            payrollTaxes.filter((payrollTax) => payrollTax.jobId === 1),
        );

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxes.filter((payrollTax) => payrollTax.jobId === 1),
        );
    });

    it('should respond with an error message with job id', async () => {
        mockModule([]);

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll taxes for given job id',
                });
            },
        );
    });
});

describe('GET /api/jobs/payroll/taxes/:id', () => {
    it('should respond with an array of payroll taxes with id', async () => {
        mockModule(
            [payrollTaxes.filter((payrollTax) => payrollTax.id === 1)],
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
        );

        const { getPayrollTaxesById } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollTaxesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1)[0],
        );
    });

    it('should respond with an error message with id', async () => {
        mockModule([]);

        const { getPayrollTaxesById } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollTaxesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll tax',
                });
            },
        );
    });

    it('should respond with an array of payroll taxes with job id and id', async () => {
        mockModule(
            [
                payrollTaxes.filter(
                    (payrollTax) =>
                        payrollTax.jobId === 1 && payrollTax.id === 1,
                ),
            ],
            payrollTaxes.filter(
                (payrollTax) => payrollTax.jobId === 1 && payrollTax.id === 1,
            ),
        );

        const { getPayrollTaxesById } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollTaxesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxes.filter(
                (payrollTax) => payrollTax.jobId === 1 && payrollTax.id === 1,
            )[0],
        );
    });

    it('should respond with an error message with job id and id', async () => {
        mockModule([]);

        const { getPayrollTaxesById } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollTaxesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll tax',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrollTaxesById } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { jobId: null };

        // Act
        await getPayrollTaxesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('POST /api/jobs/payroll/taxes', () => {
    it('should return the created payroll tax', async () => {
        mockModule(
            [
                [],
                payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
                [],
                [],
            ],
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
        );

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.id === 1,
        );

        const { createPayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.id === 1,
        );

        const { createPayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTax(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating payroll tax',
                });
            },
        );
    });
});

describe('PUT /api/jobs/payroll/taxes/:id', () => {
    it('should respond with the updated payroll tax', async () => {
        mockModule(
            [
                [{ id: 1 }],
                [],
                payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
                [],
                [],
            ],
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.id === 1,
        );

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxes.filter((payrollTax) => payrollTax.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.id === 1,
        );

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTax(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating payroll tax',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.id === 1,
        );

        // Act
        await updatePayrollTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('DELETE /api/payroll/taxes/:id', () => {
    it('should respond with a successful message', async () => {
        mockModule([[{ id: 1 }], [], [], [], []]);

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 1 };

        await deletePayrollTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted payroll tax',
        );
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };

        await deletePayrollTax(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting payroll tax',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deletePayrollTax(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});
