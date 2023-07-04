import pool from '../config/db.js';
import { payrollQueries } from '../models/queryData.js';

interface Employee {
    employee_id: string;
    name: string;
    hourly_rate: number;
    regular_hours: number;
    vacation_days: number;
    sick_days: number;
    work_schedule: string;
}

/**
 * 
 * @returns - Array of employees
 */
export const getEmployeesData = (): Promise<Employee[]> => {
    return new Promise((resolve, reject) => {
        pool.query(payrollQueries.getEmployees, (error, results) => {
            if (error) {
                console.log(error);
                reject(error);
                return;
            }

            resolve(results.rows);
        });
    });
};
