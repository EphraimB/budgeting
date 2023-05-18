import pool from '../db.js';
import { payrollQueries } from '../queryData.js';
import getPayrollsForMonth from '../getPayrolls.js';

const payrollTaxesParse = payrollTax => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate),
});

// Get payroll taxes
export const getPayrollTaxes = (request, response) => {
    const { employee_id, id } = request.query;

    const query = id ? payrollQueries.getPayrollTax : payrollQueries.getPayrollTaxes;
    const queryParameters = id ? [employee_id, id] : [employee_id];

    pool.query(query, queryParameters, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll taxes', param: null, location: 'query' } });
        }

        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_taxes: payrollTaxes,
        };

        response.status(200).send(returnObj);
    });
};

// Create payroll tax
export const createPayrollTax = (request, response) => {
    const { employee_id, name, rate } = request.body;

    pool.query(payrollQueries.createPayrollTax, [employee_id, name, rate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(201).send(payrollTaxes);
    });
};

// Update payroll tax
export const updatePayrollTax = (request, response) => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    pool.query(payrollQueries.updatePayrollTax, [name, rate, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const payrollTaxes = results.rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).send(payrollTaxes);
    });
};

// Delete payroll tax
export const deletePayrollTax = (request, response) => {
    const { id } = request.params;
    const { employee_id } = request.query;

    pool.query(payrollQueries.deletePayrollTax, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send("Successfully deleted payroll tax");
    });
};