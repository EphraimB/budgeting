import { type Request } from 'express';
import {
    jest,
    beforeEach,
    afterEach,
    describe,
    it,
    expect,
} from '@jest/globals';
import { mockModule } from '../__mocks__/mockModule';

jest.mock('../../src/config/winston', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../src/crontab/determineCronValues.js', () => {
    return jest.fn().mockReturnValue('0 0 16 * *');
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;

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

const commuteSchedule = [
    {
        accountId: 1,
        schedules: [
            {
                dayOfWeek: 1,
                passes: [
                    {
                        id: 1,
                        pass: 'LIRR Peak',
                        startTime: '08:00:00',
                        endTime: 60,
                        fare: 10.75,
                    },
                    {
                        id: 2,
                        pass: 'LIRR Peak',
                        startTime: '17:00:00',
                        endTime: 60,
                        fare: 10.75,
                    },
                ],
            },
            {
                dayOfWeek: 2,
                passes: [
                    {
                        id: 3,
                        pass: 'LIRR Peak',
                        startTime: '08:00:00',
                        endTime: 60,
                        fare: 10.75,
                    },
                ],
            },
        ],
    },
];

describe('GET /api/expenses/commute/schedule', () => {
    it('should respond with an array of schedules', async () => {
        // Arrange
        mockModule([commuteSchedule], commuteSchedule);

        const { getCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(commuteSchedule);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.query = { accountId: null };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting schedules',
                });
            },
        );
    });

    it('should respond with an array of schedules with an account id', async () => {
        // Arrange
        mockModule(
            [commuteSchedule.filter((s) => s.accountId === 1)],
            commuteSchedule.filter((s) => s.accountId === 1),
        );

        const { getCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            commuteSchedule.filter((s) => s.accountId === 1),
        );
    });

    it('should handle errors correctly with an account id', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.query = { accountId: 1 };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error getting schedule for given account id',
                });
            },
        );
    });
});

describe('GET /api/expenses/commute/schedule/:id', () => {
    it('should respond with an array of schedules with an id', async () => {
        const filteredCommuteSchedule = [
            {
                accountId: 1,
                schedules: [
                    {
                        dayOfWeek: 1,
                        passes: [
                            {
                                id: 1,
                                pass: 'LIRR Peak',
                                startTime: '08:00:00',
                                endTime: 60,
                                fare: 10.75,
                            },
                        ],
                    },
                ],
            },
        ];

        // Arrange
        mockModule([filteredCommuteSchedule], filteredCommuteSchedule);

        const { getCommuteScheduleById } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getCommuteScheduleById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(filteredCommuteSchedule);
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        mockModule([]);

        const { getCommuteScheduleById } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Act
        await getCommuteScheduleById(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting schedule for given id',
            });
        });
    });

    it('should respond with a 404 error message when the schedule does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteScheduleById } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: null };

        // Act
        await getCommuteScheduleById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });
});

