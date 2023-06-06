import pool from '../config/db.js';
import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../getPayrolls.js';

const payrollDatesParse = payrollDate => ({
    payroll_date_id: parseInt(payrollDate.payroll_date_id),
    payroll_start_day: parseInt(payrollDate.payroll_start_day),
    payroll_end_day: parseInt(payrollDate.payroll_end_day),
});

// Get payroll dates
export const getPayrollDates = (request, response) => {
    const { employee_id, id } = request.query;
    const query = id ? payrollQueries.getPayrollDate : payrollQueries.getPayrollDates;
    const params = id ? [employee_id, id] : [employee_id];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll dates', param: null, location: 'query' } });
        }

        // Parse the data to the correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_dates: payrollDates,
        };
        response.status(200).send(returnObj);
    });
};

// Create payroll date
export const createPayrollDate = (request, response) => {
    const { employee_id, start_day, end_day } = request.body;

    pool.query(payrollQueries.createPayrollDate, [employee_id, start_day, end_day], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll date", "param": null, "location": "query" } });
        }

        getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        }
        response.status(201).send(returnObj);
    });
};

// Update payroll date
export const updatePayrollDate = (request, response) => {
    const { id } = request.params;
    const { employee_id, start_day, end_day } = request.body;

    pool.query(payrollQueries.updatePayrollDate, [start_day, end_day, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll date", "param": null, "location": "query" } });
        }

        getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.rows.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        }

        response.status(200).send(returnObj);
    });
};

// Delete payroll date
export const deletePayrollDate = (request, response) => {
    const { employee_id } = request.query;
    const { id } = request.params;

    pool.query(payrollQueries.deletePayrollDate, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll date", "param": null, "location": "query" } });
        }

        getPayrolls(employee_id);

        response.status(200).send("Successfully deleted payroll date");
    });
};