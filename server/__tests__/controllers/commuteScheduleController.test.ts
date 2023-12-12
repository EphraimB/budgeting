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

jest.mock('../../config/winston', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock('../../crontab/determineCronValues.js', () => {
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
        commute_schedule_id: 1,
        account_id: 1,
        day_of_week: 1,
        commute_ticket_id: 1,
        start_time: '08:00:00',
        duration: 60,
        pass: 'LIRR Peak',
        fare_amount: 10.75,
    },
    {
        commute_schedule_id: 2,
        account_id: 1,
        day_of_week: 1,
        commute_ticket_id: 1,
        start_time: '17:00:00',
        duration: 60,
        pass: 'LIRR Peak',
        fare_amount: 10.75,
    },
    {
        commute_schedule_id: 3,
        account_id: 1,
        day_of_week: 2,
        commute_ticket_id: 1,
        start_time: '08:00:00',
        duration: 60,
        pass: 'LIRR Peak',
        fare_amount: 10.75,
    },
];

const commuteScheduleResponse = [
    {
        day_of_week: 1,
        passes: [
            {
                commute_schedule_id: 1,
                pass: 'LIRR Peak',
                start_time: '08:00:00',
                duration: 60,
                fare_amount: 10.75,
            },
            {
                commute_schedule_id: 2,
                pass: 'LIRR Peak',
                start_time: '17:00:00',
                duration: 60,
                fare_amount: 10.75,
            },
        ],
    },
    {
        day_of_week: 2,
        passes: [
            {
                commute_schedule_id: 3,
                pass: 'LIRR Peak',
                start_time: '08:00:00',
                duration: 60,
                fare_amount: 10.75,
            },
        ],
    },
];

describe('GET /api/expenses/commute/schedule', () => {
    it('should respond with an array of schedules', async () => {
        // Arrange
        mockModule([commuteSchedule]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: commuteScheduleResponse,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly', async () => {
        // Arrange
        const errorMessage = 'Error getting schedules';
        mockModule([], [errorMessage]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: null };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting schedules',
        });
    });

    it('should respond with an array of schedules with an account_id', async () => {
        // Arrange
        mockModule([commuteSchedule.filter((s) => s.account_id === 1)]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: commuteScheduleResponse,
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly with an account_id', async () => {
        // Arrange
        const errorMessage = 'Error getting schedules for given account_id';
        mockModule([], [errorMessage]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: 1, id: null };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting schedule for given account_id',
        });
    });

    it('should respond with an array of schedules with an id', async () => {
        // Arrange
        mockModule([
            commuteSchedule.filter((s) => s.commute_schedule_id === 1),
        ]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Call the function with the mock request and response
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        const responseObj = {
            schedule: [
                {
                    day_of_week: 1,
                    passes: [
                        {
                            commute_schedule_id: 1,
                            start_time: '08:00:00',
                            duration: 60,
                            pass: 'LIRR Peak',
                            fare_amount: 10.75,
                        },
                    ],
                },
            ],
        };

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
    });

    it('should handle errors correctly with an id', async () => {
        // Arrange
        const errorMessage = 'Error getting schedule for given id';
        mockModule([], [errorMessage]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: null, id: 1 };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting schedule for given id',
        });
    });

    it('should respond with a 404 error message when the schedule does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.query = { account_id: 3, id: 3 };

        // Act
        await getCommuteSchedule(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
    });
});

describe('POST /api/expenses/commute/schedule', () => {
    it('should call next', async () => {
        const newSchedule = {
            commute_schedule_id: 1,
            account_id: 1,
            day_of_week: 1,
            commute_ticket_id: 1,
            start_time: '08:00:00',
            duration: 60,
        };

        const fareDetail = {
            fare_amount: 10.75,
            system_name: 'LIRR',
            fare_type: 'Peak',
        };

        // Arrange
        mockModule(
            [
                [],
                [{ fare_amount: 10.75 }],
                [fareDetail],
                [
                    {
                        day_of_week: 1,
                        start_time: '08:00:00',
                        end_time: '09:00:00',
                    },
                ],
                newSchedule,
                [{ cron_job_id: 1, unique_id: '123' }],
                [],
            ],
            [],
            [[], []],
        );

        const { createCommuteSchedule } = await import(
            '../../controllers/commuteScheduleController.js'
        );

        mockRequest.body = newSchedule;

        // Act
        await createCommuteSchedule(
            mockRequest as Request,
            mockResponse,
            mockNext,
        );

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });
});

//     it('should respond with a 400 error when schedule overlaps', async () => {
//         const newSchedule = {
//             commute_schedule_id: 1,
//             account_id: 1,
//             day_of_week: 1,
//             fare_detail_id: 1,
//             start_time: '08:00:00',
//             duration: 60,
//         };

//         // Arrange
//         mockModule(
//             [{ commute_schedule_id: 1 }],
//             undefined,
//             [newSchedule],
//             [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
//             [{ cron_job_id: 1, unique_id: '123' }],
//             [],
//         );

//         const { createCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.body = newSchedule;

//         // Act
//         await createCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'A schedule with the provided day and time already exists',
//         );
//     });

//     it('should respond with the new schedule', async () => {
//         const newSchedule = [
//             {
//                 commute_schedule_id: 1,
//                 commute_system_id: 1,
//                 account_id: 1,
//                 day_of_week: 1,
//                 fare_detail_id: 1,
//                 start_time: '08:00:00',
//                 duration: 60,
//                 fare_amount: 10.75,
//                 pass: 'LIRR Peak',
//                 date_created: '2021-01-01',
//                 date_modified: '2021-01-01',
//             },
//         ];

//         mockModule(newSchedule);

//         const { createCommuteScheduleReturnObject } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest = { commute_schedule_id: 1 };
//         mockRequest.alerts = [];

