import { Request, Response } from 'express';
import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../bree/getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

interface PayrollTaxInput {
    payroll_taxes_id: string;
    employee_id: string;
    name: string;
    rate: string;
}

interface PayrollTaxOutput {
    payroll_taxes_id: number;
    employee_id: number;
    name: string;
    rate: number;
}

/**
 * 
 * @param payrollTax - Payroll tax object
 * @returns - Payroll tax object with parsed values
 */
const payrollTaxesParse = (payrollTax: PayrollTaxInput): PayrollTaxOutput => ({
    payroll_taxes_id: parseInt(payrollTax.payroll_taxes_id),
    employee_id: parseInt(payrollTax.employee_id),
    name: payrollTax.name,
    rate: parseFloat(payrollTax.rate)
});

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payroll taxes
 */
export const getPayrollTaxes = async (request: Request, response: Response): Promise<void> => {
    const { employee_id, id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (id && employee_id) {
            query = payrollQueries.getPayrollTaxesByIdAndEmployeeId;
            params = [id, employee_id];
        } else if (id) {
            query = payrollQueries.getPayrollTaxesById;
            params = [id];
        } else if (employee_id) {
            query = payrollQueries.getPayrollTaxesByEmployeeId;
            params = [employee_id];
        } else {
            query = payrollQueries.getAllPayrollTaxes;
            params = [];
        }

        const rows = await executeQuery<PayrollTaxInput>(query, params);

        if ((id || employee_id) && rows.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        const payrollTaxes: PayrollTaxOutput[] = rows.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).json(payrollTaxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'payroll tax' : (employee_id ? 'payroll taxes for given employee_id' : 'payroll taxes')}`);
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a payroll tax
 */
export const createPayrollTax = async (request: Request, response: Response): Promise<void> => {
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery<PayrollTaxInput>(payrollQueries.createPayrollTax, [employee_id, name, rate]);

        await getPayrolls(employee_id);

        const payrollTaxes: PayrollTaxOutput[] = results.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(201).json(payrollTaxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll tax');
    }
};

/**
 * 
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update a payroll tax
 */
export const updatePayrollTax = async (request: Request, response: Response): Promise<void> => {
    const { id } = request.params;
    const { employee_id, name, rate } = request.body;

    try {
        const results = await executeQuery<PayrollTaxInput>(payrollQueries.updatePayrollTax, [name, rate, id]);

        if (results.length === 0) {
            response.status(404).send('Payroll tax not found');
            return;
        }

        await getPayrolls(parseInt(employee_id));

        const payrollTaxes: PayrollTaxOutput[] = results.map(payrollTax => payrollTaxesParse(payrollTax));

        response.status(200).json(payrollTaxes);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll tax');
    }
};

// Delete payroll tax
export const deletePayrollTax = async (request, response) => {
    const { id } = request.params;

    try {
        const getResults = await executeQuery(payrollQueries.getPayrollTax, [id]);

        if (getResults.length === 0) {
            return response.status(404).send('Payroll tax not found');
        }

        await executeQuery(payrollQueries.deletePayrollTax, [id]);

        await getPayrolls(getResults[0].employee_id);

        response.status(200).send('Successfully deleted payroll tax');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll tax');
    }
};
