import pool from '../config/db.js';
import { payrollQueries } from '../models/queryData.js';

const payrollsParse = payroll => ({
    start_date: payroll.start_date,
    end_date: payroll.end_date,
    work_days: parseInt(payroll.work_days),
    gross_pay: parseFloat(payroll.gross_pay),
    net_pay: parseFloat(payroll.net_pay),
    hours_worked: parseFloat(payroll.hours_worked),
});

// Get all payrolls
export const getPayrolls = (request, response) => {
    const employee_id = parseInt(request.query.employee_id);

    pool.query(payrollQueries.getPayrolls, [employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const payrolls = results.rows.map(payroll => payrollsParse(payroll));

        const returnObj = {
            employee_id,
            payrolls: payrolls,
        }
        response.status(200).send(returnObj);
    });
};