import { type Request } from 'express';
import { type PayrollTax } from '../../src/types/types.js';
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
        payroll_taxes_id: 1,
        job_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        payroll_taxes_id: 2,
        job_id: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

const payrollTaxesResponse: PayrollTax[] = [
    {
        id: 1,
        job_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        id: 2,
        job_id: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

describe('GET /api/jobs/payroll/taxes', () => {
    it('should respond with an array of payroll taxes', async () => {
        mockModule([payrollTaxes]);

        mockRequest.query = { job_id: 1, id: null };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesResponse);
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.query = { job_id: null, id: null };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

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

    it('should respond with an array of payroll taxes with id', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.query = { job_id: id, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter((payrollTax) => payrollTax.id === id),
        );
    });

    it('should respond with an error message with id', async () => {
        mockModule([]);

        mockRequest.query = { job_id: null, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll tax',
                });
            },
        );
    });

    it('should response with an array of payroll taxes with job_id', async () => {
        const job_id = 1;

        mockModule([
            payrollTaxes.filter((payrollTax) => payrollTax.job_id === job_id),
        ]);

        mockRequest.query = { job_id, id: null };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter(
                (payrollTax) => payrollTax.job_id === job_id,
            ),
        );
    });

    it('should respond with an error message with job_id', async () => {
        mockModule([]);

        mockRequest.query = { job_id: 1, id: null };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll taxes for given job_id',
                });
            },
        );
    });

    it('should respond with an array of payroll taxes with job_id and id', async () => {
        const job_id = 1;
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) =>
                    payrollTax.job_id === job_id &&
                    payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.query = { job_id, id };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter(
                (payrollTax) =>
                    payrollTax.job_id === job_id && payrollTax.id === id,
            ),
        );
    });

    it('should respond with an error message with job_id and id', async () => {
        mockModule([]);

        mockRequest.query = { job_id: 1, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse).catch(
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

        const { getPayrollTaxes } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('POST /api/jobs/payroll/taxes', () => {
    it('should populate payroll_tax_id', async () => {
        const id = 1;

        mockModule([
            [],
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
            [],
            [],
        ]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { createPayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.payroll_taxes_id).toBe(id);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { createPayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTax(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating payroll tax',
            });
        });
    });

    it('should respond with an error message with return object', async () => {
        mockModule([]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { createPayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting payroll tax',
            });
        });
    });

    it('should respond with the created payroll tax', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { createPayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await createPayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter((payrollTax) => payrollTax.id === id),
        );
    });

    it('should return a 404 error if the payroll tax does not exist', async () => {
        mockModule([[]]);

        const { createPayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        await createPayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('PUT /api/jobs/payroll/taxes/:id', () => {
    it('should call next on the middleware', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
            [],
            [],
        ]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTax(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating payroll tax',
            });
        });
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updatePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        // Act
        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });

    it('should respond with the updated payroll tax', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { updatePayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter((payrollTax) => payrollTax.id === id),
        );
    });

    it('should return a 404 error if the payroll tax does not exist in the return object', async () => {
        mockModule([[]]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { updatePayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });

    it('should respond with an error message with return object', async () => {
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { updatePayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await updatePayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting payroll tax',
            });
        });
    });
});

describe('DELETE /api/payroll/taxes/:id', () => {
    it('should call next on the middleware', async () => {
        mockModule(['Successfully deleted payroll tax']);

        mockRequest.params = { id: 1 };
        mockRequest.query = { job_id: 1 };

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        mockRequest.params = { id: 3 };

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await deletePayrollTax(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting payroll tax',
            });
        });
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deletePayrollTax } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { job_id: 1 };

        // Act
        await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });

    it('should respond with a success message', async () => {
        mockModule(['Successfully deleted payroll tax']);

        mockRequest.params = { id: 1 };
        mockRequest.query = { job_id: 1 };

        const { deletePayrollTaxReturnObject } = await import(
            '../../src/controllers/payrollTaxesController.js'
        );

        await deletePayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted payroll tax',
        );
    });
});
