import { type Request } from 'express';
import { type PayrollTax } from '../../types/types.js';
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

jest.mock('../../config/winston', () => ({
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
        employee_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        payroll_taxes_id: 2,
        employee_id: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

const payrollTaxesResponse: PayrollTax[] = [
    {
        id: 1,
        employee_id: 1,
        name: 'Federal Income Tax',
        rate: 0.1,
    },
    {
        id: 2,
        employee_id: 1,
        name: 'State Income Tax',
        rate: 0.05,
    },
];

describe('GET /api/payroll/taxes', () => {
    it('should respond with an array of payroll taxes', async () => {
        mockModule([payrollTaxes]);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollTaxesResponse);
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error getting payroll taxes';
        mockModule([], [errorMessage]);

        mockRequest.query = { employee_id: null, id: null };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll taxes',
        });
    });

    it('should respond with an array of payroll taxes with id', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.query = { employee_id: id, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
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
        const errorMessage = 'Error getting payroll tax';
        mockModule([], [errorMessage]);

        mockRequest.query = { employee_id: null, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll tax',
        });
    });

    it('should response with an array of payroll taxes with employee_id', async () => {
        const employee_id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.employee_id === employee_id,
            ),
        ]);

        mockRequest.query = { employee_id, id: null };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter(
                (payrollTax) => payrollTax.employee_id === employee_id,
            ),
        );
    });

    it('should respond with an error message with employee_id', async () => {
        const errorMessage = 'Error getting payroll taxes';
        mockModule([], [errorMessage]);

        mockRequest.query = { employee_id: 1, id: null };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll taxes for given employee_id',
        });
    });

    it('should respond with an array of payroll taxes with employee_id and id', async () => {
        const employee_id = 1;
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) =>
                    payrollTax.employee_id === employee_id &&
                    payrollTax.payroll_taxes_id === id,
            ),
        ]);

        mockRequest.query = { employee_id, id };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollTaxesResponse.filter(
                (payrollTax) =>
                    payrollTax.employee_id === employee_id &&
                    payrollTax.id === id,
            ),
        );
    });

    it('should respond with an error message with employee_id and id', async () => {
        const errorMessage = 'Error getting payroll tax';
        mockModule([], [errorMessage]);

        mockRequest.query = { employee_id: 1, id: 1 };

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll tax',
        });
    });

    it('should respond with a 404 error message when the payroll tax does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrollTaxes } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getPayrollTaxes(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
    });
});

describe('POST /api/payroll/taxes', () => {
    it('should populate payroll_tax_id', async () => {
        const id = 1;

        mockModule([
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
            [],
        ]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { createPayrollTax } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        await createPayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.payroll_taxes_id).toBe(id);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating payroll tax';
        mockModule([], [errorMessage]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { createPayrollTax } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        await createPayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating payroll tax',
        });
    });

    it('should respond with an error message with return object', async () => {
        const errorMessage = 'Error creating payroll tax';
        mockModule([], [errorMessage]);

        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === 1,
        );

        const { createPayrollTaxReturnObject } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        await createPayrollTaxReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll tax',
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
            '../../controllers/payrollTaxesController.js'
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
            '../../controllers/payrollTaxesController.js'
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

describe('PUT /api/payroll/taxes/:id', () => {
    it('should call next on the middleware', async () => {
        const id = 1;

        mockModule(
            payrollTaxes.filter(
                (payrollTax) => payrollTax.payroll_taxes_id === id,
            ),
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollTaxes.filter(
            (payrollTax) => payrollTax.payroll_taxes_id === id,
        );

        const { updatePayrollTax } = await import(
            '../../controllers/payrollTaxesController.js'
        );

        await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });
});

//     it('should respond with an error message', async () => {
//         const errorMessage = 'Error updating payroll tax';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const updatedPayrollTax = {
//             employee_id: 1,
//             name: 'Federal Income Tax',
//             rate: 0.1,
//         };

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollTax;

//         const { updatePayrollTax } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating payroll tax',
//         });
//     });

//     it('should respond with a 404 error message when the payroll tax does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updatePayrollTax } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         mockRequest.params = { id: 3 };
//         mockRequest.body = payrollTaxes.filter(
//             (payrollTax) => payrollTax.id === 1,
//         );

//         // Act
//         await updatePayrollTax(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
//     });

//     it('should respond with the updated payroll tax', async () => {
//         const id = 1;

//         mockModule(payrollTaxes.filter((payrollTax) => payrollTax.id === id));

//         const updatedPayrollTax = {
//             employee_id: id,
//             name: 'Federal Income Tax',
//             rate: 0.1,
//         };

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollTax;

//         const { updatePayrollTaxReturnObject } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await updatePayrollTaxReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         const newPayrollTaxesReturnObj = [
//             {
//                 payroll_taxes_id: id,
//                 employee_id: 1,
//                 name: 'Federal Income Tax',
//                 rate: 0.1,
//             },
//         ];

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(
//             newPayrollTaxesReturnObj,
//         );
//     });

//     it('should return a 404 error if the payroll tax does not exist in the return object', async () => {
//         mockModule([]);

//         const updatedPayrollTax = {
//             employee_id: 1,
//             name: 'Federal Income Tax',
//             rate: 0.1,
//         };

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollTax;

//         const { updatePayrollTaxReturnObject } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await updatePayrollTaxReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
//     });

//     it('should respond with an error message with return object', async () => {
//         const errorMessage = 'Error updating payroll tax';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const updatedPayrollTax = {
//             employee_id: 1,
//             name: 'Federal Income Tax',
//             rate: 0.1,
//         };

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollTax;

//         const { updatePayrollTaxReturnObject } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await updatePayrollTaxReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting payroll tax',
//         });
//     });
// });

// describe('DELETE /api/payroll/taxes/:id', () => {
//     it('should call next on the middleware', async () => {
//         mockModule('Successfully deleted payroll tax');

//         jest.mock('child_process', () => {
//             return {
//                 exec: jest.fn(
//                     (
//                         command: string,
//                         callback: (
//                             error: Error | null,
//                             stdout: string,
//                             stderr: string,
//                         ) => void,
//                     ) => {
//                         callback(null, 'mock stdout', 'mock stderr');
//                     },
//                 ),
//             };
//         });

//         mockRequest.params = { id: 1 };
//         mockRequest.query = { employee_id: 1 };

//         const { deletePayrollTax } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         const errorMessage = 'Error deleting payroll tax';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         mockRequest.params = { id: 3 };

//         const { deletePayrollTax } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting payroll tax',
//         });
//     });

//     it('should respond with a 404 error message when the payroll tax does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deletePayrollTax } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         mockRequest.params = { id: 3 };
//         mockRequest.query = { employee_id: 1 };

//         // Act
//         await deletePayrollTax(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Payroll tax not found');
//     });

//     it('should respond with a success message', async () => {
//         mockModule('Successfully deleted payroll tax');

//         mockRequest.params = { id: 1 };
//         mockRequest.query = { employee_id: 1 };

//         const { deletePayrollTaxReturnObject } = await import(
//             '../../controllers/payrollTaxesController.js'
//         );

//         await deletePayrollTaxReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted payroll tax',
//         );
//     });
// });
