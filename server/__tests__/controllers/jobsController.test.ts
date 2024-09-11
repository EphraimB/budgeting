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

const jobs: any[] = [
    {
        id: 1,
        accountId: 1,
        name: 'Test Job',
        hourlyRate: 10,
        vacationDays: 10,
        sickDays: 10,
        totalHoursPerWeek: 40,
        jobSchedule: [
            {
                dayOfWeek: 1,
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
            {
                dayOfWeek: 2,
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
            {
                dayOfWeek: 3,
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
            {
                dayOfWeek: 4,
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
            {
                dayOfWeek: 5,
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
        ],
    },
];

describe('GET /api/jobs', () => {
    it('should respond with an array of jobs', async () => {
        // Arrange
        mockModule([jobs], jobs);

        mockRequest.query = { accountId: null };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { accountId: null };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting jobs',
            });
        });
    });

    it('should respond with an array of jobs with account id', async () => {
        // Arrange
        mockModule([jobs], jobs);

        mockRequest.query = { accountId: 1 };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { account_id: 1 };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting jobs',
            });
        });
    });
});

describe('GET /api/jobs/:id', () => {
    it('should respond with an array of jobs with id', async () => {
        // Arrange
        mockModule([jobs], jobs);

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        const { getJobsById } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs[0]);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        const { getJobsById } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobsById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting jobs',
            });
        });
    });

    it('should respond with an array of jobs with id and account id', async () => {
        // Arrange
        mockModule([jobs], jobs);

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        const { getJobs } = await import(
            '../../src/controllers/jobsController.js'
        );

        // Call the function with the mock request and response
        await getJobs(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getJobsById } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: null };

        // Act
        await getJobsById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });
});

describe('POST /api/jobs', () => {
    it('should respond with the new job', async () => {
        // Arrange
        mockModule(
            [
                [],
                [
                    {
                        id: 1,
                        accountId: 1,
                        name: 'Test Job',
                        hourlyRate: 10,
                        vacationDays: 10,
                        sickDays: 10,
                    },
                ],
                [],
                [],
                [],
            ],
            jobs,
        );

        const response = {
            accountId: 1,
            name: 'Test Job',
            hourlyRate: 10,
            vacationDays: 10,
            sickDays: 10,
            jobSchedule: [
                {
                    dayOfWeek: 1,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
                {
                    dayOfWeek: 2,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
                {
                    dayOfWeek: 3,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
                {
                    dayOfWeek: 4,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
                {
                    dayOfWeek: 5,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
            ],
        };

        const { createJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.body = response;

        await createJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { createJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.body = jobs[0];

        await createJob(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating job',
            });
        });
    });
});

describe('PUT /api/jobs/:id', () => {
    it('should respond with a job when updating the same schedule', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1 }],
                [],
                [
                    {
                        id: 1,
                        account_id: 1,
                        name: 'Test Job',
                        hourly_rate: 10,
                        vacation_days: 10,
                        sick_days: 10,
                    },
                ],
                [],
                [
                    {
                        id: 1,
                        job_id: 1,
                        day_of_week: 1,
                        start_time: '09:00:00',
                        end_time: '17:00:00',
                    },
                ],
                [],
                [],
                [],
            ],
            jobs,
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            name: 'Test Job',
            hourlyRate: 10,
            vacationDays: 10,
            sickDays: 10,
            jobSchedule: [
                {
                    dayOfWeek: 1,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
            ],
        };

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with a job when updating a new schedule', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1 }],
                [],
                [
                    {
                        id: 1,
                        account_id: 1,
                        name: 'Test Job',
                        hourly_rate: 10,
                        vacation_days: 10,
                        sick_days: 10,
                    },
                ],
                [
                    {
                        id: 1,
                        job_id: 1,
                        day_of_week: 1,
                        start_time: '09:00:00',
                        end_time: '17:00:00',
                    },
                ],
                [],
                [
                    {
                        id: 2,
                        job_id: 1,
                        day_of_week: 2,
                        start_time: '09:00:00',
                        end_time: '17:00:00',
                    },
                ],
                [],
                [],
            ],
            jobs,
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            name: 'Test Job',
            hourlyRate: 10,
            vacationDays: 10,
            sickDays: 10,
            jobSchedule: [
                {
                    dayOfWeek: 1,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
                {
                    dayOfWeek: 2,
                    startTime: '09:00:00',
                    endTime: '17:00:00',
                },
            ],
        };

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with a job when deleting a schedule', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1 }],
                [],
                [
                    {
                        id: 1,
                        account_id: 1,
                        name: 'Test Job',
                        hourly_rate: 10,
                        vacation_days: 10,
                        sick_days: 10,
                    },
                ],
                [
                    {
                        id: 1,
                        job_id: 1,
                        day_of_week: 1,
                        start_time: '09:00:00',
                        end_time: '17:00:00',
                    },
                ],
                [],
                [],
                [],
            ],
            jobs,
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            name: 'Test Job',
            hourlyRate: 10,
            vacationDays: 10,
            sickDays: 10,
            jobSchedule: [],
        };

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(jobs);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.params = { id: 1 };
        mockRequest.body = jobs;

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        await updateJob(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating job',
            });
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = jobs[0];

        // Act
        await updateJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });
});

describe('DELETE /api/jobs/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([[{ id: 1 }], [], [], [], []]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted job for id of 1',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange

        mockModule([]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteJob(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting job',
            });
        });
    });

    it('should respond with a 404 error message when the job does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteJob } = await import(
            '../../src/controllers/jobsController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deleteJob(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Job not found');
    });
});
