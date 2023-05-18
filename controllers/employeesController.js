import pool from '../db.js';
import { payrollQueries } from '../queryData.js';
import getPayrollsForMonth from '../getPayrolls.js';

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
export const getEmployee = (request, response) => {
    const { id } = request.query;
    const query = id ? payrollQueries.getEmployee : payrollQueries.getEmployees;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting employee', param: null, location: 'query' } });
        }

        // Parse the data to the correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Create employee
export const createEmployee = (request, response) => {
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating employee", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(201).send(employees);
    });
};

// Update employee
export const updateEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating employee", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Delete employee
export const deleteEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);

    // Check if there are any associated payroll dates or payroll taxes
    pool.query(payrollQueries.getPayrollDates, [employee_id], (error, payrollDatesResults) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll dates', param: null, location: 'query' } });
        }

        const hasPayrollDates = payrollDatesResults.rows.length > 0;

        pool.query(payrollQueries.getPayrollTaxes, [employee_id], (error, payrollTaxesResults) => {
            if (error) {
                return response.status(400).send({ errors: { msg: 'Error getting payroll taxes', param: null, location: 'query' } });
            }

            const hasPayrollTaxes = payrollTaxesResults.rows.length > 0;

            if (hasPayrollDates || hasPayrollTaxes) {
                return response.status(400).send({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
            } else {
                pool.query(payrollQueries.deleteEmployee, [employee_id], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { msg: 'Error deleting employee', param: null, location: 'query' } });
                    }

                    getPayrollsForMonth(employee_id);

                    response.status(200).send('Successfully deleted employee');
                });
            }
        });
    });
};