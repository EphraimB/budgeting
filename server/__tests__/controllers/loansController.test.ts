import { jest } from '@jest/globals';
import { type Request, type Response } from 'express';
import { parseIntOrFallback } from '../../utils/helperFunctions.js';

/**
 *
 * @param loan - Loan object
 * @returns - Parsed loan object
 */
const parseLoans = (loan: any) => ({
    id: loan.loan_id,
    interest_rate: loan.loan_interest_rate,
    amount: loan.loan_amount,
    plan_amount: loan.loan_plan_amount,
    title: loan.loan_title,
    description: loan.loan_description,
    subsidized: loan.loan_subsidized,
    recipient: loan.loan_recipient,
    frequency_type: loan.frequency_type,
    frequency_type_variable: loan.frequency_type_variable,
    frequency_day_of_month: loan.frequency_day_of_month,
    frequency_day_of_week: loan.frequency_day_of_week,
    frequency_week_of_month: loan.frequency_week_of_month,
    frequency_month_of_year: loan.frequency_month_of_year,
    interest_frequency_type: loan.loan_interest_frequency_type,
    account_id: loan.account_id,
    begin_date: loan.loan_begin_date,
    end_date: loan.loan_end_date,
    date_created: loan.date_created,
    date_modified: loan.date_modified,
    fully_paid_back: loan.loan_fully_paid_back,
});

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

/**
 *
 * @param executeQueryResponses - Array of responses for executeQuery
 * @param handleErrorResponses - Array of responses for handleError
 * @param scheduleQueryResponses - Array of responses for scheduleQuery
 * @param unscheduleQueryResponses - Array of responses for unscheduleQuery
 * Mock module with mock implementations for executeQuery, handleError, scheduleQuery, and unscheduleQuery
 */
const mockModule = (
    executeQueryResponses: any = [], // Array of responses for executeQuery
    handleErrorResponses: any = [], // Array of responses for handleError
    scheduleQueryResponses: any = [], // Array of responses for scheduleQuery
    unscheduleQueryResponses: any = [], // Array of responses for unscheduleQuery
) => {
    const executeQuery = jest.fn();
    const handleError = jest.fn();
    const scheduleQuery = jest.fn();
    const unscheduleQuery = jest.fn();

    // Set up mock implementations for executeQuery
    executeQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            executeQuery.mockImplementationOnce(() => Promise.reject(response));
        } else {
            executeQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for handleError
    handleErrorResponses.forEach((response: any) => {
        handleError.mockImplementationOnce((res: any, message: any) => {
            res.status(response.status || 400).json({
                message: response.message || message,
            });
        });
    });

    // Set up mock implementations for scheduleQuery
    scheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            scheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    // Set up mock implementations for unscheduleQuery
    unscheduleQueryResponses.forEach((response: Response) => {
        if (response instanceof Error) {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.reject(response),
            );
        } else {
            unscheduleQuery.mockImplementationOnce(() =>
                Promise.resolve(response),
            );
        }
    });

    jest.mock('../../utils/helperFunctions.js', () => ({
        executeQuery,
        handleError,
        scheduleQuery,
        unscheduleQuery,
        parseIntOrFallback,
        nextTransactionFrequencyDate: jest.fn().mockReturnValue('2020-01-01'),
    }));
};

describe('GET /api/loans', () => {
    it('should respond with an array of loans', async () => {
        // Arrange
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
                loan_fully_paid_back: '2024-01-01',
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
                loan_fully_paid_back: null,
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([loans]);

        mockRequest.query = { id: null };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        const modifiedLoans = loans.map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message', async () => {
        // Arrange
        const errorMessage = 'Error getting loans';
        mockModule([[null]], [errorMessage]);

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
                loan_fully_paid_back: '2024-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([loans]);

        mockRequest.query = { id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Add loan_fully_paid_back to the loans with id 1
        // loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans.map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([[null]], [errorMessage]);

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
                loan_fully_paid_back: '2024-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([loans]);

        mockRequest.query = { account_id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        const modifiedLoans = loans.map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with account id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([null], [errorMessage]);

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
                loan_fully_paid_back: '2024-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([loans]);

        mockRequest.query = { account_id: 1, id: 1 };
        mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

        const { getLoans } = await import(
            '../../controllers/loansController.js'
        );

        // Call the function with the mock request and response
        await getLoans(mockRequest as Request, mockResponse);

        // Add loan_fully_paid_back to the loans with id 1
        loans[0].loan_fully_paid_back = '2024-01-01';

        const modifiedLoans = loans.map((loan) => parseLoans(loan));

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
    });

    it('should respond with an error message with account id and id', async () => {
        // Arrange
        const errorMessage = 'Error getting loan';
        mockModule([null], [errorMessage]);

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
                loan_fully_paid_back: '2024-01-01',
                date_created: '2020-01-01',
                date_modified: '2020-01-01',
            },
        ];

        mockModule([loans, '1', '2', []], [], [[]]);

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
        mockModule([null], [errorMessage]);

        const { createLoan } = await import(
            '../../controllers/loansController.js'
        );

        mockRequest.body = {
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
            loan_fully_paid_back: '2024-01-01',
            date_created: '2020-01-01',
            date_modified: '2020-01-01',
        };

        await createLoan(mockRequest as Request, mockResponse, mockNext);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            message: 'Error creating loan',
        });
    });
});

//     it('should respond with an error message in the return object', async () => {
//         const errorMessage = 'Error creating loan';
//         const error = new Error(errorMessage);
//         mockModule([null], errorMessage);

