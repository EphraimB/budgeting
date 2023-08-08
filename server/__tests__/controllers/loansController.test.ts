import { jest } from '@jest/globals';
import { loans } from '../../models/mockData.js';
import { type Request, type Response } from 'express';
import { type QueryResultRow } from 'pg';
import { parseOrFallback } from '../../utils/helperFunctions.js';

/**
 *
 * @param loan - Loan object
 * @returns - Parsed loan object
 */
const parseLoans = (loan: any) => ({
    loan_id: loan.loan_id,
    loan_interest_rate: loan.loan_interest_rate,
    loan_amount: loan.loan_amount,
    loan_plan_amount: loan.loan_plan_amount,
    loan_title: loan.loan_title,
    loan_description: loan.loan_description,
    loan_subsidized: loan.loan_subsidized,
    loan_recipient: loan.loan_recipient,
    frequency_type: loan.frequency_type,
    frequency_type_variable: loan.frequency_type_variable,
    frequency_day_of_month: loan.frequency_day_of_month,
    frequency_day_of_week: loan.frequency_day_of_week,
    frequency_week_of_month: loan.frequency_week_of_month,
    frequency_month_of_year: loan.frequency_month_of_year,
    loan_interest_frequency_type: loan.loan_interest_frequency_type,
    account_id: loan.account_id,
    loan_begin_date: loan.loan_begin_date,
    loan_end_date: loan.loan_end_date,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
    loan_fully_paid_back: loan.loan_fully_paid_back,
});

jest.mock('../../crontab/scheduleCronJob.js', () => {
    return jest.fn().mockImplementation(
        async () =>
            await Promise.resolve({
                cronDate: '0 0 16 * *',
                uniqueId: '123',
            }),
    );
});

jest.mock('../../crontab/deleteCronJob.js', () => {
    return jest
        .fn()
        .mockImplementation(async () => await Promise.resolve('123'));
});

// Mock request and response
let mockRequest: any;
let mockResponse: any;
let mockNext: any;
let consoleSpy: any;

beforeAll(() => {
    // Create a spy on console.error before all tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

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

afterAll(() => {
    // Restore console.error
    consoleSpy.mockRestore();
});

/**
 *
 * @param executeQueryValue - The value to be returned by the executeQuery mock function
 * @param [errorMessage] - The error message to be passed to the handleError mock function
 * @returns - A mock module with the executeQuery and handleError functions
 */
const mockModule = (
    executeQueryValues: Array<QueryResultRow[] | string | null>,
    errorMessage: string | null = null,
) => {
    const executeQuery =
        errorMessage !== null && errorMessage !== undefined
            ? jest.fn(async () => await Promise.reject(new Error(errorMessage)))
            : jest.fn(async () => {
                  let i = 0;
                  return await Promise.resolve(
                      i < executeQueryValues.length
                          ? executeQueryValues[i++]
                          : null,
                  );
              });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError: jest.fn((res: Response, message: string) => {
            res.status(400).json({ message });
        }),
        parseOrFallback,
    }));
};

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

        // Add loan_fully_paid_back to the loans with id 1
        loans[0].loan_fully_paid_back = '2024-01-01';
        loans[1].loan_fully_paid_back = null;
        loans[2].loan_fully_paid_back = null;
        loans[3].loan_fully_paid_back = null;

        const modifiedLoans = loans.map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting loans';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
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

        // Add loan_fully_paid_back to the loans with id 1
        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans
            .filter((loan) => loan.loan_id === 1)
            .map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
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

        // Add loan_fully_paid_back to the loans with id 1
        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans
            .filter((loan) => loan.account_id === 1)
            .map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an array of loans with account id and id', async () => {
        // Arrange
        mockModule([
            loans.filter((loan) => loan.account_id === 1 && loan.loan_id === 1),
        ]);

        mockRequest.query = { account_id: 1, id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Add loan_fully_paid_back to the loans with id 1
        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans
            .filter((loan) => loan.loan_id === 1)
            .map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
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
        const newLoan = loans.filter((loan) => loan.loan_id === 1)[0];

        mockModule([[newLoan], '1', '2', []]);

        const { createLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = {
            account_id: 1,
            amount: 1000,
            plan_amount: 1000,
            recipient: 'John Doe',
            title: 'Test Loan',
            description: 'Test Description',
            frequency_type: 2,
            frequency_type_variable: null,
            frequency_day_of_month: null,
            frequency_day_of_week: null,
            frequency_week_of_month: null,
            frequency_month_of_year: null,
            interest_rate: 0,
            interest_frequency_type: 2,
            subsidized: 0,
            begin_date: '2021-01-01',
        };

        await createLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.loan_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const errorMessage = 'Error creating loan';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an error message in the return object', async () => {
        const errorMessage = 'Error creating loan';
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with the created loan', async () => {
        const newLoan = loans.filter((loan) => loan.loan_id === 1);

        mockModule([newLoan]);

        const { createLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = newLoan;
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        await createLoanReturnObject(mockRequest as Request, mockResponse);

        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans
            .filter((loan) => loan.loan_id === 1)
            .map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(201);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });
});

