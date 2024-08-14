import { type Request, type Response } from 'express';
import { jobQueries, payrollQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { type Payroll } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param payroll - Payroll object
 * @returns - Payroll object with parsed values
 */
const payrollsParse = (payroll: Record<string, string>): Payroll => ({
    startDate: payroll.start_date,
    endDate: payroll.end_date,
    workDays: parseInt(payroll.work_days),
    grossPay: parseFloat(payroll.gross_pay),
    netPay: parseFloat(payroll.net_pay),
    hoursWorked: parseFloat(payroll.hours_worked),
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
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { jobId } = request.query;
        let returnObj: object = {};

        if (!jobId) {
            // Get all payrolls for all jobs
            const { rows } = await client.query(jobQueries.getJobs, []);

            if (rows.length === 0) {
                response.status(404).send('No jobs found');
                return;
            }

            await Promise.all(
                rows.map(async (row) => {
                    const { rows: results } = await client.query(
                        payrollQueries.getPayrolls,
                        [row.job_id],
                    );

                    returnObj = {
                        jobId: row.job_id,
                        jobName: row.job_name,
                        payrolls: results.map((payroll) =>
                            payrollsParse(payroll),
                        ),
                    };
                }),
            );
        } else {
            const { rows } = await client.query(payrollQueries.getPayrolls, [
                jobId,
            ]);

            if (rows.length === 0) {
                response.status(404).send('No payrolls for job or not found');
                return;
            }

            // Parse the data to correct format and return an object
            const payrolls: Payroll[] = rows.map((row) => payrollsParse(row));

            const { rows: jobResults } = await client.query(jobQueries.getJob, [
                jobId,
            ]);

            returnObj = {
                jobId: parseInt(jobId as string),
                jobName: jobResults[0].job_name,
                payrolls,
            };
        }

        response.status(200).json(returnObj);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payrolls');
    } finally {
        client.release(); // Release the client back to the pool
    }
};
