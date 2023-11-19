import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { exec } from 'child_process';
import {
    handleError,
    executeQuery,
    scheduleQuery,
} from '../utils/helperFunctions.js';
import { type Employee } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param employee - Employee object
 * @returns - Employee object with correct data types
 */
const employeeParse = (employee: Record<string, string>): Employee => ({
    employee_id: parseInt(employee.employee_id),
    name: employee.name,
    hourly_rate: parseFloat(employee.hourly_rate),
    regular_hours: parseInt(employee.regular_hours),
    vacation_days: parseInt(employee.vacation_days),
    sick_days: parseInt(employee.sick_days),
    work_schedule: employee.work_schedule,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all employees
 */
export const getEmployee = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { employee_id } = request.query;

    try {
        const query: string =
            employee_id !== null && employee_id !== undefined
                ? payrollQueries.getEmployee
                : payrollQueries.getEmployees;
        const params: any[] =
            employee_id !== null && employee_id !== undefined
                ? [employee_id]
                : [];

        const results = await executeQuery(query, params);

        if (
            employee_id !== null &&
            employee_id !== undefined &&
            results.length === 0
        ) {
            response.status(404).send('Employee not found');
            return;
        }

        // Parse the data to the correct format and return an object
        const employees: Employee[] = results.map((employee) =>
            employeeParse(employee),
        );

        response.status(200).json(employees);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                employee_id !== null && employee_id !== undefined
                    ? 'employee'
                    : 'employees'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new employee
 */
export const createEmployee = async (
    request: Request,
    response: Response,
): Promise<void> => {
    try {
        const {
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        } = request.body;

        const results = await executeQuery(payrollQueries.createEmployee, [
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        ]);

        // Parse the data to correct format and return an object
        const employees: Employee[] = results.map((employee) =>
            employeeParse(employee),
        );

        response.status(201).json(employees);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating employee');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a PUT request to the database to update an employee
 */
export const updateEmployee = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        const employee_id = parseInt(request.params.employee_id);
        const {
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
        } = request.body;

        const results = await executeQuery(payrollQueries.updateEmployee, [
            name,
            hourly_rate,
            regular_hours,
            vacation_days,
            sick_days,
            work_schedule,
            employee_id,
        ]);

        if (results.length === 0) {
            response.status(404).send('Employee not found');
            return;
        }

        const uniqueEmployeeId = results[0].employee_id;
        const cronDate = '0 0 1 * *';

        await scheduleQuery(
            uniqueEmployeeId,
            cronDate,
            `SELECT make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer) AS start_date,
            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
            SUM(s.work_days::integer) AS work_days,
            SUM(COALESCE(
                e.regular_hours * e.hourly_rate * work_days
            ))::numeric(20, 2) AS gross_pay,
            SUM(COALESCE(
                e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
            ))::numeric(20, 2) AS net_pay,
          SUM(COALESCE(
                e.regular_hours * work_days
            ))::numeric(20, 2) AS hours_worked
            FROM employee e
          CROSS JOIN LATERAL (
          SELECT
            payroll_start_day,
            CASE 
                  WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                  THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                  ELSE payroll_end_day 
                END AS unadjusted_payroll_end_day
            FROM payroll_dates
          ) s2
          CROSS JOIN LATERAL (
            SELECT
            s2.payroll_start_day,
            CASE
                  WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                      THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
                  WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                      THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
                  ELSE s2.unadjusted_payroll_end_day
              END::integer AS adjusted_payroll_end_day
          ) s1
          CROSS JOIN LATERAL(
            SELECT
            generate_series(
              make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.payroll_start_day), 
              make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day),
              '1 day'
              )
            ) AS dates(date)
          CROSS JOIN LATERAL (
            SELECT
              SUM(CASE 
                WHEN (work_schedule::integer & (1 << (6 - extract(dow from dates.date)::integer))) <> 0
                THEN 1 
                ELSE 0 
              END) AS work_days
            FROM employee e
          ) s
          LEFT JOIN (
            SELECT employee_id, SUM(rate) AS rate
            FROM payroll_taxes
            GROUP BY employee_id
          ) pt ON e.employee_id = pt.employee_id
          WHERE e.employee_id = ${employee_id} AND work_days <> 0
          GROUP BY s2.payroll_start_day, e.employee_id, e.employee_id, s.work_days, s1.adjusted_payroll_end_day
          ORDER BY start_date, end_date`,
        );

        // Parse the data to correct format and return an object
        const employees: Employee[] = results.map((employee) =>
            employeeParse(employee),
        );

        request.employee_id = employees[0].employee_id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating employee');
    }
};

export const updateEmployeeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { employee_id } = request;

    try {
        const results = await executeQuery(payrollQueries.getEmployee, [
            employee_id,
        ]);

        // Parse the data to correct format and return an object
        const employees: Employee[] = results.map((employee) =>
            employeeParse(employee),
        );

        response.status(200).json(employees);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating employee');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete an employee
 */
export const deleteEmployee = async (
    request: Request,
    response: Response,
): Promise<void> => {
    try {
        const employee_id = parseInt(request.params.employee_id);

        const transferResults = await executeQuery(payrollQueries.getEmployee, [
            employee_id,
        ]);

        if (transferResults.length === 0) {
            response.status(404).send('Employee not found');
            return;
        }

        const payrollDatesResults = await executeQuery(
            payrollQueries.getPayrollDatesByEmployeeId,
            [employee_id],
        );
        const hasPayrollDates: boolean = payrollDatesResults.length > 0;

        const payrollTaxesResults = await executeQuery(
            payrollQueries.getPayrollTaxesByEmployeeId,
            [employee_id],
        );
        const hasPayrollTaxes: boolean = payrollTaxesResults.length > 0;

        if (hasPayrollDates || hasPayrollTaxes) {
            response.status(400).send({
                errors: {
                    msg: 'You need to delete employee-related data before deleting the employee',
                    param: null,
                    location: 'query',
                },
            });
            return;
        }

        await executeQuery(payrollQueries.deleteEmployee, [employee_id]);

        // Define the script command
        const scriptCommand: string = `/app/scripts/employeeChecker.sh`;

        // Execute the script
        exec(scriptCommand, (error, stdout, stderr) => {
            if (error != null) {
                logger.error(`Error executing script: ${error.message}`);
                response.status(500).json({
                    status: 'error',
                    message: 'Failed to execute script',
                });
            }
        });

        response.status(200).send('Successfully deleted employee');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting employee');
    }
};
