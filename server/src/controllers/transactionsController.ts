import { type Request, type Response } from 'express';
import { handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve generated transactions for all accounts
 */
export const getTransactions = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { fromDate, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                WITH RECURSIVE recurring AS (
                -- Initialize with the starting dates
                SELECT 
                    e.account_id,
                    e.title,
                    e.description,
                    e.begin_date AS date,
                    -e.amount + (-e.amount * COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0)) AS amount,
                    e.frequency_type,
                    e.frequency_type_variable,
                    e.frequency_day_of_week,
                    e.frequency_week_of_month,
                    e.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    expenses e
                UNION
                SELECT
                    l.account_id,
                    l.title,
                    l.description,
                    l.begin_date AS date,
                    -l.plan_amount AS amount,
                    l.frequency_type,
                    l.frequency_type_variable,
                    l.frequency_day_of_week,
                    l.frequency_week_of_month,
                    l.frequency_month_of_year,
                    l.amount AS remaining_balance
                FROM loans l
                UNION
                SELECT 
                    t.source_account_id,
                    t.title,
                    t.description,
                    t.begin_date AS date,
                    -t.amount AS amount,
                    t.frequency_type,
                    t.frequency_type_variable,
                    t.frequency_day_of_week,
                    t.frequency_week_of_month,
                    t.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    transfers t
                UNION
                SELECT 
                    td.destination_account_id,
                    td.title,
                    td.description,
                    td.begin_date AS date,
                    td.amount AS amount,
                    td.frequency_type,
                    td.frequency_type_variable,
                    td.frequency_day_of_week,
                    td.frequency_week_of_month,
                    td.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    transfers td
                UNION
                SELECT 
                    i.account_id,
                    i.title,
                    i.description,
                    i.begin_date AS date,
                    i.amount + (-i.amount * COALESCE((SELECT rate FROM taxes WHERE id = i.tax_id), 0)) AS amount,
                    i.frequency_type,
                    i.frequency_type_variable,
                    i.frequency_day_of_week,
                    i.frequency_week_of_month,
                    i.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    income i
                UNION
                SELECT
                    cs.account_id,
                    CONCAT('Fare for ', csy.name, ' ', fd.name) AS title,
                    CONCAT('Fare for ', csy.name, ' ', fd.name) AS description,
                    CASE
                    WHEN extract('dow' from now()) <= cs.day_of_week THEN
                        now() + interval '1 day' * (cs.day_of_week - extract('dow' from now()))
                    ELSE
                        now() + interval '1 week' + interval '1 day' * (cs.day_of_week - extract('dow' from now()))
                    END AS date,
                    -fd.fare AS amount,
                    1 AS frequency_type,
                    1 AS frequency_type_variable,
                    cs.day_of_week AS frequency_day_of_week,
                    NULL AS frequency_week_of_month,
                    NULL AS frequency_month_of_year,
                    NULL AS remaining_balance
                FROM commute_schedule cs
                LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                UNION ALL
                -- Generate subsequent billing dates based on frequency type
                SELECT
                    r.account_id,
                    r.title,
                    r.description,
                    CASE
                        -- Daily frequency
                        WHEN r.frequency_type = 0 THEN r.date + interval '1 day' * r.frequency_type_variable
                        -- Weekly frequency
                        WHEN r.frequency_type = 1 THEN 
                            CASE
                                WHEN extract('dow' from r.date) <= r.frequency_day_of_week THEN
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (r.frequency_day_of_week - extract('dow' from r.date))
                                ELSE
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (7 - extract('dow' from r.date) + r.frequency_day_of_week)
                            END
                        -- Monthly frequency
                        WHEN r.frequency_type = 2 THEN
                            (r.date + interval '1 month' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 month' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN r.frequency_type = 3 THEN
                            (r.date + interval '1 year' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 year' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        ELSE 
                            NULL
                    END AS date,
                    r.amount,
                    r.frequency_type,
                    r.frequency_type_variable,
                    r.frequency_day_of_week,
                    r.frequency_week_of_month,
                    r.frequency_month_of_year,
                    r.remaining_balance - ABS(r.amount) AS remaining_balance
                FROM 
                    recurring r
                WHERE
                    (r.date + interval '1 day') <= $2
                    AND (r.remaining_balance IS NULL OR r.remaining_balance - ABS(r.amount) > 0)
            ),
            work_days_and_hours AS (
            	WITH ordered_table AS (
                SELECT
                    pd.payroll_day,
                    pd.job_id,
                    ROW_NUMBER() OVER (PARTITION BY pd.job_id ORDER BY pd.payroll_day) AS row_num
                FROM 
                    payroll_dates pd
                JOIN 
                    jobs j ON pd.job_id = j.id
            )
            SELECT
              	j.id AS job_id,
              	j.account_id,
                j.name,
                CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END AS start_date,
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) AS end_date,
                --d.date AS work_date,
                EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 AS hours_worked_per_day,
                j.hourly_rate,
                COALESCE(pt.rate, 0) AS tax_rate
            FROM 
                jobs j
            JOIN 
                job_schedule js ON j.id = js.job_id
            CROSS JOIN LATERAL generate_series(current_date, $2::date + INTERVAL '1 month', '1 month') AS d1(date)
            CROSS JOIN LATERAL (
                SELECT
                    CASE WHEN
                        (SELECT COUNT(*) FROM payroll_dates WHERE job_id = j.id) = 1 AND payroll_day < 31 THEN -(payroll_day + 1)
                    ELSE 
                        COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1
                    END AS payroll_start_day,
                    CASE 
                        WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')
                        ELSE payroll_day 
                    END AS unadjusted_payroll_end_day
                FROM 
                    ordered_table ot
                WHERE 
                    ot.job_id = j.id
            ) s2
            CROSS JOIN LATERAL (
                SELECT
                    s2.payroll_start_day,
                    CASE
                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                            THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, adjust to Friday
                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                            THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, adjust to Friday
                        ELSE s2.unadjusted_payroll_end_day
                    END::integer AS adjusted_payroll_end_day
            ) s1
            JOIN LATERAL generate_series(
                CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END, 
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day),
                '1 day'
            ) AS d(date) ON js.day_of_week = EXTRACT(DOW FROM d.date)::integer
            LEFT JOIN (
                SELECT job_id, SUM(rate) AS rate
                FROM payroll_taxes
                GROUP BY job_id
            ) pt ON j.id = pt.job_id
            WHERE 
                j.account_id = 1 
                AND d.date >= CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END  
                AND d.date <= $2::date
            ORDER BY 
                j.name, start_date
            ),
            transaction_details AS (
                -- Get all transactions and calculate amount after tax
                SELECT 
                    th.account_id,
                    th.title,
                    th.description,
                    th.date_created AS date,
                    th.amount + (th.amount * th.tax_rate) AS amount
                FROM 
                    transaction_history th
            ),
            payroll_summary AS (
                SELECT
                    wdah.account_id,
                    wdah.end_date,
                    wdah.name,
                    SUM(wdah.hours_worked_per_day * wdah.hourly_rate * (1 - wdah.tax_rate)) AS amount
                FROM 
                    work_days_and_hours wdah
                GROUP BY 
              			wdah.job_id,
                    wdah.account_id, 
                    wdah.end_date, 
                    wdah.name
              ORDER BY end_date, name
            ),
            combined_details AS (
                SELECT
              		account_id,
              		title,
              		description,
              		date,
              		amount
              		FROM recurring
              		WHERE date >= now()
                  UNION
                  SELECT
                        ps.account_id,
                        CONCAT('Payroll for ', ps.name) AS title,
                        CONCAT('Payroll for ', ps.name) AS description,
                        ps.end_date AS date,
                        ps.amount
                    FROM 
                        payroll_summary ps
              			WHERE ps.end_date >= now()
              			ORDER BY date, title -- Ensure payroll ordering by date and title
            ),
            current_balance AS (
                -- Calculate the current balance for each account based on transactions
                SELECT 
                    account_id,
                    COALESCE(SUM(amount), 0) AS current_balance
                FROM 
                    transaction_details
                GROUP BY 
                    account_id
            ),
            projected_balance AS (
                SELECT
                    twb.date,
                    twb.account_id,
              			twb.amount,
                    COALESCE(SUM(twb.amount) OVER (PARTITION BY twb.account_id ORDER BY twb.date), 0) AS running_balance
                FROM 
                    transaction_with_balance twb
            ),
            wishlist_affordable AS (
                SELECT 
                    w.account_id,
                    w.title,
                    w.description,
                    -w.amount AS amount,
                    MIN(pb.date) AS date,
                    -(SELECT MAX(pb2.running_balance) FROM projected_balance pb2 WHERE pb2.account_id = w.account_id AND pb2.date <= MIN(pb.date)) AS running_balance
                FROM 
                    wishlist w
                JOIN 
                    projected_balance pb ON w.account_id = pb.account_id AND pb.running_balance > w.amount
                GROUP BY 
                    w.account_id, w.title, w.description, w.amount
            ),
            transaction_with_balance AS (
                -- Calculate the remaining balance after each transaction (reversed for transactions)
                SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
                    td.amount,
                		SUM(td.amount) OVER (PARTITION BY td.account_id ORDER BY td.date DESC) AS running_balance
                FROM 
                    transaction_details td
                UNION
                    SELECT
                    cd.account_id,
                    cd.title,
                    cd.description,
                    cd.date,
                    cd.amount,
                    COALESCE(SUM(-cd.amount) OVER (PARTITION BY cd.account_id ORDER BY cd.date, cd.title, cd.description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM 
                    combined_details cd
              WHERE 
                    cd.date < $2
							
              ORDER BY date, title, description
            ),
            all_transactions AS (
                SELECT 
                    twb.account_id,
                    twb.title,
                    twb.description,
                    twb.date,
                    twb.amount,
                    twb.running_balance
                FROM 
                    transaction_with_balance twb
                UNION
                SELECT 
                    wa.account_id,
                    wa.title,
                    wa.description,
                    wa.date,
                    wa.amount,
                    wa.running_balance + cb.current_balance AS running_balance
                FROM 
                    wishlist_affordable wa
              	LEFT JOIN 
                		current_balance cb ON wa.account_id = cb.account_id
                ORDER BY date, title, description
            ),
            recalculate_balances AS (
              SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
                    td.amount,
                		SUM(td.amount) OVER (PARTITION BY td.account_id ORDER BY td.date DESC) AS running_balance
                FROM 
                    transaction_details td
                UNION
                SELECT 
                    account_id,
                    title,
                    description,
                    date,
                    amount,
                    COALESCE(SUM(-amount) OVER (PARTITION BY account_id ORDER BY date, title, description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM (
                    SELECT 
                        account_id,
                        title,
                        description,
                        date,
                        amount
                    FROM (
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                            amount
                        FROM 
                            combined_details
                        UNION
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                            amount
                        FROM 
                            wishlist_affordable
                    ) AS generated_transactions
                ) AS combined
              ORDER BY date, title, description
            )
            SELECT
                a.id AS account_id,
                COALESCE(cb.current_balance, 0) AS current_balance,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'title', twb.title,
                            'description', twb.description,
                            'amount', twb.amount,
                            'date', twb.date,
                            'balance', 
                                CASE 
                                    WHEN twb.running_balance IS NOT NULL THEN COALESCE(cb.current_balance, 0) - twb.running_balance + twb.amount 
                                    ELSE NULL 
                                END
                        ) ORDER BY twb.date
                    ) FILTER (WHERE twb.account_id IS NOT NULL), '[]'::json
                ) AS transactions
            FROM 
                accounts a
            LEFT JOIN 
                current_balance cb ON a.id = cb.account_id
            LEFT JOIN 
            (
                SELECT * FROM recalculate_balances 
                WHERE date > $1 AND date <= $2
            ) twb ON a.id = twb.account_id
            GROUP BY 
                a.id, cb.current_balance
            ORDER BY 
                a.id;
            `,
            [fromDate, toDate],
        );

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting generated transactions');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve generated transactions by account id
 */
export const getTransactionsByAccountId = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.params;
    const { fromDate, toDate } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                WITH RECURSIVE recurring AS (
                -- Initialize with the starting dates
                SELECT 
                    e.account_id,
                    e.title,
                    e.description,
                    e.begin_date AS date,
                    -e.amount + (-e.amount * COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0)) AS amount,
                    e.frequency_type,
                    e.frequency_type_variable,
                    e.frequency_day_of_week,
                    e.frequency_week_of_month,
                    e.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    expenses e
                UNION
                SELECT
                    l.account_id,
                    l.title,
                    l.description,
                    l.begin_date AS date,
                    -l.plan_amount AS amount,
                    l.frequency_type,
                    l.frequency_type_variable,
                    l.frequency_day_of_week,
                    l.frequency_week_of_month,
                    l.frequency_month_of_year,
                    l.amount AS remaining_balance
                FROM loans l
                UNION
                SELECT 
                    t.source_account_id,
                    t.title,
                    t.description,
                    t.begin_date AS date,
                    -t.amount AS amount,
                    t.frequency_type,
                    t.frequency_type_variable,
                    t.frequency_day_of_week,
                    t.frequency_week_of_month,
                    t.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    transfers t
                UNION
                SELECT 
                    td.destination_account_id,
                    td.title,
                    td.description,
                    td.begin_date AS date,
                    td.amount AS amount,
                    td.frequency_type,
                    td.frequency_type_variable,
                    td.frequency_day_of_week,
                    td.frequency_week_of_month,
                    td.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    transfers td
                UNION
                SELECT 
                    i.account_id,
                    i.title,
                    i.description,
                    i.begin_date AS date,
                    i.amount + (-i.amount * COALESCE((SELECT rate FROM taxes WHERE id = i.tax_id), 0)) AS amount,
                    i.frequency_type,
                    i.frequency_type_variable,
                    i.frequency_day_of_week,
                    i.frequency_week_of_month,
                    i.frequency_month_of_year,
                    NULL AS remaining_balance
                FROM 
                    income i
                UNION
                SELECT
                    cs.account_id,
                    CONCAT('Fare for ', csy.name, ' ', fd.name) AS title,
                    CONCAT('Fare for ', csy.name, ' ', fd.name) AS description,
                    CASE
                    WHEN extract('dow' from now()) <= cs.day_of_week THEN
                        now() + interval '1 day' * (cs.day_of_week - extract('dow' from now()))
                    ELSE
                        now() + interval '1 week' + interval '1 day' * (cs.day_of_week - extract('dow' from now()))
                    END AS date,
                    -fd.fare AS amount,
                    1 AS frequency_type,
                    1 AS frequency_type_variable,
                    cs.day_of_week AS frequency_day_of_week,
                    NULL AS frequency_week_of_month,
                    NULL AS frequency_month_of_year,
                    NULL AS remaining_balance
                FROM commute_schedule cs
                LEFT JOIN fare_details fd ON cs.fare_detail_id = fd.id
                LEFT JOIN commute_systems csy ON fd.commute_system_id = csy.id
                UNION ALL
                -- Generate subsequent billing dates based on frequency type
                SELECT
                    r.account_id,
                    r.title,
                    r.description,
                    CASE
                        -- Daily frequency
                        WHEN r.frequency_type = 0 THEN r.date + interval '1 day' * r.frequency_type_variable
                        -- Weekly frequency
                        WHEN r.frequency_type = 1 THEN 
                            CASE
                                WHEN extract('dow' from r.date) <= r.frequency_day_of_week THEN
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (r.frequency_day_of_week - extract('dow' from r.date))
                                ELSE
                                    r.date + interval '1 week' * r.frequency_type_variable + interval '1 day' * (7 - extract('dow' from r.date) + r.frequency_day_of_week)
                            END
                        -- Monthly frequency
                        WHEN r.frequency_type = 2 THEN
                            (r.date + interval '1 month' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 month' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        -- Annual frequency
                        WHEN r.frequency_type = 3 THEN
                            (r.date + interval '1 year' * r.frequency_type_variable)::date +
                            (CASE 
                                WHEN r.frequency_day_of_week IS NOT NULL THEN
                                    interval '1 day' * ((r.frequency_day_of_week - extract('dow' from (r.date + interval '1 year' * r.frequency_type_variable)::date) + 7) % 7)
                                ELSE
                                    interval '0 day'
                            END) +
                            (CASE 
                                WHEN r.frequency_week_of_month IS NOT NULL THEN
                                    interval '1 week' * r.frequency_week_of_month
                                ELSE
                                    interval '0 day'
                            END)
                        ELSE 
                            NULL
                    END AS date,
                    r.amount,
                    r.frequency_type,
                    r.frequency_type_variable,
                    r.frequency_day_of_week,
                    r.frequency_week_of_month,
                    r.frequency_month_of_year,
                    r.remaining_balance - ABS(r.amount) AS remaining_balance
                FROM 
                    recurring r
                WHERE
                    (r.date + interval '1 day') <= '$3
                    AND (r.remaining_balance IS NULL OR r.remaining_balance - ABS(r.amount) > 0)
            ),
            work_days_and_hours AS (
            	WITH ordered_table AS (
                SELECT
                    pd.payroll_day,
                    pd.job_id,
                    ROW_NUMBER() OVER (PARTITION BY pd.job_id ORDER BY pd.payroll_day) AS row_num
                FROM 
                    payroll_dates pd
                JOIN 
                    jobs j ON pd.job_id = j.id
                WHERE 
                    j.account_id = 1
            )
            SELECT
              	j.id AS job_id,
              	j.account_id,
                j.name,
                CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END AS start_date,
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) AS end_date,
                --d.date AS work_date,
                EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 AS hours_worked_per_day,
                j.hourly_rate,
                COALESCE(pt.rate, 0) AS tax_rate
            FROM 
                jobs j
            JOIN 
                job_schedule js ON j.id = js.job_id
            CROSS JOIN LATERAL generate_series(current_date, $3::date + INTERVAL '1 month', '1 month') AS d1(date)
            CROSS JOIN LATERAL (
                SELECT
                    CASE WHEN
                        (SELECT COUNT(*) FROM payroll_dates WHERE job_id = j.id) = 1 AND payroll_day < 31 THEN -(payroll_day + 1)
                    ELSE 
                        COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1
                    END AS payroll_start_day,
                    CASE 
                        WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')
                        ELSE payroll_day 
                    END AS unadjusted_payroll_end_day
                FROM 
                    ordered_table ot
                WHERE 
                    ot.job_id = j.id
            ) s2
            CROSS JOIN LATERAL (
                SELECT
                    s2.payroll_start_day,
                    CASE
                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                            THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, adjust to Friday
                        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                            THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, adjust to Friday
                        ELSE s2.unadjusted_payroll_end_day
                    END::integer AS adjusted_payroll_end_day
            ) s1
            JOIN LATERAL generate_series(
                CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END, 
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day),
                '1 day'
            ) AS d(date) ON js.day_of_week = EXTRACT(DOW FROM d.date)::integer
            LEFT JOIN (
                SELECT job_id, SUM(rate) AS rate
                FROM payroll_taxes
                GROUP BY job_id
            ) pt ON j.id = pt.job_id
            WHERE 
                j.account_id = $1 
                AND d.date >= CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END  
                AND d.date <= $3::date
            ORDER BY 
                j.name, start_date
            ),
            transaction_details AS (
                -- Get all transactions and calculate amount after tax
                SELECT 
                    th.account_id,
                    th.title,
                    th.description,
                    th.date_created AS date,
                    th.amount + (th.amount * th.tax_rate) AS amount
                FROM 
                    transaction_history th
            ),
            payroll_summary AS (
                SELECT
                    wdah.account_id,
                    wdah.end_date,
                    wdah.name,
                    SUM(wdah.hours_worked_per_day * wdah.hourly_rate * (1 - wdah.tax_rate)) AS amount
                FROM 
                    work_days_and_hours wdah
                GROUP BY 
              			wdah.job_id,
                    wdah.account_id, 
                    wdah.end_date, 
                    wdah.name
              ORDER BY end_date, name
            ),
            combined_details AS (
                SELECT
              		account_id,
              		title,
              		description,
              		date,
              		amount
              		FROM recurring
              		WHERE date >= now()
                  UNION
                  SELECT
                        ps.account_id,
                        CONCAT('Payroll for ', ps.name) AS title,
                        CONCAT('Payroll for ', ps.name) AS description,
                        ps.end_date AS date,
                        ps.amount
                    FROM 
                        payroll_summary ps
              			WHERE ps.end_date >= now()
              			ORDER BY date, title -- Ensure payroll ordering by date and title
            ),
            current_balance AS (
                -- Calculate the current balance for each account based on transactions
                SELECT 
                    account_id,
                    COALESCE(SUM(amount), 0) AS current_balance
                FROM 
                    transaction_details
                GROUP BY 
                    account_id
            ),
            projected_balance AS (
                SELECT
                    twb.date,
                    twb.account_id,
              			twb.amount,
                    COALESCE(SUM(twb.amount) OVER (PARTITION BY twb.account_id ORDER BY twb.date), 0) AS running_balance
                FROM 
                    transaction_with_balance twb
            ),
            wishlist_affordable AS (
                SELECT 
                    w.account_id,
                    w.title,
                    w.description,
                    -w.amount AS amount,
                    MIN(pb.date) AS date,
                    -(SELECT MAX(pb2.running_balance) FROM projected_balance pb2 WHERE pb2.account_id = w.account_id AND pb2.date <= MIN(pb.date)) AS running_balance
                FROM 
                    wishlist w
                JOIN 
                    projected_balance pb ON w.account_id = pb.account_id AND pb.running_balance > w.amount
                GROUP BY 
                    w.account_id, w.title, w.description, w.amount
            ),
            transaction_with_balance AS (
                -- Calculate the remaining balance after each transaction (reversed for transactions)
                SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
                    td.amount,
                		SUM(td.amount) OVER (PARTITION BY td.account_id ORDER BY td.date DESC) AS running_balance
                FROM 
                    transaction_details td
                UNION
                    SELECT
                    cd.account_id,
                    cd.title,
                    cd.description,
                    cd.date,
                    cd.amount,
                    COALESCE(SUM(-cd.amount) OVER (PARTITION BY cd.account_id ORDER BY cd.date, cd.title, cd.description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM 
                    combined_details cd
              WHERE 
                    cd.date < $3
							
              ORDER BY date, title, description
            ),
            all_transactions AS (
                SELECT 
                    twb.account_id,
                    twb.title,
                    twb.description,
                    twb.date,
                    twb.amount,
                    twb.running_balance
                FROM 
                    transaction_with_balance twb
                UNION
                SELECT 
                    wa.account_id,
                    wa.title,
                    wa.description,
                    wa.date,
                    wa.amount,
                    wa.running_balance + cb.current_balance AS running_balance
                FROM 
                    wishlist_affordable wa
              	LEFT JOIN 
                		current_balance cb ON wa.account_id = cb.account_id
                ORDER BY date, title, description
            ),
            recalculate_balances AS (
              SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
                    td.amount,
                		SUM(td.amount) OVER (PARTITION BY td.account_id ORDER BY td.date DESC) AS running_balance
                FROM 
                    transaction_details td
                UNION
                SELECT 
                    account_id,
                    title,
                    description,
                    date,
                    amount,
                    COALESCE(SUM(-amount) OVER (PARTITION BY account_id ORDER BY date, title, description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM (
                    SELECT 
                        account_id,
                        title,
                        description,
                        date,
                        amount
                    FROM (
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                            amount
                        FROM 
                            combined_details
                        UNION
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                            amount
                        FROM 
                            wishlist_affordable
                    ) AS generated_transactions
                ) AS combined
              ORDER BY date, title, description
            )
            SELECT
                a.id AS account_id,
                COALESCE(cb.current_balance, 0) AS current_balance,
                COALESCE(
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'title', twb.title,
                            'description', twb.description,
                            'amount', twb.amount,
                            'date', twb.date,
                            'balance', 
                                CASE 
                                    WHEN twb.running_balance IS NOT NULL THEN COALESCE(cb.current_balance, 0) - twb.running_balance + twb.amount 
                                    ELSE NULL 
                                END
                        ) ORDER BY twb.date
                    ) FILTER (WHERE twb.account_id IS NOT NULL), '[]'::json
                ) AS transactions
            FROM 
                accounts a
            LEFT JOIN 
                current_balance cb ON a.id = cb.account_id
            LEFT JOIN 
            (
                SELECT * FROM recalculate_balances 
                WHERE date > $2 AND date <= $3
            ) twb ON a.id = twb.account_id
            WHERE a.id = $1
            GROUP BY 
                a.id, cb.current_balance
            ORDER BY 
                a.id;
            `,
            [accountId, fromDate, toDate],
        );

        response.status(200).json(rows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting generated transactions for account id of ${accountId}`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};
