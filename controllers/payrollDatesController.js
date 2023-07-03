import { payrollQueries } from '../models/queryData.js';
import { getPayrolls } from '../bree/getPayrolls.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const payrollDatesParse = payrollDate => ({
    payroll_date_id: parseInt(payrollDate.payroll_date_id),
    employee_id: parseInt(payrollDate.employee_id),
    payroll_start_day: parseInt(payrollDate.payroll_start_day),
    payroll_end_day: parseInt(payrollDate.payroll_end_day)
});

// Get payroll dates
export const getPayrollDates = async (request, response) => {
    const { employee_id, id } = request.query;

    try {
        let query;
        let params;

        if (id && employee_id) {
            query = payrollQueries.getPayrollDatesByIdAndEmployeeId;
            params = [id, employee_id];
        } else if (id) {
            query = payrollQueries.getPayrollDatesById;
            params = [id];
        } else if (employee_id) {
            query = payrollQueries.getPayrollDatesByEmployeeId;
            params = [employee_id];
        } else {
            query = payrollQueries.getAllPayrollDates;
            params = [];
        }

        const results = await executeQuery(query, params);

        if ((id || employee_id) && results.length === 0) {
            return response.status(404).send('Payroll date not found');
        }

        // Parse the data to correct format and return an object
        const payrollDates = results.map(payrollDate => payrollDatesParse(payrollDate));

        response.status(200).json(payrollDates);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, `Error getting ${id ? 'payroll date' : (employee_id ? 'payroll dates for given employee_id' : 'payroll dates')}`);
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

        response.status(201).json(payrollDates);
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
            payroll_date: payrollDates
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
        const { id } = request.params;

        const getResults = await executeQuery(payrollQueries.getPayrollDate, [id]);

        if (getResults.length === 0) {
            return response.status(404).send('Payroll date not found');
        }

        await executeQuery(payrollQueries.deletePayrollDate, [id]);

        await getPayrolls(getResults[0].employee_id);

        response.status(200).send('Successfully deleted payroll date');
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, 'Error deleting payroll date');
    }
};
