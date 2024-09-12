import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all payrolls
 */
export const getPayrolls = async (
    _: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                            WITH work_days_and_hours AS (
                                WITH job_ids AS (
                                    SELECT DISTINCT job_id
                                    FROM payroll_dates
                                    LIMIT 1
                                ),
                                ordered_table AS (
                                    SELECT
                                        p.job_id,
                                        p.payroll_day,
                                        ROW_NUMBER() OVER (PARTITION BY p.job_id ORDER BY p.payroll_day) AS row_num
                                    FROM payroll_dates p
                                    JOIN job_ids j ON p.job_id = j.job_id
                                )
                                SELECT
                                    j.id,
  								    j.name,
                                    CASE
                                        WHEN s2.payroll_start_day::integer < 0 THEN
                                            (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                        ELSE 
                                            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                                    END AS start_date,
                                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
                                    d.date AS work_date,
                                    EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 AS hours_worked_per_day,
                                    j.hourly_rate,
                                    COALESCE(pt.rate, 0) AS tax_rate
                                FROM 
                                    jobs j
                                    JOIN job_schedule js ON j.id = js.job_id
                                    
                                    CROSS JOIN LATERAL (
                                        SELECT
                                            CASE WHEN
                                (SELECT COUNT(*) FROM payroll_dates) = 1 AND payroll_day < 31 THEN -(payroll_day + 1)
                                            ELSE 
                                                COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1
                                            END AS payroll_start_day,
                                            CASE 
                                                WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                                                THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                                                ELSE payroll_day 
                                            END AS unadjusted_payroll_end_day
                                        FROM ordered_table
                                    ) s2
                                    CROSS JOIN LATERAL (
                                        SELECT
                                            s2.payroll_start_day,
                                            CASE
                                                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                                                    THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, adjust to Friday
                                                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                                                    THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, adjust to Friday
                                                ELSE s2.unadjusted_payroll_end_day
                                            END::integer AS adjusted_payroll_end_day
                                    ) s1
                                    JOIN LATERAL generate_series(
                                    CASE
                                        WHEN s2.payroll_start_day::integer < 0 THEN
                                            (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                        ELSE 
                                            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                                    END, 
                                        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day),
                                        '1 day'
                                    ) AS d(date) ON js.day_of_week = EXTRACT(DOW FROM d.date)::integer
                                    LEFT JOIN (
                                        SELECT job_id, SUM(rate) AS rate
                                        FROM payroll_taxes
                                        GROUP BY job_id
                                    ) pt ON j.id = pt.job_id
                                WHERE 
                                    d.date >= CASE
                                        WHEN s2.payroll_start_day::integer < 0 THEN
                                            (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                        ELSE 
                                            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                                    END
                            ),
                            payrolls_total AS (
                              SELECT
                              	id,
                              	name,
                                start_date,
                                end_date,
                                COUNT(work_date) AS work_days,
                                SUM(hours_worked_per_day * hourly_rate) AS gross_pay,
                                SUM(hours_worked_per_day * hourly_rate * (1 - tax_rate)) AS net_pay,
                                SUM(hours_worked_per_day) AS hours_worked
                              FROM work_days_and_hours
                              GROUP BY id, name, start_date, end_date
                            )
                            SELECT
                            	id,
                                name,
                                json_agg(
                                        json_build_object(
                                          'start_date', start_date,
                                          'end_date', end_date,
                                         	'work_days', payrolls_total.work_days,
                                          'gross_pay', payrolls_total.gross_pay,
                                          'net_pay', payrolls_total.net_pay,
                                          'hours_worked', payrolls_total.hours_worked
                                        )
                                  ORDER BY start_date
                                ) AS payrolls
                            FROM 
                                payrolls_total
                            GROUP BY id, name
                            ORDER BY id;
                    `,
            [],
        );

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting payrolls');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve payrolls for a single job id
 */
export const getPayrollsByJobId = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                WITH work_days_and_hours AS (
                    WITH ordered_table AS (
                        SELECT payroll_day,
                        ROW_NUMBER() OVER (ORDER BY payroll_day) AS row_num
                        FROM payroll_dates
                        WHERE job_id = $1
                    )
                        SELECT
  							j.id,
  							j.name,
                            CASE
                                WHEN s2.payroll_start_day::integer < 0 THEN
                                    (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                ELSE 
                                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                            END AS start_date,
                            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
                            d.date AS work_date,
                            EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 AS hours_worked_per_day,
                            j.hourly_rate,
                            COALESCE(pt.rate, 0) AS tax_rate
                        FROM 
                            jobs j
                            JOIN job_schedule js ON j.id = js.job_id
                            
                            CROSS JOIN LATERAL (
                                SELECT
                                    CASE WHEN
                        (SELECT COUNT(*) FROM payroll_dates) = 1 AND payroll_day < 31 THEN -(payroll_day + 1)
                                    ELSE 
                                        COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1
                                    END AS payroll_start_day,
                                    CASE 
                                        WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                                        ELSE payroll_day 
                                    END AS unadjusted_payroll_end_day
                                FROM ordered_table
                            ) s2
                            CROSS JOIN LATERAL (
                                SELECT
                                    s2.payroll_start_day,
                                    CASE
                                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                                            THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, adjust to Friday
                                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                                            THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, adjust to Friday
                                        ELSE s2.unadjusted_payroll_end_day
                                    END::integer AS adjusted_payroll_end_day
                            ) s1
                            JOIN LATERAL generate_series(
                            CASE
                                WHEN s2.payroll_start_day::integer < 0 THEN
                                    (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                ELSE 
                                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                            END, 
                                make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day),
                                '1 day'
                            ) AS d(date) ON js.day_of_week = EXTRACT(DOW FROM d.date)::integer
                            LEFT JOIN (
                                SELECT job_id, SUM(rate) AS rate
                                FROM payroll_taxes
                                GROUP BY job_id
                            ) pt ON j.id = pt.job_id
                        WHERE 
                            j.id = $1 
                            AND d.date >= CASE
                                WHEN s2.payroll_start_day::integer < 0 THEN
                                    (make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                                ELSE 
                                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
                            END
                    ),
                            payrolls_total AS (
                              SELECT
                              	id,
                              	name,
                                start_date,
                                end_date,
                                COUNT(work_date) AS work_days,
                                SUM(hours_worked_per_day * hourly_rate) AS gross_pay,
                                SUM(hours_worked_per_day * hourly_rate * (1 - tax_rate)) AS net_pay,
                                SUM(hours_worked_per_day) AS hours_worked
                              FROM work_days_and_hours
                              GROUP BY id, name, start_date, end_date
                            )
                    			SELECT
                            		id,
                                    name,
                                    json_agg(
                                            json_build_object(
                                            'start_date', start_date,
                                            'end_date', end_date,
                                                'work_days', payrolls_total.work_days,
                                            'gross_pay', payrolls_total.gross_pay,
                                            'net_pay', payrolls_total.net_pay,
                                            'hours_worked', payrolls_total.hours_worked
                                            )
                                    ORDER BY start_date
                                    ) AS payrolls
                                FROM 
                                    payrolls_total
                                GROUP BY id, name
                                ORDER BY id;
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('No payrolls for job or not found');
            return;
        }

        const retreivedRow = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRow[0]);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting payrolls for job id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};
