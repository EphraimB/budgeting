import { type Request } from 'express';
import { type PayrollDate } from '../../types/types.js';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule.js';

// Mock request and response
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

const payrollDates = [
    {
        payroll_date_id: 1,
        employee_id: 1,
        payroll_start_day: 1,
        payroll_end_day: 15,
    },
    {
        payroll_date_id: 2,
        employee_id: 1,
        payroll_start_day: 15,
        payroll_end_day: 31,
    },
];

const payrollDatesResponse: PayrollDate[] = [
    {
        id: 1,
        employee_id: 1,
        payroll_start_day: 1,
        payroll_end_day: 15,
    },
    {
        id: 2,
        employee_id: 1,
        payroll_start_day: 15,
        payroll_end_day: 31,
    },
];

describe('GET /api/payroll/dates', () => {
    it('should respond with an array of payroll dates', async () => {
        // Arrange
        mockModule([payrollDates]);

        mockRequest.query = { id: null, employee_id: null };

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting payroll dates';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: null, employee_id: null };

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll dates',
        });
    });

    it('should respond with an array of payroll dates with id', async () => {
        // Arrange
        mockModule([
            payrollDates.filter((payrollDate) => payrollDate.employee_id === 1),
        ]);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: 1, employee_id: null };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDatesResponse.filter(
                (payrollDate) => payrollDate.employee_id === 1,
            ),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting payroll date';
        mockModule([], [errorMessage]);

        const { getPayrollDates } = await import(
            '../../controllers/payrollDatesController.js'
        );

        mockRequest.query = { id: 1, employee_id: null };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting payroll date',
        });
    });
});

//     it('should respond with an array of payroll dates with employee_id', async () => {
//         // Arrange
//         const employee_id = 1;

//         mockModule(
//             payrollDates.filter(
//                 (payrollDate) => payrollDate.employee_id === employee_id,
//             ),
//         );

//         const { getPayrollDates } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.query = { id: null, employee_id };

//         // Call the function with the mock request and response
//         await getPayrollDates(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
//     });

//     it('should respond with an error message with employee_id', async () => {
//         // Arrange
//         const employee_id = 1;

//         const errorMessage = 'Error getting payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { getPayrollDates } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.query = { id: null, employee_id };

//         // Call the function with the mock request and response
//         await getPayrollDates(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting payroll dates for given employee_id',
//         });
//     });

//     it('should respond with an array of payroll dates with id and employee_id', async () => {
//         // Arrange
//         const id = 1;
//         const employee_id = 1;

//         mockModule(
//             payrollDates.filter(
//                 (payrollDate) => payrollDate.employee_id === employee_id,
//             ),
//         );

//         const { getPayrollDates } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.query = { id, employee_id };

//         // Call the function with the mock request and response
//         await getPayrollDates(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(payrollDatesReturnObj);
//     });

//     it('should respond with an error message with id and employee_id', async () => {
//         // Arrange
//         const id = 1;
//         const employee_id = 1;

//         const errorMessage = 'Error getting payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { getPayrollDates } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.query = { id, employee_id };

//         // Call the function with the mock request and response
//         await getPayrollDates(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting payroll date',
//         });
//     });

//     it('should respond with a 404 error message when the payroll date does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { getPayrollDates } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.query = { id: 3 };

//         // Act
//         await getPayrollDates(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Payroll date not found',
//         );
//     });
// });

// describe('POST /api/payroll/dates', () => {
//     it('should populate request.payroll_date_id', async () => {
//         // Arrange
//         mockModule(payrollDates.filter((payrollDate) => payrollDate.id === 1));

//         const newPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { createPayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.body = newPayrollDate;

//         await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockRequest.payroll_date_id).toBe(1);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error creating payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const newPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { createPayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.body = newPayrollDate;

//         await createPayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating payroll date',
//         });
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error creating payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const newPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { createPayrollDateReturnObject } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.body = newPayrollDate;

//         await createPayrollDateReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating payroll date',
//         });
//     });

//     it('should respond with the created payroll date', async () => {
//         // Arrange
//         mockModule(payrollDates.filter((payrollDate) => payrollDate.id === 1));

//         const newPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { createPayrollDateReturnObject } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.body = newPayrollDate;

//         await createPayrollDateReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith([
//             payrollDatesReturnObj[0],
//         ]);
//     });
// });

// describe('PUT /api/payroll/dates/:id', () => {
//     it('should call next on the middlware', async () => {
//         // Arrange
//         mockModule(payrollDates.filter((payrollDate) => payrollDate.id === 1));

//         const updatedPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { updatePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollDate;

//         await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error updating payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const updatedPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { updatePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollDate;

//         await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating payroll date',
//         });
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error updating payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const updatedPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { updatePayrollDateReturnObject } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollDate;

//         await updatePayrollDateReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating payroll date',
//         });
//     });

//     it('should respond with a 404 error message when the payroll date does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { updatePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 3 };
//         mockRequest.body = payrollDates.filter(
//             (payrollDate) => payrollDate.id === 1,
//         );

//         // Act
//         await updatePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Payroll date not found',
//         );
//     });

//     it('should respond with the updated payroll date', async () => {
//         // Arrange
//         mockModule(payrollDates.filter((payrollDate) => payrollDate.id === 1));

//         const updatedPayrollDate = {
//             employee_id: 1,
//             start_day: 1,
//             end_day: 15,
//         };

//         const { updatePayrollDateReturnObject } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedPayrollDate;

//         await updatePayrollDateReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith([
//             payrollDatesReturnObj[0],
//         ]);
//     });
// });

// describe('DELETE /api/payroll/dates/:id', () => {
//     it('should call next on the middleware', async () => {
//         // Arrange
//         mockModule('Successfully deleted payroll date');

//         mockRequest.params = { id: 1 };
//         mockRequest.query = { employee_id: 1 };

//         const { deletePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting payroll date';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         mockRequest.params = { id: 1 };
//         mockRequest.query = { employee_id: 1 };

//         const { deletePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting payroll date',
//         });
//     });

//     it('should respond with a 404 error message when the payroll date does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deletePayrollDate } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 3 };
//         mockRequest.query = { employee_id: 1 };

//         // Act
//         await deletePayrollDate(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Payroll date not found',
//         );
//     });

//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule('Successfully deleted payroll date');

//         const { deletePayrollDateReturnObject } = await import(
//             '../../controllers/payrollDatesController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.query = { employee_id: 1 };

//         // Act
//         await deletePayrollDateReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted payroll date',
//         );
//     });
// });
