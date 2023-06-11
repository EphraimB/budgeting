import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const employeeParse = employee => ({
    employee_id: parseInt(employee.employee_id),
    name: employee.name,
    hourly_rate: parseFloat(employee.hourly_rate),
    regular_hours: parseInt(employee.regular_hours),
    vacation_days: parseInt(employee.vacation_days),
    sick_days: parseInt(employee.sick_days),
    work_schedule: employee.work_schedule,
});

// Get employee
export const getEmployee = async (request, response) => {
    try {
        const { id } = request.query;
        const query = id ? payrollQueries.getEmployee : payrollQueries.getEmployees;
        const params = id ? [id] : [];

        const results = await executeQuery(query, params);

        // Parse the data to the correct format and return an object
        const employees = results.map(employee => employeeParse(employee));

        response.status(200).json(employees);
    } catch (error) {
        handleError(response, 'Error getting employee');
    }
};

// Create employee
export const createEmployee = async (request, response) => {
    try {
        const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

        const results = await executeQuery(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule]);

        // Parse the data to correct format and return an object
        const employees = results.map(employee => employeeParse(employee));

        response.status(201).json(employees);
    } catch (error) {
        handleError(response, 'Error creating employee');
    }
};

// Update employee
export const updateEmployee = async (request, response) => {
    try {
        const employee_id = parseInt(request.params.employee_id);
        const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

        const results = await executeQuery(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id]);

        getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const employees = results.map(employee => employeeParse(employee));

        response.status(200).json(employees);
    } catch (error) {
        handleError(response, 'Error updating employee');
    }
};

// Delete employee
export const deleteEmployee = async (request, response) => {
    try {
        const employee_id = parseInt(request.params.employee_id);

        const payrollDatesResults = await executeQuery(payrollQueries.getPayrollDates, [employee_id]);
        const hasPayrollDates = payrollDatesResults.length > 0;

        const payrollTaxesResults = await executeQuery(payrollQueries.getPayrollTaxes, [employee_id]);
        const hasPayrollTaxes = payrollTaxesResults.length > 0;

        if (hasPayrollDates || hasPayrollTaxes) {
            response.status(400).send({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
            return;
        }

        await executeQuery(payrollQueries.deleteEmployee, [employee_id]);

        getPayrolls(employee_id);

        response.status(200).send('Successfully deleted employee');
    } catch (error) {
        handleError(response, 'Error deleting employee');
    }
};