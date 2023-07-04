import { Request, Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../bree/getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface EmployeeInput {
    employee_id: string;
    name: string;
    hourly_rate: string;
    regular_hours: string;
    vacation_days: string;
    sick_days: string;
    work_schedule: string;
}

interface EmployeeOutput {
    employee_id: number;
    name: string;
    hourly_rate: number;
    regular_hours: number;
    vacation_days: number;
    sick_days: number;
    work_schedule: string;
}

/**
 * 
 * @param employee - Employee object
 * @returns - Employee object with correct data types
 */
const employeeParse = (employee: EmployeeInput): EmployeeOutput => ({
    employee_id: parseInt(employee.employee_id),
    name: employee.name,
    hourly_rate: parseFloat(employee.hourly_rate),
    regular_hours: parseInt(employee.regular_hours),
    vacation_days: parseInt(employee.vacation_days),
    sick_days: parseInt(employee.sick_days),
    work_schedule: employee.work_schedule
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all employees
 */
export const getEmployee = async (request: Request, response: Response): Promise<void> => {
    const { employee_id } = request.query;

    try {
        const query: string = employee_id ? payrollQueries.getEmployee : payrollQueries.getEmployees;
        const params: any[] = employee_id ? [employee_id] : [];

        const results = await executeQuery<EmployeeInput>(query, params);

        if (employee_id && results.length === 0) {
            response.status(404).send('Employee not found');
            return;
        }

        // Parse the data to the correct format and return an object
        const employees: EmployeeOutput[] = results.map(employee => employeeParse(employee));

        response.status(200).json(employees);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${employee_id ? 'employee' : 'employees'}`);
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new employee
 */
export const createEmployee = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

        const results = await executeQuery<EmployeeInput>(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule]);

        // Parse the data to correct format and return an object
        const employees: EmployeeOutput[] = results.map(employee => employeeParse(employee));

        response.status(201).json(employees);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating employee');
    }
};

// Update employee
export const updateEmployee = async (request, response) => {
    try {
        const employee_id = parseInt(request.params.employee_id);
        const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

        const results = await executeQuery(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id]);

        if (results.length === 0) {
            return response.status(404).send('Employee not found');
        }

        await getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const employees = results.map(employee => employeeParse(employee));

        response.status(200).json(employees);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating employee');
    }
};

// Delete employee
export const deleteEmployee = async (request, response) => {
    try {
        const employee_id = parseInt(request.params.employee_id);

        const transferResults = await executeQuery(payrollQueries.getEmployee, [employee_id]);

        if (transferResults.length === 0) {
            return response.status(404).send('Employee not found');
        }

        const payrollDatesResults = await executeQuery(payrollQueries.getPayrollDates, [employee_id]);
        const hasPayrollDates = payrollDatesResults.length > 0;

        const payrollTaxesResults = await executeQuery(payrollQueries.getPayrollTaxes, [employee_id]);
        const hasPayrollTaxes = payrollTaxesResults.length > 0;

        if (hasPayrollDates || hasPayrollTaxes) {
            response.status(400).send({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
            return;
        }

        await executeQuery(payrollQueries.deleteEmployee, [employee_id]);

        await getPayrolls(employee_id);

        response.status(200).send('Successfully deleted employee');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting employee');
    }
};
