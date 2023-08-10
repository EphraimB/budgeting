import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { exec } from 'child_process';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type PayrollTax } from '../types/types.js';
import { logger } from '../config/winston.js';

interface PayrollTaxInput {
    payroll_taxes_id: string;
    employee_id: string;
    name: string;
    rate: string;
}

/**
 *
 * @param payrollTax - Payroll tax object
 * @returns - Payroll tax object with parsed values
 */
const payrollTaxesParse = (payrollTax: PayrollTaxInput): PayrollTax => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    employee_id: parseInt(payrollTax.employee_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate),
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll taxes
 */
export const getPayrollTaxes = async (
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
            query = payrollQueries.getPayrollTaxesByIdAndEmployeeId;
            params = [id, employee_id];
        } else if (id !== null && id !== undefined) {
            query = payrollQueries.getPayrollTaxesById;
            params = [id];
        } else if (employee_id !== null && employee_id !== undefined) {
            query = payrollQueries.getPayrollTaxesByEmployeeId;
            params = [employee_id];
        } else {
            query = payrollQueries.getAllPayrollTaxes;
            params = [];
        }

        const rows = await executeQuery<PayrollTaxInput>(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (employee_id !== null && employee_id !== undefined)) &&
            rows.length === 0
        ) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = rows.map((payrollTax) =>
            payrollTaxesParse(payrollTax),
        );

        response.status(200).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'payroll tax'
                    : employee_id !== null && employee_id !== undefined
                    ? 'payroll taxes for given employee_id'
                    : 'payroll taxes'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a POST request to the database to create a payroll tax
 */
export const createPayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery<PayrollTaxInput>(
            payrollQueries.createPayrollTax,
            [employee_id, name, rate],
        );

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${employee_id}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                logger.error(`Error executing script: ${error.message}`);
                response
                    .status(500)
                    .send(
                        'Failed to execute script for updating cron job payrolls information',
                    );
                return;
            }
            logger.info(`Script output: ${stdout}`);
        });

        const payrollTaxes: PayrollTax[] = results.map((payrollTax) =>
            payrollTaxesParse(payrollTax),
        );

        request.payroll_taxes_id = payrollTaxes[0].payroll_taxes_id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll tax');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve a payroll tax
 */
export const createPayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { payroll_taxes_id } = request;

    try {
        const results = await executeQuery<PayrollTaxInput>(
            payrollQueries.getPayrollTaxesById,
            [payroll_taxes_id],
        );

        if (results.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = results.map((payrollTax) =>
            payrollTaxesParse(payrollTax),
        );

        response.status(201).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payroll tax');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update a payroll tax
 */
export const updatePayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery<PayrollTaxInput>(
            payrollQueries.updatePayrollTax,
            [name, rate, id],
        );

        if (results.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${employee_id}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                logger.error(`Error executing script: ${error.message}`);
                response
                    .status(500)
                    .send(
                        'Failed to execute script for updating cron job payrolls information',
                    );
                return;
            }
            logger.info(`Script output: ${stdout}`);
        });

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll tax');
    }
};

export const updatePayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    try {
        const results = await executeQuery<PayrollTaxInput>(
            payrollQueries.getPayrollTaxesById,
            [id],
        );

        if (results.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTax[] = results.map((payrollTax) =>
            payrollTaxesParse(payrollTax),
        );

        response.status(200).json(payrollTaxes);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payroll tax');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a DELETE request to the database to delete a payroll tax
 */
export const deletePayrollTax = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    try {
        const getResults = await executeQuery<PayrollTaxInput>(
            payrollQueries.getPayrollTaxesById,
            [id],
        );

        if (getResults.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await executeQuery(payrollQueries.deletePayrollTax, [id]);

        // Define the script command
        const scriptCommand: string = `/app/dist/scripts/getPayrollsByEmployee.sh ${parseInt(
            getResults[0].employee_id,
        )}`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                logger.error(`Error executing script: ${error.message}`);
                response
                    .status(500)
                    .send(
                        'Failed to execute script for updating cron job payrolls information',
                    );
            }
        });

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll tax');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete a payroll tax
 */
export const deletePayrollTaxReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Successfully deleted payroll tax');
};
