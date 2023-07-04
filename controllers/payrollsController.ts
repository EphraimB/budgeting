import { Request, Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface PayrollInput {
    start_date: string;
    end_date: string;
    work_days: string;
    gross_pay: string;
    net_pay: string;
    hours_worked: string;
}

interface PayrollOutput {
    start_date: string;
    end_date: string;
    work_days: number;
    gross_pay: number;
    net_pay: number;
    hours_worked: number;
}

/**
 * 
 * @param payroll - Payroll object
 * @returns - Payroll object with parsed values
 */
const payrollsParse = (payroll: PayrollInput): PayrollOutput => ({
    start_date: payroll.start_date,
    end_date: payroll.end_date,
    work_days: parseInt(payroll.work_days),
    gross_pay: parseFloat(payroll.gross_pay),
    net_pay: parseFloat(payroll.net_pay),
    hours_worked: parseFloat(payroll.hours_worked)
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payrolls
 */
export const getPayrolls = async (request: Request, response: Response): Promise<void> => {
    try {
        const { employee_id } = request.query;

        const results = await executeQuery<PayrollInput>(payrollQueries.getPayrolls, [employee_id]);

        if (results.length === 0) {
            response.status(404).send('No payrolls for employee or not found');
            return;
        }

        // Parse the data to correct format and return an object
        const payrolls: PayrollOutput[] = results.map(payroll => payrollsParse(payroll));

        const returnObj = {
            employee_id,
            payrolls
        };

        response.status(200).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error getting payrolls');
    }
};
