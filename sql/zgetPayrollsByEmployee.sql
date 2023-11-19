SELECT make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer) AS start_date,
            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
            SUM(s.work_days::integer) AS work_days,
                SUM(COALESCE(
                    e.regular_hours * e.hourly_rate * work_days
                ))::numeric(20, 2) AS gross_pay,
                SUM(COALESCE(
                    e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
                ))::numeric(20, 2) AS net_pay,
            SUM(COALESCE(
                    e.regular_hours * work_days
                ))::numeric(20, 2) AS hours_worked
                FROM employee e
            CROSS JOIN LATERAL (
            SELECT
                payroll_start_day,
                CASE 
                    WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                    THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                    ELSE payroll_end_day 
                    END AS unadjusted_payroll_end_day
                FROM payroll_dates
            ) s2
            CROSS JOIN LATERAL (
                SELECT
                s2.payroll_start_day,
                CASE
                    WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                        THEN s2.unadjusted_payroll_end_day - 2 -- If it\'s a Sunday, subtract 2 days to get to Friday
                    WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                        THEN s2.unadjusted_payroll_end_day - 1 -- If it\'s a Saturday, subtract 1 day to get to Friday
                    ELSE s2.unadjusted_payroll_end_day
                END::integer AS adjusted_payroll_end_day
            ) s1
            CROSS JOIN LATERAL(
                SELECT
                generate_series(
                make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.payroll_start_day), 
                make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day),
                '1 day'
                )
                ) AS dates(date)
            CROSS JOIN LATERAL (
                SELECT
                SUM(CASE 
                    WHEN (work_schedule::integer & (1 << (6 - extract(dow from dates.date)::integer))) <> 0
                    THEN 1 
                    ELSE 0 
                END) AS work_days
                FROM employee e
            ) s
            LEFT JOIN (
                SELECT employee_id, SUM(rate) AS rate
                FROM payroll_taxes
                GROUP BY employee_id
            ) pt ON e.employee_id = pt.employee_id
            WHERE e.employee_id = employee_record.employee_id AND work_days <> 0
            GROUP BY s2.payroll_start_day, e.employee_id, s.work_days, s1.adjusted_payroll_end_day
            ORDER BY start_date, end_date