//         await createCommuteScheduleReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         const responseObj = {
//             schedule: [
//                 {
//                     commute_schedule_id: 1,
//                     commute_system_id: 1,
//                     account_id: 1,
//                     day_of_week: 1,
//                     fare_detail_id: 1,
//                     start_time: '08:00:00',
//                     duration: 60,
//                     fare_amount: 10.75,
//                     pass: 'LIRR Peak',
//                     timed_pass_duration: null,
//                     date_created: '2021-01-01',
//                     date_modified: '2021-01-01',
//                 },
//             ],
//             alerts: [],
//         };

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error creating schedule';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { createCommuteScheduleReturnObject } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest = { commute_schedule_id: 1 };

//         // Act
//         await createCommuteScheduleReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting commute schedule',
//         });
//     });
// });

// describe('PUT /api/expenses/commute/schedule/:id', () => {
//     it('should call next', async () => {
//         const newSchedule = {
//             commute_schedule_id: 1,
//             account_id: 1,
//             day_of_week: 1,
//             fare_detail_id: 1,
//             start_time: '08:00:00',
//             duration: 60,
//         };

//         // Arrange
//         mockModule(
//             [newSchedule],
//             undefined,
//             [],
//             [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
//             [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
//             [{ day_of_week: 1, start_time: '08:00:00', end_time: '09:00:00' }],
//             [{ cron_job_id: 1, unique_id: '123' }],
//             [],
//             [],
//         );

//         const { updateCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = newSchedule;

//         // Act
//         await updateCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with a 400 error when schedule overlaps', async () => {
//         const newSchedule = {
//             commute_schedule_id: 1,
//             account_id: 1,
//             day_of_week: 1,
//             fare_detail_id: 1,
//             start_time: '08:00:00',
//             duration: 60,
//         };

//         // Arrange
//         mockModule(
//             [{ commute_schedule_id: 1 }],
//             undefined,
//             [newSchedule],
//             [{ fare_amount: 10.75, system_name: 'LIRR', fare_type: 'Peak' }],
//             [{ cron_job_id: 1, unique_id: '123' }],
//             [],
//             [],
//         );

//         const { updateCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = newSchedule;

//         // Act
//         await updateCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'A schedule with the provided day and time already exists',
//         );
//     });

//     it('should respond with a 404 error message when the schedule does not exist', async () => {
//         // Arrange
//         mockModule([], undefined, []);

//         const { updateCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = {
//             commute_schedule_id: 1,
//             account_id: 1,
//             day_of_week: 1,
//             commute_ticket_id: 1,
//             start_time: '08:00:00',
//             duration: 60,
//         };

//         // Act
//         await updateCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
//     });

//     it('should respond with the updated schedule', async () => {
//         const updatedSchedule = [
//             {
//                 commute_schedule_id: 1,
//                 commute_system_id: 1,
//                 account_id: 1,
//                 day_of_week: 1,
//                 fare_detail_id: 1,
//                 start_time: '08:00:00',
//                 duration: 60,
//                 fare_amount: 10.75,
//                 pass: 'LIRR Peak',
//                 date_created: '2021-01-01',
//                 date_modified: '2021-01-01',
//             },
//         ];

//         mockModule(updatedSchedule);

//         const { updateCommuteScheduleReturnObject } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest = { commute_schedule_id: 1 };
//         mockRequest.alerts = [];

//         await updateCommuteScheduleReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         const responseObj = {
//             schedule: [
//                 {
//                     commute_schedule_id: 1,
//                     commute_system_id: 1,
//                     account_id: 1,
//                     day_of_week: 1,
//                     fare_detail_id: 1,
//                     start_time: '08:00:00',
//                     duration: 60,
//                     fare_amount: 10.75,
//                     pass: 'LIRR Peak',
//                     timed_pass_duration: null,
//                     date_created: '2021-01-01',
//                     date_modified: '2021-01-01',
//                 },
//             ],
//             alerts: [],
//         };

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(responseObj);
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error updating schedule';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { updateCommuteScheduleReturnObject } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = {
//             commute_schedule_id: 1,
//             account_id: 1,
//             day_of_week: 1,
//             fare_detail_id: 1,
//             start_time: '08:00:00',
//             duration: 60,
//         };

//         // Act
//         await updateCommuteScheduleReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting schedule',
//         });
//     });
// });

// describe('DELETE /api/expenses/commute/schedule/:id', () => {
//     it('should call next', async () => {
//         const deletedSchedule = [
//             {
//                 commute_schedule_id: 1,
//                 account_id: 1,
//                 day_of_week: 1,
//                 fare_detail_id: 1,
//                 start_time: '08:00:00',
//                 duration: 60,
//             },
//         ];

//         // Arrange
//         mockModule(deletedSchedule, undefined, [], [{ cron_job_id: 1 }], []);

//         const { deleteCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should handle errors correctly', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting schedule';
//         const error = new Error(errorMessage);
//         mockModule(null, errorMessage);

//         const { deleteCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting schedule',
//         });
//     });

//     it('should respond with a 404 error message when the schedule does not exist', async () => {
//         // Arrange
//         mockModule([]);

//         const { deleteCommuteSchedule } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         mockRequest.params = { id: 1 };

//         // Act
//         await deleteCommuteSchedule(
//             mockRequest as Request,
//             mockResponse,
//             mockNext,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Schedule not found');
//     });

//     it('should respond with a success message', async () => {
//         // Arrange
//         const { deleteCommuteScheduleReturnObject } = await import(
//             '../../controllers/commuteScheduleController.js'
//         );

//         // Act
//         await deleteCommuteScheduleReturnObject(
//             mockRequest as Request,
//             mockResponse,
//         );

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Successfully deleted schedule',
//         );
//     });
// });