describe('POST /api/expenses/commute/schedule', () => {
    it('should respond with the created commute schedule when system is opened and is in the timeframe for the fare type and a timed pass', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1, duration: 30, day_start: 1 }],
                [
                    {
                        overlapping_schedule_id: null,
                        fare_detail_id: 1,
                        system_name: 'LIRR',
                        fare_type: 'monthly',
                        original_fare: 230,
                        fare: 230,
                        system_opened: true,
                    },
                ],
                [],
                [{ id: 1 }],
                [
                    {
                        id: 1,
                        commute_system_id: 1,
                        account_id: 1,
                        cron_job_id: 1,
                        fare_detail_id: 1,
                        day_of_week: 1,
                        pass: 'LIRR monthly',
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                        duration: 30,
                        day_start: 1,
                        fare: 230,
                    },
                ],
                [],
                [],
                [],
                [{ id: 1 }],
                [],
                [],
            ],
            {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'LIRR monthly',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: 30,
                day_start: 1,
                fare: 230,
            },
            true,
        );

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'LIRR monthly',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: 30,
                day_start: 1,
                fare: 230,
            },
            alerts: '',
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should respond with the created commute schedule when system is opened and is in the timeframe for the fare type', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1, duration: null, day_start: null }],
                [
                    {
                        overlapping_schedule_id: null,
                        fare_detail_id: 1,
                        system_name: 'OMNY',
                        fare_type: 'Regular',
                        original_fare: 2.9,
                        fare: 2.9,
                        system_opened: true,
                    },
                ],
                [],
                [{ id: 1 }],
                [
                    {
                        id: 1,
                        commute_system_id: 1,
                        account_id: 1,
                        cron_job_id: 1,
                        fare_detail_id: 1,
                        day_of_week: 1,
                        pass: 'OMNY regular',
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                        duration: null,
                        day_start: null,
                        fare: 2.9,
                    },
                ],
                [],
                [],
                [{ id: 1 }],
                [],
                [],
            ],
            {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'OMNY regular',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 2.9,
            },
            true,
        );

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'OMNY regular',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 2.9,
            },
            alerts: '',
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should respond with the created commute schedule stepped up when system is opened and is in the timeframe for the fare type', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1, duration: null, day_start: null }],
                [],
                [
                    {
                        id: 1,
                        system_name: 'LIRR',
                        fare_type: 'Off peak',
                        fare: 9.75,
                        alternate_fare_detail_id: 1,
                    },
                ],
                [
                    {
                        id: 1,
                        system_name: 'LIRR',
                        fare_type: 'Off peak',
                        fare: 9.75,
                        alternate_fare_detail_id: 1,
                    },
                ],
                [
                    {
                        day_of_week: 1,
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                    },
                ],
                [
                    {
                        id: 1,
                        system_name: 'LIRR',
                        fare_type: 'Peak',
                        fare: 13,
                        alternate_fare_detail_id: null,
                    },
                ],
                [],
                [
                    {
                        id: 1,
                        commute_system_id: 1,
                        fare_detail_id: 1,
                        account_id: 1,
                        cron_job_id: 1,
                        day_of_week: 1,
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                    },
                ],
                [
                    {
                        id: 1,
                        commute_system_id: 1,
                        account_id: 1,
                        cron_job_id: 1,
                        fare_detail_id: 1,
                        day_of_week: 1,
                        pass: 'LIRR Peak',
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                        duration: null,
                        day_start: null,
                        fare: 13,
                    },
                ],
                [],
                [],
                [{ id: 1, unique_id: 'vc3c83qbpe892' }],
                [],
                [],
            ],
            {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'LIRR Peak',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 13,
            },
            false,
        );

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '10:00:00',
            endTime: '12:00:00',
        };

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'LIRR Peak',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 13,
            },
            alerts: [
                {
                    message: 'fare automatically stepped up to 13',
                },
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should respond with the created commute schedule when system is closed and is in the timeframe for the fare type', async () => {
        // Arrange
        mockModule([
            [{ id: 1 }],
            [],
            [{ id: 1, fare: 2.9, alternate_fare_detail_id: null }],
            [{ id: 1, fare: 2.9, alternate_fare_detail_id: null }],
            [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }],
        ]);

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 2,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'System is closed for the given time',
        );
    });

    it('should respond with a 400 error when schedule overlaps', async () => {
        // Arrange
        mockModule([[{ id: 1 }], [{ id: 1 }]]);

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'A schedule with the provided day and time already exists',
        );
    });
});

describe('PUT /api/expenses/commute/schedule/:id', () => {
    it('should respond with the updated commute schedule', async () => {
        // Arrange
        mockModule(
            [
                [{ id: 1, cron_job_id: 1 }],
                [{ id: 1 }],
                [],
                [
                    {
                        id: 1,
                        system_name: 'OMNY',
                        fare_type: 'Regular',
                        fare: 2.9,
                        alternate_fare_id: null,
                    },
                ],
                [
                    {
                        id: 1,
                        system_name: 'OMNY',
                        fare_type: 'Regular',
                        fare: 2.9,
                        alternate_fare_id: null,
                    },
                ],
                [
                    {
                        day_of_week: 1,
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                    },
                ],
                [],
                [],
                [
                    {
                        id: 1,
                        commute_system_id: 1,
                        account_id: 1,
                        cron_job_id: 1,
                        fare_detail_id: 1,
                        day_of_week: 1,
                        pass: 'OMNY regular',
                        start_time: '08:00:00',
                        end_time: '10:00:00',
                        duration: null,
                        day_start: null,
                        fare: 2.9,
                    },
                ],
                [{ id: 1, duration: null }],
                [{ id: 1, unique_id: 'v6ce3v87' }],
                [],
                [],
                [],
                [],
                [],
            ],
            {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'OMNY regular',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 2.9,
            },
            true,
        );

        const { updateCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await updateCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        const responseObj = {
            schedule: {
                id: 1,
                commute_system_id: 1,
                account_id: 1,
                cron_job_id: 1,
                fare_detail_id: 1,
                day_of_week: 1,
                pass: 'OMNY regular',
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: null,
                day_start: null,
                fare: 2.9,
            },
            alerts: [],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should respond with a 400 error when schedule overlaps', async () => {
        // Arrange
        mockModule([[{ id: 1 }], [{ id: 1 }], [{ id: 1 }]]);

        const { updateCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await updateCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'A schedule with the provided day and time already exists',
        );
    });

    it('should respond with a 404 error message when the schedule does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            dayOfWeek: 1,
            fareDetailId: 1,
            startTime: '08:00:00',
            endTime: '10:00:00',
        };

        // Act
        await updateCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });
});

describe('DELETE /api/expenses/commute/schedule/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ id: 1, cron_job_id: 1 }],
            [],
            [],
            [{ id: 1, unique_id: 'g798v89v9v' }],
            [],
            [],
            [],
        ]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted schedule',
        );
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSchedule(mockRequest as Request, mockResponse).catch(
            () => {
                // Assert
                expect(mockResponse.status).toHaveBeenCalledWith(400);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    message: 'Error deleting schedule',
                });
            },
        );
    });

    it('should respond with a 404 error message when the schedule does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });
});
