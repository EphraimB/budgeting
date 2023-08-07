import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { exec } from 'child_process';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type PayrollDate } from '../types/types.js';

interface PayrollDateInput {
    payroll_date_id: string;
    employee_id: string;
    payroll_start_day: string;
    payroll_end_day: string;
}

/**
 *
 * @param payrollDate - Payroll date object
 * @returns - Payroll date object with parsed values
 */
const payrollDatesParse = (payrollDate: PayrollDateInput): PayrollDate => ({
    payroll_date_id: parseInt(payrollDate.payroll_date_id),
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

        if (id && employee_id) {
            query = payrollQueries.getPayrollDatesByIdAndEmployeeId;
            params = [id, employee_id];
        } else if (id) {
            query = payrollQueries.getPayrollDatesById;
            params = [id];
        } else if (employee_id) {
            query = payrollQueries.getPayrollDatesByEmployeeId;
            params = [employee_id];
        } else {
            query = payrollQueries.getAllPayrollDates;
            params = [];
        }

        const results = await executeQuery<PayrollDateInput>(query, params);

        if ((id || employee_id) && results.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id
                    ? 'payroll date'
                    : employee_id
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

        const results = await executeQuery<PayrollDateInput>(
            payrollQueries.createPayrollDate,
            [employee_id, start_day, end_day],
        );

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${employee_id}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                console.error(`Error executing script: ${error}`);
                response.status(500).send('Error executing script');
                return;
            }
            console.log(`Script output: ${stdout}`);
        });

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        request.payroll_date_id = payrollDates[0].payroll_date_id;

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    }
};

export const createPayrollDateReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payroll_date_id } = request;

    try {
        const results = await executeQuery<PayrollDateInput>(
            payrollQueries.getPayrollDatesById,
            [payroll_date_id],
        );

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(201).json(payrollDates);
    } catch (error) {
        console.error(error); // Log the error on the server side
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

        const results = await executeQuery<PayrollDateInput>(
            payrollQueries.updatePayrollDate,
            [start_day, end_day, id],
        );

        if (results.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${employee_id}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                console.error(`Error executing script: ${error}`);
                response.status(500).send('Error executing script');
            }
        });

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
        const results = await executeQuery<PayrollDateInput>(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        // Parse the data to correct format and return an object
        const payrollDates: PayrollDate[] = results.map((payrollDate) =>
            payrollDatesParse(payrollDate),
        );

        response.status(200).json(payrollDates);
    } catch (error) {
        console.error(error); // Log the error on the server side
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

        const getResults = await executeQuery<PayrollDateInput>(
            payrollQueries.getPayrollDatesById,
            [id],
        );

        if (getResults.length === 0) {
            response.status(404).send('Payroll date not found');
            return;
        }

        await executeQuery(payrollQueries.deletePayrollDate, [id]);

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${parseInt(
            getResults[0].employee_id,
        )}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                console.error(`Error executing script: ${error}`);
                response.status(500).send('Error executing script');
            }
        });

        next();
    } catch (error) {
        console.error(error); // Log the error on the server side
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
