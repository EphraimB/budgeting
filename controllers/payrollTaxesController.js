import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const payrollTaxesParse = payrollTax => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate),
});

export const getPayrollTaxes = async (request, response) => {
    const { employee_id, id } = request.query;

    const query = id ? payrollQueries.getPayrollTax : payrollQueries.getPayrollTaxes;
    const queryParameters = id ? [employee_id, id] : [employee_id];

    try {
        const rows = await executeQuery(query, queryParameters);
        const payrollTaxes = rows.map(payrollTax => payrollTaxesParse(payrollTax));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_taxes: payrollTaxes,
        };

        response.status(200).json(returnObj);
    } catch (error) {
        handleError(response, 'Error getting payroll taxes');
    }
};

// Create payroll tax
export const createPayrollTax = async (request, response) => {
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery(payrollQueries.createPayrollTax, [employee_id, name, rate]);

        await getPayrolls(employee_id);

        const payrollTaxes = results.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(201).json(payrollTaxes);
    } catch (error) {
        handleError(response, 'Error creating payroll tax');
    }
};

// Update payroll tax
export const updatePayrollTax = async (request, response) => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery(payrollQueries.updatePayrollTax, [name, rate, id]);

        await getPayrolls(employee_id);

        const payrollTaxes = results.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).send(payrollTaxes);
    } catch (error) {
        handleError(response, 'Error updating payroll tax');
    }
};

// Delete payroll tax
export const deletePayrollTax = async (request, response) => {
    const { id } = request.params;
    const { employee_id } = request.query;

    try {
        await executeQuery(payrollQueries.deletePayrollTax, [id]);

        await getPayrolls(employee_id);

        response.status(200).send("Successfully deleted payroll tax");
    } catch (error) {
        handleError(response, 'Error deleting payroll tax');
    }
};