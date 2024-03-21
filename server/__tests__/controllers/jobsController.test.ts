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
        job_name: 'Test Job',
        hourly_rate: 10,
        vacation_days: 10,
        sick_days: 10,
        total_hours_per_week: 40,
        job_schedule: [
            {
                day_of_week: 1,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 2,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 3,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 4,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 5,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
        ],
    },
];

const jobResponse: any = [
    {
        id: 1,
        account_id: 1,
        name: 'Test Job',
        hourly_rate: 10,
        vacation_days: 10,
        sick_days: 10,
        total_hours_per_week: 40,
        job_schedule: [
            {
                day_of_week: 1,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 2,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 3,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 4,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
            {
                day_of_week: 5,
                start_time: '09:00:00',
                end_time: '17:00:00',
            },
        ],
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
        // expect(mockResponse.status).toHaveBeenCalledWith(200);

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
            message: 'Error getting jobs',
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.query = { id: 3 };

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
        mockModule([
            [
                {
                    job_id: 1,
                    account_id: 1,
                    name: 'Test Job',
                    hourly_rate: 10,
                    vacation_days: 10,
                    sick_days: 10,
                },
            ],
            [],
            [],
        ]);

        const response = {
            account_id: 1,
            name: 'Test Job',
            hourly_rate: 10,
            vacation_days: 10,
            sick_days: 10,
            job_schedule: [
                {
                    day_of_week: 1,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 2,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 3,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 4,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 5,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
            ],
        };

        const { createJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.body = response;

        await createJob(mockRequest as Request, mockResponse);

        const responseObj = {
            id: 1,
            account_id: 1,
            name: 'Test Job',
            hourly_rate: 10,
            vacation_days: 10,
            sick_days: 10,
            job_schedule: [
                {
                    day_of_week: 1,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 2,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 3,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 4,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
                {
                    day_of_week: 5,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
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
        mockModule([
            [
                {
                    job_id: 1,
                    account_id: 1,
                    name: 'Test Job',
                    hourly_rate: 10,
                    vacation_days: 10,
                    sick_days: 10,
                },
            ],
            [
                {
                    day_of_week: 1,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
            ],
            [
                {
                    day_of_week: 1,
                    start_time: '09:00:00',
                    end_time: '17:00:00',
                },
            ],
        ]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs[0];

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
