import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../bree/getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const payrollTaxesParse = payrollTax => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    employee_id: parseInt(payrollTax.employee_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate)
});

export const getPayrollTaxes = async (request, response) => {
    const { id } = request.query;

    const query = id ? payrollQueries.getPayrollTax : payrollQueries.getPayrollTaxes;
    const queryParameters = id ? [id] : [];

    try {
        const rows = await executeQuery(query, queryParameters);

        if (id && rows.length === 0) {
            return response.status(404).send('Payroll tax not found');
        }

        const payrollTaxes = rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).json(payrollTaxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'payroll tax' : 'payroll taxes'}`);
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
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll tax');
    }
};

// Update payroll tax
export const updatePayrollTax = async (request, response) => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery(payrollQueries.updatePayrollTax, [name, rate, id]);

        if (results.length === 0) {
            return response.status(404).send('Payroll tax not found');
        }

        await getPayrolls(employee_id);

        const payrollTaxes = results.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).json(payrollTaxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll tax');
    }
};

// Delete payroll tax
export const deletePayrollTax = async (request, response) => {
    const { id } = request.params;
    const { employee_id } = request.query;

    try {
        const transferResults = await executeQuery(payrollQueries.deletePayrollTax, [id]);

        if (transferResults.length === 0) {
            return response.status(404).send('Payroll tax not found');
        }

        await getPayrolls(employee_id);

        response.status(200).send('Successfully deleted payroll tax');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll tax');
    }
};
