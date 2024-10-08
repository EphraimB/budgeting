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

jest.mock('../../src/config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const loans = [
    {
        id: 1,
        cronJobId: 1,
        accountId: 1,
        taxId: null,
        amount: 10000,
        planAmount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequencyType: 2,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        interestFrequencyType: 2,
        interestRate: 0,
        subsidized: 0,
        beginDate: '2020-01-02',
        nextDate: '2020-02-02',
        fullyPaidBackDate: '2030-01-02',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 2,
        cronJobId: 2,
        accountId: 1,
        taxId: null,
        amount: 1000,
        planAmount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequencyType: 0,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        interestFrequencyType: 2,
        interestRate: 0,
        subsidized: 0.15,
        beginDate: '2020-01-01',
        nextDate: '2020-01-02',
        fullyPaidBackDate: '2021-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 3,
        cronJobId: 3,
        accountId: 1,
        taxId: null,
        amount: 1000,
        planAmount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequencyType: 1,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        interestFrequencyType: 2,
        interestRate: 0,
        subsidized: 0.1,
        beginDate: '2020-01-01',
        nextDate: '2020-01-08',
        fullyPaidBackDate: '2022-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
    {
        id: 4,
        cronJobId: 4,
        accountId: 1,
        taxId: null,
        amount: 1000,
        planAmount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequencyType: 3,
        frequencyTypeVariable: 1,
        frequencyMonthOfYear: null,
        frequencyDayOfMonth: null,
        frequencyDayOfWeek: null,
        frequencyWeekOfMonth: null,
        interestFrequencyType: 2,
        interestRate: 0,
        subsidized: 0.05,
        beginDate: '2020-01-01',
        nextDate: '2021-01-01',
        fullyPaidBackDate: '2030-01-01',
        dateCreated: '2020-01-01',
        dateModified: '2020-01-01',
    },
];

describe('GET /api/loans', () => {
    it('should respond with an array of loans', async () => {
        // Arrange
        mockModule([loans], loans);

        mockRequest.query = { accountId: null };

        const { getLoans } = await import(
            '../../src/controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loans);
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { accountId: null };

        const { getLoans } = await import(
            '../../src/controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting loans',
            });
        });
    });

    it('should respond with an array of loans with account id', async () => {
        // Arrange
        mockModule(
            [loans.filter((loan) => loan.accountId === 1)],
            loans.filter((loan) => loan.accountId === 1),
        );

        mockRequest.query = { accountId: 1 };

        const { getLoans } = await import(
            '../../src/controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            loans.filter((loan) => loan.accountId === 1),
        );
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        mockModule([]);

        mockRequest.query = { accountId: 1 };

        const { getLoans } = await import(
            '../../src/controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting loans for given account id',
            });
        });
    });
});

describe('GET /api/loans/:id', () => {
    it('should respond with an array of loans with id', async () => {
        // Arrange
        mockModule(
            [loans.filter((loan) => loan.id === 1)],
            loans.filter((loan) => loan.id === 1),
        );

        const { getLoansById } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: null };

        // Call the function with the mock request and response
        await getLoansById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            loans.filter((loan) => loan.id === 1),
        );
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        mockModule([]);

        const { getLoansById } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getLoansById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting loan',
            });
        });
    });

    it('should respond with an array of loans with account id and id', async () => {
        // Arrange
        mockModule(
            [
                loans
                    .filter((loan) => loan.accountId === 1)
                    .filter((loan) => loan.id === 1),
            ],
            loans
                .filter((loan) => loan.accountId === 1)
                .filter((loan) => loan.id === 1),
        );

        const { getLoans } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            loans
                .filter((loan) => loan.accountId === 1)
                .filter((loan) => loan.id === 1),
        );
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        mockModule([]);

        const { getLoansById } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.query = { accountId: 1 };

        // Call the function with the mock request and response
        await getLoansById(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error getting loan',
            });
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getLoansById } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.query = { accountId: 3 };

        // Act
        await getLoansById(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});

describe('POST /api/loans', () => {
    it('should respond with the created loan', async () => {
        mockModule(
            [
                [],
                [],
                [{ id: 1, unique_id: 'vde38cv8c' }],
                [{ id: 2, unique_id: 'bvw8obvwi' }],
                loans.filter((loan) => loan.id === 1),
                [],
                [],
            ],
            loans.filter((loan) => loan.id === 1),
        );

        const { createLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.body = {
            accountId: 1,
            taxId: null,
            amount: 10000,
            planAmount: 100,
            recipient: 'Test Loan Recipient',
            title: 'Test Loan',
            description: 'Test Loan to test the loan route',
            frequency: {
                type: 2,
                typeVariable: 1,
                monthOfYear: null,
                dayOfMonth: null,
                dayOfWeek: null,
                weekOfMonth: null,
            },
            interestFrequencyType: 2,
            interestRate: 0,
            subsidized: 0,
            beginDate: '2020-01-02',
        };

        await createLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(
            loans.filter((loan) => loan.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        const { createLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.body = loans.filter((loan) => loan.id === 1);

        await createLoan(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error creating loan',
            });
        });
    });
});

describe('PUT /api/loans/:id', () => {
    it('should respond with the updated loan', async () => {
        mockModule(
            [
                [{ id: 1, cron_job_id: 1, interest_cron_job_id: 1 }],
                [{ unique_id: 'bo8vouvvo' }],
                [],
                [],
                [],
                [{ unique_id: 'vy8vvivl' }],
                [],
                [],
                [],
                [],
                [],
                loans.filter((loan) => loan.id === 1),
                [],
            ],
            loans.filter((loan) => loan.id === 1),
        );

        const { updateLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = {
            accountId: 1,
            taxId: null,
            amount: 10000,
            planAmount: 100,
            recipient: 'Test Loan Recipient',
            title: 'Test Loan',
            description: 'Test Loan to test the loan route',
            frequency: {
                type: 2,
                typeVariable: 1,
                monthOfYear: null,
                dayOfMonth: null,
                dayOfWeek: null,
                weekOfMonth: null,
            },
            interestFrequencyType: 2,
            interestRate: 0,
            subsidized: 0,
            beginDate: '2020-01-02',
        };

        await updateLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
            loans.filter((loan) => loan.id === 1),
        );
    });

    it('should respond with an error message', async () => {
        mockModule([]);

        const { updateLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter((loan) => loan.id === 1);

        await updateLoan(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error updating loan',
            });
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = loans.filter((loan) => loan.id === 1);

        // Act
        await updateLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});

describe('DELETE /api/loans/:id', () => {
    it('should respond with a success message', async () => {
        // Arrange
        mockModule([
            [{ id: 1, cron_job_id: 1 }],
            [],
            [],
            [{ unique_id: 'v8ov8o8' }],
            [],
            [{ unique_id: 'vouy8v7piu' }],
            [],
            [],
            [],
            [],
        ]);

        const { deleteLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Loan deleted successfully',
        );
    });

    it('should respond with an error message', async () => {
        // Arrange
        mockModule([]);

        const { deleteLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse).catch(() => {
            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Error deleting loan',
            });
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteLoan } = await import(
            '../../src/controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deleteLoan(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});