//         const { createLoanReturnObject } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.body = loans.filter((loan) => loan.id === 1);

//         await createLoanReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error creating loan',
//         });
//     });

//     it('should respond with the created loan', async () => {
//         const newLoan = loans.filter((loan) => loan.id === 1);

//         mockModule([newLoan]);

//         const { createLoanReturnObject } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.body = newLoan;
//         mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

//         await createLoanReturnObject(mockRequest as Request, mockResponse);

//         loans[0].loan_fully_paid_back = '2024-01-01';

//         const modifiedLoans = loans
//             .filter((loan) => loan.id === 1)
//             .map((loan) => parseLoans(loan));

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(201);
//         expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
//     });
// });

// describe('PUT /api/loans/:id', () => {
//     it('should call next in the middleware', async () => {
//         const updatedLoan = {
//             account_id: 1,
//             loan_id: 1,
//             amount: 1000,
//             plan_amount: 100,
//             recipient: 'John Doe',
//             title: 'Test Loan',
//             description: 'Test Loan Description',
//             frequency_type: 2,
//             interest_rate: 0,
//             interest_frequency_type: 0,
//             begin_date: '2021-01-01',
//         };

//         mockModule([[updatedLoan]]);

//         const { updateLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedLoan;

//         await updateLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockRequest.loan_id).toBe(1);
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         const updatedLoan = {
//             account_id: 1,
//             loan_id: 1,
//             amount: 1000,
//             plan_amount: 100,
//             recipient: 'John Doe',
//             title: 'Test Loan',
//             description: 'Test Loan Description',
//             frequency_type: 2,
//             interest_rate: 0,
//             interest_frequency_type: 0,
//             begin_date: '2021-01-01',
//         };
//         const errorMessage = 'Error updating loan';
//         const error = new Error(errorMessage);
//         mockModule([[updatedLoan]], errorMessage);

//         const { updateLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedLoan;

//         await updateLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error updating loan',
//         });
//     });

//     it('should respond with an error message on return object', async () => {
//         const updatedLoan = {
//             account_id: 1,
//             loan_id: 1,
//             amount: 1000,
//             plan_amount: 100,
//             recipient: 'John Doe',
//             title: 'Test Loan',
//             description: 'Test Loan Description',
//             frequency_type: 2,
//             interest_rate: 0,
//             interest_frequency_type: 0,
//             begin_date: '2021-01-01',
//         };
//         const errorMessage = 'Error updating loan';
//         const error = new Error(errorMessage);
//         mockModule([[updatedLoan]], errorMessage);

//         const { updateLoanReturnObject } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedLoan;

//         await updateLoanReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error getting loan',
//         });
//     });

//     it('should respond with a 404 error message when the loan does not exist', async () => {
//         // Arrange
//         const updatedLoan = {
//             account_id: 1,
//             loan_id: 1,
//             amount: 1000,
//             plan_amount: 100,
//             recipient: 'John Doe',
//             title: 'Test Loan',
//             description: 'Test Loan Description',
//             frequency_type: 2,
//             interest_rate: 0,
//             interest_frequency_type: 0,
//             begin_date: '2021-01-01',
//         };
//         mockModule([[]]);

//         const { updateLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 3 };
//         mockRequest.body = updatedLoan;

//         // Act
//         await updateLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
//     });

//     it('should respond with the updated loan', async () => {
//         const updatedLoan = loans.filter((loan) => loan.id === 1);

//         mockModule([updatedLoan]);

//         const { updateLoanReturnObject } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };
//         mockRequest.body = updatedLoan;
//         mockRequest.fullyPaidBackDates = { 1: '2024-01-01' };

//         await updateLoanReturnObject(mockRequest as Request, mockResponse);

//         loans[0].loan_fully_paid_back = '2024-01-01';

//         const modifiedLoans = loans
//             .filter((loan) => loan.id === 1)
//             .map((loan) => parseLoans(loan));

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.json).toHaveBeenCalledWith(modifiedLoans);
//     });
// });

// describe('DELETE /api/loans/:id', () => {
//     it('should call next on the middleware', async () => {
//         // Arrange
//         mockModule(['Loan deleted successfully']);

//         const { deleteLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockNext).toHaveBeenCalled();
//     });

//     it('should respond with an error message', async () => {
//         // Arrange
//         const errorMessage = 'Error deleting loan';
//         const error = new Error(errorMessage);
//         mockModule([null], errorMessage);

//         const { deleteLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(400);
//         expect(mockResponse.json).toHaveBeenCalledWith({
//             message: 'Error deleting loan',
//         });
//     });

//     it('should respond with a 404 error message when the loan does not exist', async () => {
//         // Arrange
//         mockModule([[]]);

//         const { deleteLoan } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 3 };

//         // Act
//         await deleteLoan(mockRequest as Request, mockResponse, mockNext);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(404);
//         expect(mockResponse.send).toHaveBeenCalledWith('Loan not found');
//     });

//     it('should respond with a success message', async () => {
//         // Arrange
//         mockModule(['Loan deleted successfully']);

//         const { deleteLoanReturnObject } = await import(
//             '../../controllers/loansController.js'
//         );

//         mockRequest.params = { id: 1 };

//         await deleteLoanReturnObject(mockRequest as Request, mockResponse);

//         // Assert
//         expect(mockResponse.status).toHaveBeenCalledWith(200);
//         expect(mockResponse.send).toHaveBeenCalledWith(
//             'Loan deleted successfully',
//         );
//     });
// });
