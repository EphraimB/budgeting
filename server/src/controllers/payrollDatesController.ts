import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type PayrollDate } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param payrollDate - Payroll date object
 * @returns - Payroll date object with parsed values
 */
const payrollDatesParse = (
    payrollDate: Record<string, string>,
): PayrollDate => ({
    id: parseInt(payrollDate.payroll_date_id),
    job_id: parseInt(payrollDate.job_id),
    payroll_day: parseInt(payrollDate.payroll_day),
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll dates
 */
export const getPayrollDates = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { job_id, id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (id && job_id) {
            query = payrollQueries.getPayrollDatesByIdAndJobId;
            params = [id, job_id];
        } else if (id) {
            query = payrollQueries.getPayrollDatesById;
            params = [id];
        } else if (job_id) {
            query = payrollQueries.getPayrollDatesByJobId;
            params = [job_id];
        } else {
            query = payrollQueries.getAllPayrollDates;
            params = [];
        }

        const results = await executeQuery(query, params);

        if (id && results.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'payroll date'
                    : job_id
                    ? 'payroll dates for given job_id'
                    : 'payroll dates'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to toggle a payroll date
 */
export const togglePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { job_id, payroll_day } = request.body;

    try {
        const results = await executeQuery(
            payrollQueries.getPayrollDateByJobIdAndPayrollDay,
            [job_id, payroll_day],
        );

        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        if (results[0].payroll_day) {
            await executeQuery(payrollQueries.deletePayrollDate, [
                results[0].payroll_date_id,
            ]);
        } else {
            await executeQuery(payrollQueries.createPayrollDate, [
                job_id,
                payroll_day,
            ]);

            await executeQuery('SELECT process_payroll_for_job($1)', [job_id]);
        }

        request.payroll_date_id = payrollDates[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting, creating, or updating payroll dates for the day of ${payroll_day} of job id of ${job_id}`,
        );
    }
};

export const togglePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payroll_date_id } = request;

    try {
        response
            .status(201)
            .json(
                `Payroll date for payroll date id of ${payroll_date_id} toggled`,
            );
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error toggling payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to create a new payroll date
 */
export const createPayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { job_id, payroll_day } = request.body;

        const results = await executeQuery(payrollQueries.createPayrollDate, [
            job_id,
            payroll_day,
        ]);

        await executeQuery('SELECT process_payroll_for_job($1)', [job_id]);

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        request.payroll_date_id = payrollDates[0].id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    }
};

export const createPayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payroll_date_id } = request;

    try {
        const results = await executeQuery(payrollQueries.getPayrollDatesById, [
            payroll_date_id,
        ]);

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(201).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a payroll date
 */
export const updatePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { id } = request.params;
        const { job_id, payroll_day } = request.body;

        const results = await executeQuery(payrollQueries.updatePayrollDate, [
            job_id,
            payroll_day,
            id,
        ]);

        if (results.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await executeQuery('SELECT process_payroll_for_job($1)', [job_id]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a payroll date
 */
export const updatePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    try {
        const results = await executeQuery(payrollQueries.getPayrollDatesById, [
            id,
        ]);

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a DELETE request to the database to delete a payroll date
 */
export const deletePayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { id } = request.params;

        const getResults = await executeQuery(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        if (getResults.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await executeQuery(payrollQueries.deletePayrollDate, [id]);

        // await executeQuery('SELECT process_payroll_for_job($1)', [1]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll date');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a payroll date
 */
export const deletePayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Successfully deleted payroll date');
};
