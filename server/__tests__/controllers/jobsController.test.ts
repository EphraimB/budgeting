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
import { Job, PayrollDate, PayrollTax } from '../../src/types/types.js';

// Mock request and response
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

const jobs: any[] = [
    {
        job_id: 1,
        account_id: 1,
        name: 'Test Job',
        hourly_rate: 10,
        regular_hours: 40,
        vacation_days: 10,
        sick_days: 10,
        work_schedule: '0111100',
    },
];

const payrollDates: PayrollDate[] = [
    {
        id: 1,
        job_id: 1,
        payroll_start_day: 1,
        payroll_end_day: 15,
    },
    {
        id: 2,
        job_id: 1,
        payroll_start_day: 15,
        payroll_end_day: 31,
    },
];

const payrollTaxes: PayrollTax[] = [
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

const jobResponse: Job[] = [
    {
        id: 1,
        account_id: 1,
        name: 'Test Job',
        hourly_rate: 10,
        regular_hours: 40,
        vacation_days: 10,
        sick_days: 10,
        work_schedule: '0111100',
    },
];

describe('GET /api/jobs', () => {
    it('should respond with an array of jobs', async () => {
        // Arrange
        mockModule([jobs]);

        mockRequest.query = { job_id: null };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);

        // Check that the response is an array of jobs
        expect(mockResponse.json).toHaveBeenCalledWith(jobResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting jobs';
        mockModule([], [errorMessage]);

        mockRequest.query = { job_id: null };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting jobs',
        });
    });

    it('should respond with an array of jobs with id', async () => {
        // Arrange
        mockModule([jobs]);

        mockRequest.query = { job_id: 1 };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobResponse);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting jobs';
        mockModule([], [errorMessage]);

        mockRequest.query = { job_id: 1 };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting job',
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.query = { job_id: 3 };

        // Act
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });
});

describe('POST /api/jobs', () => {
    it('should respond with the new job', async () => {
        // Arrange
        mockModule([jobResponse]);

        const { createJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.body = jobs;

        await createJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(jobResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error creating job';
        mockModule([], [errorMessage]);

        const { createJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.body = jobs;

        await createJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating job',
        });
    });
});

describe('PUT /api/jobs/:id', () => {
    it('should call next on middleware', async () => {
        // Arrange
        mockModule([jobs]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs;

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error updating job';
        mockModule([], [errorMessage]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs;

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating job',
        });
    });

    it('should respond with an error message in return object', async () => {
        // Arrange
        const errorMessage = 'Error updating job';
        mockModule([], [errorMessage]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs;

        const { updateJobReturnObject } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJobReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating job',
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { job_id: 3 };
        mockRequest.body = jobs;

        // Act
        await updateJob(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });

    it('should respond with the updated job', async () => {
        // Arrange
        mockModule([jobs]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs;

        const { updateJobReturnObject } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Act
        await updateJobReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobResponse);
    });
});

describe('DELETE /api/jobs/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        const job_id = 1;

        // Mock the executeQuery function to return different values based on the query
        mockModule([jobs, [], [], [], [], 'Successfully deleted job']);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { job_id };

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted job',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const job_id = 1;
        mockRequest.params = { job_id };

        // Mock the executeQuery function to throw an error
        const errorMessage = 'Error deleting job';
        mockModule([], [errorMessage]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting job',
        });
    });

    it('should not delete job if there are related data', async () => {
        // Arrange
        const job_id = 1;
        mockRequest.params = { job_id };

        mockModule([job_id, payrollDates, payrollTaxes]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith({
            errors: {
                msg: 'You need to delete job-related data before deleting the job',
                param: null,
                location: 'query',
            },
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { job_id: 3 };

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });
});
