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
import { Loan } from '../../types/types.js';

jest.mock('../../config/winston', () => ({
    logger: {
        error: jest.fn(),
        info: jest.fn(),
    },
}));

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

const loans = [
    {
        loan_id: 1,
        cron_job_id: 1,
        account_id: 1,
        tax_id: null,
        loan_amount: 10000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0,
        loan_begin_date: '2020-01-02',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        loan_id: 2,
        cron_job_id: 2,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 0,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.15,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        loan_id: 3,
        cron_job_id: 3,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 1,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.1,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        loan_id: 4,
        cron_job_id: 4,
        account_id: 1,
        tax_id: null,
        loan_amount: 1000,
        loan_plan_amount: 100,
        loan_recipient: 'Test Loan Recipient',
        loan_title: 'Test Loan',
        loan_description: 'Test Loan to test the loan route',
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        loan_interest_frequency_type: 2,
        loan_interest_rate: 0,
        loan_subsidized: 0.05,
        loan_begin_date: '2020-01-01',
        loan_end_date: '2020-01-01',
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

const loansResponse: Loan[] = [
    {
        id: 1,
        account_id: 1,
        amount: 10000,
        plan_amount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequency_type: 2,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        interest_frequency_type: 2,
        interest_rate: 0,
        subsidized: 0,
        begin_date: '2020-01-02',
        end_date: '2020-01-01',
        fully_paid_back: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 2,
        account_id: 1,
        amount: 1000,
        plan_amount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequency_type: 0,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        interest_frequency_type: 2,
        interest_rate: 0,
        subsidized: 0.15,
        begin_date: '2020-01-01',
        end_date: '2020-01-01',
        fully_paid_back: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 3,
        account_id: 1,
        amount: 1000,
        plan_amount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequency_type: 1,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        interest_frequency_type: 2,
        interest_rate: 0,
        subsidized: 0.1,
        begin_date: '2020-01-01',
        end_date: '2020-01-01',
        fully_paid_back: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
    {
        id: 4,
        account_id: 1,
        amount: 1000,
        plan_amount: 100,
        recipient: 'Test Loan Recipient',
        title: 'Test Loan',
        description: 'Test Loan to test the loan route',
        frequency_type: 3,
        frequency_type_variable: null,
        frequency_month_of_year: null,
        frequency_day_of_month: null,
        frequency_day_of_week: null,
        frequency_week_of_month: null,
        interest_frequency_type: 2,
        interest_rate: 0,
        subsidized: 0.05,
        begin_date: '2020-01-01',
        end_date: '2020-01-01',
        fully_paid_back: null,
        date_created: '2020-01-01',
        date_modified: '2020-01-01',
    },
];

describe('GET /api/loans', () => {
    it('should respond with an array of loans', async () => {
        // Arrange
        mockModule([loans]);

        mockRequest.query = { id: null };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        loansResponse[0].fully_paid_back = '2024-01-01';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(loansResponse);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting loans';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: null };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loans',
        });
    });

    it('should respond with an array of loans with id', async () => {
        // Arrange
        mockModule([loans.filter((loan) => loan.loan_id === 1)]);

        mockRequest.query = { id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        const customLoansResponse = loansResponse.filter(
            (loan) => loan.id === 1,
        );

        // Add loan_fully_paid_back to the loans with id 1
        customLoansResponse[0].fully_paid_back = '2024-01-01';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(customLoansResponse);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([], [errorMessage]);

        mockRequest.query = { id: 1 };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loan',
        });
    });

    it('should respond with an array of loans with account id', async () => {
        // Arrange
        mockModule([loans.filter((loan) => loan.account_id === 1)]);

        mockRequest.query = { account_id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        const customLoansResponse = loansResponse.filter(
            (loan) => loan.account_id === 1,
        );

        // Add loan_fully_paid_back to the loans with id 1
        customLoansResponse[0].fully_paid_back = '2024-01-01';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(customLoansResponse);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: 1 };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loans for given account_id',
        });
    });

    it('should respond with an array of loans with account id and id', async () => {
        // Arrange
        mockModule([
            loans
                .filter((loan) => loan.account_id === 1)
                .filter((loan) => loan.loan_id === 1),
        ]);

        mockRequest.query = { account_id: 1, id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        const customLoansResponse = loansResponse.filter(
            (loan) => loan.id === 1,
        );

        // Add loan_fully_paid_back to the loans with id 1
        customLoansResponse[0].fully_paid_back = '2024-01-01';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(customLoansResponse);
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([], [errorMessage]);

        mockRequest.query = { account_id: 1, id: 1 };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loan',
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.query = { id: 3 };

        // Act
        await getLoans(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });
});

describe('POST /api/loans', () => {
    it('should populate request.loan_id', async () => {
        mockModule(
            [loans.filter((loan) => loan.loan_id === 1), '1', '2', []],
            [],
            [[]],
        );

        const { createLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = loans[0];

        await createLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.loan_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating loan';
        mockModule([], [errorMessage]);

        const { createLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        await createLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating loan',
        });
    });

    it('should respond with an error message in the return object', async () => {
        const errorMessage = 'Error creating loan';
        mockModule([], [errorMessage]);

        const { createLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        await createLoanReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating loan',
        });
    });

    it('should respond with the created loan', async () => {
        mockModule([loans.filter((loan) => loan.loan_id === 1), '1', '2', []]);

        const { createLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = loans[0];
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        await createLoanReturnObject(mockRequest as Request, mockResponse);

        const customLoansResponse = loansResponse.filter(
            (loan) => loan.id === 1,
        );

        customLoansResponse[0].fully_paid_back = '2024-01-01';

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(customLoansResponse);
    });
});

describe('PUT /api/loans/:id', () => {
    it('should call next in the middleware', async () => {
        mockModule(
            [
                loans.filter((loan) => loan.loan_id === 1),
                [{ unique_id: 1 }],
                [{ unique_id: null }],
                [],
            ],
            [],
            [[]],
            [[]],
        );

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.loan_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error updating loan';
        mockModule([], [errorMessage]);

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating loan',
        });
    });

    it('should respond with an error message on return object', async () => {
        const errorMessage = 'Error updating loan';
        mockModule([], [errorMessage]);

        const { updateLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        await updateLoanReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loan',
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);

        // Act
        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });

    it('should respond with the updated loan', async () => {
        mockModule([loans.filter((loan) => loan.loan_id === 1)]);

        const { updateLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = loans.filter((loan) => loan.loan_id === 1);
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const customLoansResponse = loansResponse.filter(
            (loan) => loan.id === 1,
        );

        customLoansResponse[0].fully_paid_back = '2024-01-01';

        await updateLoanReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(customLoansResponse);
    });
});

describe('DELETE /api/loans/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule(
            [
                loans.filter((loan) => loan.loan_id === 1),
                [],
                [{ unique_id: 1 }],
                [{ unique_id: null }],
                [],
                [],
            ],
            [],
            [[], []],
        );

        const { deleteLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error deleting loan';
        mockModule([], [errorMessage]);

        const { deleteLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error deleting loan',
        });
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        mockModule([[]]);

        const { deleteLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };

        // Act
        await deleteLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });

    it('should respond with a success message', async () => {
        // Arrange
        mockModule(['Loan deleted successfully']);

        const { deleteLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };

        await deleteLoanReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.send).toHaveBeenCalledWith(
            'Loan deleted successfully',
        );
    });
});
