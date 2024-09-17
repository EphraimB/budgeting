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
let mockNext: any;

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
        expect(mockResponse.json).toHaveBeenCalledWith(
            filteredCommuteSchedule[0],
        );
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
    it('should respond with the created commute schedule when system is opened and is in the timeframe for the fare type', async () => {
        // Arrange
        mockModule([
            [],
            [{ id: 1, fare: 2.9, alternate_fare_detail_id: null }],
            [{ id: 1, fare: 2.9, alternate_fare_detail_id: null }],
            [{ day_of_week: 1, start_time: '08:00:00', end_time: '10:00:00' }],
            [],
            [],
            [],
            [{ id: 1, unique_id: 'bp78pbbp98' }],
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
        ]);

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
            schedule: [
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
            alerts: [],
        };

        // Assert
        //expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should respond with a 400 error when schedule overlaps', async () => {
        const newSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        // Arrange
        mockModule([[{ id: 1 }]]);

        const { createCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.body = newSchedule;

        // Act
        await createCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'A schedule with the provided day and time already exists',
        );
    });
});

/*describe('PUT /api/expenses/commute/schedule/:id', () => {
    it('should call next', async () => {
        const newSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        // Arrange
        mockModule([
            [newSchedule],
            [],
            [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
            [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
            [{ day_of_week: 1, start_time: '08:00:00', end_time: '09:00:00' }],
            [{ cron_job_id: 1, unique_id: '123' }],
            [],
            [],
        ]);

        const { updateCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = newSchedule;

        // Act
        await updateCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with a 400 error when schedule overlaps', async () => {
        const newSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        // Arrange
        mockModule([
            [{ commute_schedule_id: 1 }],
            [newSchedule],
            [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
            [{ cron_job_id: 1, unique_id: '123' }],
            [],
            [],
        ]);

        const { updateCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = newSchedule;

        // Act
        await updateCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

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
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            commute_ticket_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        // Act
        await updateCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });

    it('should respond with the updated schedule', async () => {
        const newSchedule = [
            {
                commute_schedule_id: 1,
                commute_system_id: 1,
                account_id: 1,
                day_of_week: 1,
                fare_detail_id: 1,
                start_time: '08:00:00',
                end_time: '10:00:00',
                duration: 60,
                fare_amount: 10.75,
                pass: 'LIRR Peak',
                date_created: '2021-01-01',
                date_modified: '2021-01-01',
            },
        ];

        mockModule([newSchedule]);

        const { updateCommuteScheduleReturnObject } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest = { commute_schedule_id: 1 };
        mockRequest.alerts = [];

        await updateCommuteScheduleReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        const responseObj = {
            schedule: [
                {
                    id: 1,
                    commute_system_id: 1,
                    account_id: 1,
                    day_of_week: 1,
                    fare_detail_id: 1,
                    start_time: '08:00:00',
                    end_time: '10:00:00',
                    duration: 60,
                    fare_amount: 10.75,
                    pass: 'LIRR Peak',
                    date_created: '2021-01-01',
                    date_modified: '2021-01-01',
                },
            ],
            alerts: [],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { updateCommuteScheduleReturnObject } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            fare_detail_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        // Act
        await updateCommuteScheduleReturnObject(
            mockRequest as Request,
            mockResponse,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting schedule',
            });
        });
    });
});

describe('DELETE /api/expenses/commute/schedule/:id', () => {
    it('should call next', async () => {
        const deletedSchedule = [
            {
                commute_schedule_id: 1,
                account_id: 1,
                day_of_week: 1,
                fare_detail_id: 1,
                start_time: '08:00:00',
                duration: 60,
            },
        ];

        // Arrange
        mockModule([
            commuteSchedule.filter((cs) => cs.commute_schedule_id === 1),
            [],
            deletedSchedule,
            [{ cron_job_id: 1 }],
            [],
            [],
            [],
        ]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle errors correctly', async () => {
        // Arrange
        mockModule([]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        ).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting schedule',
            });
        });
    });

    it('should respond with a 404 error message when the schedule does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteCommuteSchedule } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        mockRequest.params = { id: 1 };

        // Act
        await deleteCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });

    it('should respond with a success message', async () => {
        // Arrange
        const { deleteCommuteScheduleReturnObject } = await import(
            '../../src/controllers/commuteScheduleController.js'
        );

        // Act
        await deleteCommuteScheduleReturnObject(
            mockRequest as Request,
            mockResponse,
        );

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Successfully deleted schedule',
        );
    });
});*/
