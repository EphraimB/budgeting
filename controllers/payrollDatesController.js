import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../bree/getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const payrollDatesParse = payrollDate => ({
    payroll_date_id: parseInt(payrollDate.payroll_date_id),
    payroll_start_day: parseInt(payrollDate.payroll_start_day),
    payroll_end_day: parseInt(payrollDate.payroll_end_day),
});

// Get payroll dates
export const getPayrollDates = async (request, response) => {
    const { employee_id, id } = request.query;

    try {
        const query = id ? payrollQueries.getPayrollDate : payrollQueries.getPayrollDates;
        const params = id ? [employee_id, id] : [employee_id];

        const results = await executeQuery(query, params);

        if (employee_id && results.length === 0) {
            return response.status(404).send('Payroll date not found');
        }

        // Parse the data to correct format and return an object
        const payrollDates = results.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_dates: payrollDates,
        };
        response.status(200).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'payroll date' : 'payroll dates'}`);
    }
};

// Create payroll date
export const createPayrollDate = async (request, response) => {
    try {
        const { employee_id, start_day, end_day } = request.body;

        const results = await executeQuery(payrollQueries.createPayrollDate, [employee_id, start_day, end_day]);

        await getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        };
        response.status(201).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error creating payroll date');
    }
};

// Update payroll date
export const updatePayrollDate = async (request, response) => {
    try {
        const { id } = request.params;
        const { employee_id, start_day, end_day } = request.body;

        const results = await executeQuery(payrollQueries.updatePayrollDate, [start_day, end_day, id]);

        if (results.length === 0) {
            return response.status(404).send('Payroll date not found');
        }

        await getPayrolls(employee_id);

        // Parse the data to correct format and return an object
        const payrollDates = results.map(payrollDate => payrollDatesParse(payrollDate));

        const returnObj = {
            employee_id: parseInt(employee_id),
            payroll_date: payrollDates,
        };

        response.status(200).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error updating payroll date');
    }
};

// Delete payroll date
export const deletePayrollDate = async (request, response) => {
    try {
        const { employee_id } = request.query;
        const { id } = request.params;

        await executeQuery(payrollQueries.deletePayrollDate, [id]);

        await getPayrolls(employee_id);

        response.status(200).send("Successfully deleted payroll date");
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll date');
    }
};