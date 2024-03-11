import { type NextFunction, type Request, type Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { type Employee } from '../types/types.js';
import { logger } from '../config/winston.js';

/**
 *
 * @param employee - Employee object
 * @returns - Employee object with correct data types
 */
const employeeParse = (employee: Record<string, string>): Employee => ({
    id: parseInt(employee.employee_id),
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
        const query: string = employee_id
            ? payrollQueries.getEmployee
            : payrollQueries.getEmployees;
        const params: any[] = employee_id ? [employee_id] : [];

        const results = await executeQuery(query, params);

        if (employee_id && results.length === 0) {
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
            `Error getting ${employee_id ? 'employee' : 'employees'}`,
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

        await executeQuery('SELECT process_payroll_for_employee($1)', [1]);

        // Parse the data to correct format and return an object
        const employees: Employee[] = results.map((employee) =>
            employeeParse(employee),
        );

        request.employee_id = employees[0].id;

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

        await executeQuery('SELECT process_payroll_for_employee($1)', [1]);

        response.status(200).send('Successfully deleted employee');
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting employee');
    }
};