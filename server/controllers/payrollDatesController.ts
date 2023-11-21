import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import {
    handleError,
    executeQuery,
} from '../utils/helperFunctions.js';
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
    employee_id: parseInt(payrollDate.employee_id),
    payroll_start_day: parseInt(payrollDate.payroll_start_day),
    payroll_end_day: parseInt(payrollDate.payroll_end_day),
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
    const { employee_id, id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (
            id !== null &&
            id !== undefined &&
            employee_id !== null &&
            employee_id !== undefined
        ) {
            query = payrollQueries.getPayrollDatesByIdAndEmployeeId;
            params = [id, employee_id];
        } else if (id !== null && id !== undefined) {
            query = payrollQueries.getPayrollDatesById;
            params = [id];
        } else if (employee_id !== null && employee_id !== undefined) {
            query = payrollQueries.getPayrollDatesByEmployeeId;
            params = [employee_id];
        } else {
            query = payrollQueries.getAllPayrollDates;
            params = [];
        }

        const results = await executeQuery(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (employee_id !== null && employee_id !== undefined)) &&
            results.length === 0
        ) {
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
                id !== null && id !== undefined
                    ? 'payroll date'
                    : employee_id !== null && employee_id !== undefined
                    ? 'payroll dates for given employee_id'
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
 * Sends a POST request to the database to create a new payroll date
 */
export const createPayrollDate = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const { employee_id, start_day, end_day } = request.body;

        const results = await executeQuery(payrollQueries.createPayrollDate, [
            employee_id,
            start_day,
            end_day,
        ]);

        await executeQuery('SELECT process_payroll_for_employee($1)', [
            1,
        ]);

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
        const { employee_id, start_day, end_day } = request.body;

        const results = await executeQuery(payrollQueries.updatePayrollDate, [
            start_day,
            end_day,
            id,
        ]);

        if (results.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await executeQuery('SELECT process_payroll_for_employee($1)', [
            1,
        ]);

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

        await executeQuery('SELECT process_payroll_for_employee($1)', [
            1,
        ]);

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