describe('PUT /api/loans/:id', () => {
    it('should call next in the middleware', async () => {
        const updatedLoan = {
            account_id: 1,
            loan_id: 1,
            amount: 1000,
            plan_amount: 100,
            recipient: 'John Doe',
            title: 'Test Loan',
            description: 'Test Loan Description',
            frequency_type: 2,
            interest_rate: 0,
            interest_frequency_type: 0,
            begin_date: '2021-01-01',
        };

        mockModule([[updatedLoan]]);

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedLoan;

        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockRequest.loan_id).toBe(1);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should respond with an error message', async () => {
        const updatedLoan = {
            account_id: 1,
            loan_id: 1,
            amount: 1000,
            plan_amount: 100,
            recipient: 'John Doe',
            title: 'Test Loan',
            description: 'Test Loan Description',
            frequency_type: 2,
            interest_rate: 0,
            interest_frequency_type: 0,
            begin_date: '2021-01-01',
        };
        const errorMessage = 'Error updating loan';
        const error = new Error(errorMessage);
        mockModule([[updatedLoan]], errorMessage);

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedLoan;

        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error updating loan',
        });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with an error message on return object', async () => {
        const updatedLoan = {
            account_id: 1,
            loan_id: 1,
            amount: 1000,
            plan_amount: 100,
            recipient: 'John Doe',
            title: 'Test Loan',
            description: 'Test Loan Description',
            frequency_type: 2,
            interest_rate: 0,
            interest_frequency_type: 0,
            begin_date: '2021-01-01',
        };
        const errorMessage = 'Error updating loan';
        const error = new Error(errorMessage);
        mockModule([[updatedLoan]], errorMessage);

        const { updateLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedLoan;

        await updateLoanReturnObject(mockRequest as Request, mockResponse);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error getting loan',
        });

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    it('should respond with a 404 error message when the loan does not exist', async () => {
        // Arrange
        const updatedLoan = {
            account_id: 1,
            loan_id: 1,
            amount: 1000,
            plan_amount: 100,
            recipient: 'John Doe',
            title: 'Test Loan',
            description: 'Test Loan Description',
            frequency_type: 2,
            interest_rate: 0,
            interest_frequency_type: 0,
            begin_date: '2021-01-01',
        };
        mockModule([[]]);

        const { updateLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 3 };
        mockRequest.body = updatedLoan;

        // Act
        await updateLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(404);
        expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
    });

    it('should respond with the updated loan', async () => {
        const updatedLoan = loans.filter((loan) => loan.loan_id === 1);

        mockModule([updatedLoan]);

        const { updateLoanReturnObject } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.params = { id: 1 };
        mockRequest.body = updatedLoan;
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        await updateLoanReturnObject(mockRequest as Request, mockResponse);

        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans
            .filter((loan) => loan.loan_id === 1)
            .map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });
});

describe('DELETE /api/loans/:id', () => {
    it('should call next on the middleware', async () => {
        // Arrange
        mockModule(['Loan deleted successfully']);

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
        const error = new Error(errorMessage);
        mockModule([null], errorMessage);

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

        // Assert that console.error was called with the error message
        expect(consoleSpy).toHaveBeenCalledWith(error);
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
