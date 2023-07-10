#!/bin/bash

# Fetch the employee IDs from the database using psql and environment variables
employeeIds=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "SELECT employee_id FROM employee" -t)

# Loop through the employee IDs and perform the task for each employee
for employeeId in $employeeIds; do
  # Perform the task for the current employee and capture the query result
  query="SELECT make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer) AS start_date,
        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) AS end_date,
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
        CROSS JOIN LATERAL generate_series(
            current_date, 
            $2 + INTERVAL '1 month',
            '1 month'
        ) AS d1(date)
        CROSS JOIN LATERAL (
            SELECT
            payroll_start_day,
            CASE 
                WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')
                ELSE payroll_end_day 
            END AS unadjusted_payroll_end_day
            FROM payroll_dates
        ) s2
        CROSS JOIN LATERAL (
            SELECT
            s2.payroll_start_day,
            CASE
                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                    THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                    THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
                ELSE s2.unadjusted_payroll_end_day
            END::integer AS adjusted_payroll_end_day
        ) s1
        CROSS JOIN LATERAL(
            SELECT
            generate_series(
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.payroll_start_day), 
                make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day),
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
        WHERE e.employee_id = $employeeId AND work_days <> 0 AND make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) >= CURRENT_DATE AND make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) <= $2
        GROUP BY d1, s2.payroll_start_day, e.employee_id, e.employee_id, s.work_days, s1.adjusted_payroll_end_day
        ORDER BY start_date, end_date;"

  # Execute the query for the current employee and capture the result
  result=$(PGPASSWORD="$PGPASSWORD" psql -h "$PGHOST" -p "$PGPORT" -d "$PGDB" -U "$PGUSER" -c "$query" -t)

  # Create a temporary file to store the result rows
  tmpFile=$(mktemp)

  # Write the result rows to the temporary file
  echo "$result" > "$tmpFile"

  # Loop through the result rows from the temporary file and create a cron job for each row
  while IFS="|" read -r startDate endDate workDays grossPay netPay hoursWorked; do
    # Generate a unique ID for the cron job based on the employee ID and payroll period
    cronJobId="payroll_${employeeId}_${startDate}_${endDate}"

    # Generate the cron schedule for the current payroll period
    cronSchedule="0 0 1 $endDate *"

    # Create the cron command with the payroll details
    cronCommand="/app/dist/crontab/scripts/createTransaction.sh --employee_id $employeeId --net_pay $netPay"

    # Create the cron job by appending the cron schedule and command to the crontab file
    echo "$cronSchedule $cronCommand" >> /etc/cron.d/$cronJobId

    # Print a message with the details of the created cron job
    echo "Created cron job for employee $employeeId with ID '$cronJobId' and schedule '$cronSchedule'"
  done < "$tmpFile"

  # Remove the temporary file
  rm "$tmpFile"
done
