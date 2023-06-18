import pool from "../config/db.js";
import { payrollQueries } from "../models/queryData.js";

// Function to fetch employee data from the database
export const getEmployeesData = () => {
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