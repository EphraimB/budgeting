import { payrollQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';

const payrollsParse = payroll => ({
    start_date: payroll.start_date,
    end_date: payroll.end_date,
    work_days: parseInt(payroll.work_days),
    gross_pay: parseFloat(payroll.gross_pay),
    net_pay: parseFloat(payroll.net_pay),
    hours_worked: parseFloat(payroll.hours_worked),
});

// Get all payrolls
export const getPayrolls = async (request, response) => {
    try {
        const employee_id = parseInt(request.query.employee_id);

        const results = await executeQuery(payrollQueries.getPayrolls, [employee_id]);

        // Parse the data to correct format and return an object
        const payrolls = results.map(payroll => payrollsParse(payroll));

        const returnObj = {
            employee_id,
            payrolls: payrolls,
        }

        response.status(200).json(returnObj);
    } catch (error) {
        console.error(error); // Log the error on the server side
        handleError(response, "Error getting payrolls");
    }
};