import { type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type Payroll } from '../types/types.js';

interface PayrollInput {
    start_date: string;
    end_date: string;
    work_days: string;
    gross_pay: string;
    net_pay: string;
    hours_worked: string;
}

/**
 *
 * @param payroll - Payroll object
 * @returns - Payroll object with parsed values
 */
const payrollsParse = (payroll: PayrollInput): Payroll => ({
    start_date: payroll.start_date,
    end_date: payroll.end_date,
    work_days: parseInt(payroll.work_days),
    gross_pay: parseFloat(payroll.gross_pay),
    net_pay: parseFloat(payroll.net_pay),
    hours_worked: parseFloat(payroll.hours_worked),
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payrolls
 */
export const getPayrolls = async (
    request: Request,
    response: Response,
): Promise<void> => {
    try {
        const { employee_id } = request.query;

        const results = await executeQuery<PayrollInput>(
            payrollQueries.getPayrolls,
            [employee_id],
        );

        if (results.length === 0) {
            response.status(404).send('No payrolls for employee or not found');
            return;
        }

        // Parse the data to correct format and return an object
        const payrolls: Payroll[] = results.map((payroll) =>
            payrollsParse(payroll),
        );

        const returnObj = {
            employee_id: parseInt(employee_id as string),
            payrolls,
        };

        response.status(200).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting payrolls');
    }
};
