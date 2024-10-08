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

// Mock request and response
let mockRequest: any;
let mockResponse: any;

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
});

afterEach(() => {
    jest.resetModules();
});

const payrollDates = [
    {
        id: 1,
        jobId: 1,
        payrollDay: 15,
    },
    {
        id: 2,
        jobId: 1,
        payrollDay: 31,
    },
];

describe('GET /api/payroll/dates', () => {
    it('should respond with an array of payroll dates', async () => {
        // Arrange
        mockModule([payrollDates], payrollDates);

        mockRequest.query = { jobId: null };

        const { getPayrollDates } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(payrollDates);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { jobId: null };

        const { getPayrollDates } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll dates',
                });
            },
        );
    });

    it('should respond with an array of payroll dates with job id', async () => {
        // Arrange
        mockModule(
            [payrollDates.filter((payrollDate) => payrollDate.jobId === 1)],
            payrollDates.filter((payrollDate) => payrollDate.jobId === 1),
        );

        const { getPayrollDates } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDates.filter((payrollDate) => payrollDate.jobId === 1),
        );
    });

    it('should respond with an error message with job id', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollDates } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollDates(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll dates for given job id',
                });
            },
        );
    });
});

describe('GET /api/payroll/dates/:id', () => {
    it('should respond with an array of payroll dates with id', async () => {
        // Arrange
        mockModule(
            [payrollDates.filter((payrollDate) => payrollDate.id === 1)],
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );

        const { getPayrollDatesById } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollDatesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollDatesById } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: null };

        // Call the function with the mock request and response
        await getPayrollDatesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll date',
                });
            },
        );
    });

    it('should respond with an array of payroll dates with id and job id', async () => {
        // Arrange
        mockModule(
            [
                payrollDates
                    .filter((payrollDate) => payrollDate.jobId === 1)
                    .filter((payrollDate) => payrollDate.id === 1),
            ],
            payrollDates
                .filter((payrollDate) => payrollDate.jobId === 1)
                .filter((payrollDate) => payrollDate.id === 1),
        );

        const { getPayrollDatesById } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollDatesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDates
                .filter((payrollDate) => payrollDate.jobId === 1)
                .filter((payrollDate) => payrollDate.id === 1),
        );
    });

    it('should respond with an error message with id and job id', async () => {
        // Arrange
        mockModule([]);

        const { getPayrollDatesById } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { jobId: 1 };

        // Call the function with the mock request and response
        await getPayrollDatesById(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting payroll date',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getPayrollDatesById } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { jobId: null };

        // Act
        await getPayrollDatesById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });
});

describe('POST /api/payroll/dates/toggle', () => {
    it('should respond with a successful message when there is a row', async () => {
        // Arrange
        mockModule([
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
            [],
            [],
            [],
            [],
        ]);

        const { togglePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.body = {
            jobId: 1,
            payrollDay: 15,
        };

        await togglePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            'Payroll day for 15 toggled off',
        );
    });

    it('should respond with a successful message when there is no rows', async () => {
        // Arrange
        mockModule([[], [], [], [], []]);

        const { togglePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.body = {
            jobId: 1,
            payrollDay: 15,
        };
        await togglePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            'Payroll day for 15 toggled on',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { togglePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        )[0];

        await togglePayrollDate(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error toggling payroll date',
                });
            },
        );
    });
});

describe('POST /api/payroll/dates', () => {
    it('should respond with the created payroll date', async () => {
        // Arrange
        mockModule(
            [
                [],
                payrollDates.filter((payrollDate) => payrollDate.id === 1),
                [],
                [],
            ],
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );

        const { createPayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        );

        await createPayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { createPayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        );

        await createPayrollDate(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error creating payroll date',
                });
            },
        );
    });
});

describe('PUT /api/payroll/dates/:id', () => {
    it('should respond with the updated payroll date', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1 }],
                [],
                payrollDates.filter((payrollDate) => payrollDate.id === 1),
                [],
                [],
            ],
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );

        const { updatePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        );

        await updatePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            payrollDates.filter((payrollDate) => payrollDate.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { updatePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        );

        await updatePayrollDate(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error updating payroll date',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updatePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = payrollDates.filter(
            (payrollDate) => payrollDate.id === 1,
        );

        // Act
        await updatePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });
});

describe('DELETE /api/payroll/dates/:id', () => {
    it('should respond with a successful message', async () => {
        // Arrange
        mockModule([[{ id: 1, job_id: 1 }], [], [], [], []]);

        const { deletePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };

        await deletePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted payroll date',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { deletePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 1 };

        await deletePayrollDate(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting payroll date',
                });
            },
        );
    });

    it('should respond with a 404 error message when the payroll date does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deletePayrollDate } = await import(
            '../../src/controllers/payrollDatesController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deletePayrollDate(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Payroll date not found',
        );
    });
});
