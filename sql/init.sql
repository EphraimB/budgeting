-- Create the 'marco' role
CREATE ROLE marco LOGIN PASSWORD 'securepassword';

-- Connect to the 'budgeting' database to perform further operations
\c budgeting

-- Now create the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Now create the plpythonu extension
CREATE EXTENSION plpython3u;

-- Grant usage to the 'marco' role
GRANT USAGE ON SCHEMA cron TO marco;

-- Perform other database initializations as needed

-- Create a accounts table in postgres
CREATE TABLE IF NOT EXISTS accounts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a jobs table in postgres
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL
);

-- Create a work_schedule table in postgres
CREATE TABLE IF NOT EXISTS job_schedule (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE(day_of_week, start_time, end_time)
);

-- Create a taxes table in postgres
CREATE TABLE IF NOT EXISTS taxes (
  id SERIAL PRIMARY KEY,
  rate numeric(8, 6) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  type INT NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transactions table in postgres
CREATE TABLE IF NOT EXISTS transaction_history (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount numeric(12, 2) NOT NULL,
  tax_rate numeric(8, 6) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a cron_jobs table in postgres
CREATE TABLE IF NOT EXISTS cron_jobs (
  id SERIAL PRIMARY KEY,
  unique_id VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a expenses table in postgres
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(id),
  cron_job_id INT REFERENCES cron_jobs(id),
  amount numeric(12, 2) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  subsidized numeric(2,2) NOT NULL DEFAULT 0,
  begin_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a loans table in postgres
CREATE TABLE IF NOT EXISTS loans (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  cron_job_id INT REFERENCES cron_jobs(id),
  interest_cron_job_id INT REFERENCES cron_jobs(id),
  amount numeric(12, 2) NOT NULL,
  plan_amount numeric(12, 2) NOT NULL,
  recipient VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  interest_rate numeric(2, 2) NOT NULL,
  interest_frequency_type INT NOT NULL,
  subsidized numeric(2,2) NOT NULL,
  begin_date TIMESTAMP NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create tables for payroll in postgres.
CREATE TABLE IF NOT EXISTS payroll_dates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  payroll_day INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payroll_taxes (
    id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL
);

-- Create a wishlist table in postgres
CREATE TABLE IF NOT EXISTS wishlist (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(id),
  cron_job_id INT REFERENCES cron_jobs(id) ON DELETE SET NULL,
  amount numeric(12, 2) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  url_link VARCHAR(255),
  priority INT NOT NULL,
  date_available TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transfers table in postgres that will transfer money from one account to another
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  cron_job_id INT REFERENCES cron_jobs(id),
  source_account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  destination_account_id INT NOT NULL REFERENCES accounts(id),
  amount numeric(12, 2) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  begin_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a income table in postgres
CREATE TABLE IF NOT EXISTS income (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(id),
  cron_job_id INT REFERENCES cron_jobs(id),
  amount numeric(12, 2) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  begin_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS commute_systems (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  fare_cap NUMERIC(5,2),
  fare_cap_duration INT,  -- 0 for daily, 1 for weekly, 2 for monthly, and 3 for yearly
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS fare_details (
  id SERIAL PRIMARY KEY,
  commute_system_id INT NOT NULL REFERENCES commute_systems(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  fare NUMERIC(5,2) NOT NULL,
  duration INT,  -- NULL for trip-based fares or an integer representing days for passes
  day_start INT, -- NULL for no specific start day, or an integer representing the day of the month the pass starts
  alternate_fare_detail_id INT REFERENCES fare_details(id) ON DELETE SET NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS timeslots (
  id SERIAL PRIMARY KEY,
  fare_details_id INT NOT NULL REFERENCES fare_details(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS commute_schedule (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  cron_job_id INT REFERENCES cron_jobs(id),
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  fare_detail_id INT NOT NULL REFERENCES fare_details(id) ON DELETE CASCADE,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL,
  UNIQUE(account_id, day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS commute_history (
  id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  commute_system VARCHAR(255) NOT NULL,
  fare_type VARCHAR(255) NOT NULL,
  fare NUMERIC(5,2) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  is_timed_pass BOOLEAN DEFAULT FALSE,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Trigger to update the date_modified column when a row is updated
CREATE OR REPLACE FUNCTION update_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        NEW.date_created = current_timestamp;
        NEW.date_modified = current_timestamp;
    ELSIF (TG_OP = 'UPDATE') THEN
        NEW.date_modified = current_timestamp;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION set_null_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.frequency_type = 0 THEN
    NEW.frequency_day_of_week = NULL;
    NEW.frequency_week_of_month = NULL;
    NEW.frequency_month_of_year = NULL;
  ELSIF NEW.frequency_type = 1 THEN
    NEW.frequency_week_of_month = NULL;
    NEW.frequency_month_of_year = NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_fare_detail_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if alternate_fare_detail_id is equal to the new fare_detail_id
    IF NEW.alternate_fare_detail_id = NEW.id THEN
        RAISE EXCEPTION 'alternate_fare_detail_id cannot be the same as id';
    END IF;
    -- If all checks pass, return the new row for insertion
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_generated_transactions(from_date date, to_date date)
RETURNS TABLE(
  a_id integer,
  transactions json,
  wishlists json
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE recurring AS (
    -- Initialize with the starting dates
    SELECT 
        e.account_id,
        e.title,
        e.description,
        e.begin_date AS date,
        -e.amount AS subtotal,
        COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0) AS tax_rate,
        -e.amount + (-e.amount * COALESCE((SELECT rate FROM taxes WHERE id = e.tax_id), 0)) AS amount,
        e.frequency_type,
        e.frequency_type_variable,
        e.frequency_day_of_week,
        e.frequency_week_of_month,
        e.frequency_month_of_year,
        NULL::NUMERIC AS remaining_balance,
        NULL::NUMERIC AS fare_cap,
        NULL::INTEGER AS fare_cap_duration,
        NULL::INTEGER AS commute_system_id
    FROM 
        expenses e
    UNION
    SELECT
        l.account_id,
        l.title,
        l.description,
        l.begin_date AS date,
        -l.plan_amount AS subtotal,
        0 AS tax_rate,
        -l.plan_amount AS amount,
        l.frequency_type,
        l.frequency_type_variable,
        l.frequency_day_of_week,
        l.frequency_week_of_month,
        l.frequency_month_of_year,
        l.amount AS remaining_balance,
        NULL::NUMERIC AS fare_cap,
        NULL::INTEGER AS fare_cap_duration,
        NULL::INTEGER AS commute_system_id
    FROM loans l
    UNION
    SELECT 
        t.source_account_id,
        t.title,
        t.description,
        t.begin_date AS date,
        -t.amount AS subtotal,
        0 AS tax_rate,
        -t.amount AS amount,
        t.frequency_type,
        t.frequency_type_variable,
        t.frequency_day_of_week,
        t.frequency_week_of_month,
        t.frequency_month_of_year,
        NULL::NUMERIC AS remaining_balance,
        NULL::NUMERIC AS fare_cap,
        NULL::INTEGER AS fare_cap_duration,
        NULL::INTEGER AS commute_system_id
    FROM 
        transfers t
    UNION
    SELECT 
        td.destination_account_id,
        td.title,
        td.description,
        td.begin_date AS date,
        td.amount AS subtotal,
        0 AS tax_rate,
        td.amount AS amount,
        td.frequency_type,
        td.frequency_type_variable,
        td.frequency_day_of_week,
        td.frequency_week_of_month,
        td.frequency_month_of_year,
        NULL::NUMERIC AS remaining_balance,
        NULL::NUMERIC AS fare_cap,
        NULL::INTEGER AS fare_cap_duration,
        NULL::INTEGER AS commute_system_id
    FROM 
        transfers td
    UNION
    SELECT 
        i.account_id,
        i.title,
        i.description,
        i.begin_date AS date,
        i.amount AS subtotal,
        COALESCE((SELECT rate FROM taxes WHERE id = i.tax_id), 0) AS tax_rate,
        i.amount + (-i.amount * COALESCE((SELECT rate FROM taxes WHERE id = i.tax_id), 0)) AS amount,
        i.frequency_type,
        i.frequency_type_variable,
        i.frequency_day_of_week,
        i.frequency_week_of_month,
        i.frequency_month_of_year,
        NULL::NUMERIC AS remaining_balance,
        NULL::NUMERIC AS fare_cap,
        NULL::INTEGER AS fare_cap_duration,
        NULL::INTEGER AS commute_system_id
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
        -fd.fare AS subtotal,
        0 AS tax_rate,
        -fd.fare AS amount,
        1 AS frequency_type,
        1 AS frequency_type_variable,
        cs.day_of_week AS frequency_day_of_week,
        NULL AS frequency_week_of_month,
        NULL AS frequency_month_of_year,
        NULL AS remaining_balance,
        csy.fare_cap AS fare_cap,
        csy.fare_cap_duration AS fare_cap_duration,
        csy.id AS commute_system_id
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
        r.subtotal,
        r.tax_rate,
        r.amount,
        r.frequency_type,
        r.frequency_type_variable,
        r.frequency_day_of_week,
        r.frequency_week_of_month,
        r.frequency_month_of_year,
        r.remaining_balance - ABS(r.amount) AS remaining_balance,
        r.fare_cap,
        r.fare_cap_duration,
        r.commute_system_id
    FROM 
        recurring r
    WHERE
        (r.date + interval '1 day') <= to_date
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
            CROSS JOIN LATERAL generate_series(current_date, to_date::date + INTERVAL '1 month', '1 month') AS d1(date)
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
            WHERE d.date >= CASE
                    WHEN s2.payroll_start_day::integer < 0 THEN
                        (make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
                    ELSE 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
                END  
                AND d.date <= to_date::date
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
              			th.amount AS subtotal,
              			th.tax_rate AS tax_rate,
                    th.amount + (th.amount * th.tax_rate) AS amount
                FROM 
                    transaction_history th
            ),
            payroll_summary AS (
                SELECT
                    wdah.account_id,
                    wdah.end_date,
                    wdah.name,
              			SUM(wdah.hours_worked_per_day * wdah.hourly_rate) AS subtotal,
              			wdah.tax_rate AS tax_rate,
                    SUM(wdah.hours_worked_per_day * wdah.hourly_rate * (1 - wdah.tax_rate)) AS amount
                FROM 
                    work_days_and_hours wdah
                GROUP BY 
              			wdah.job_id,
                    wdah.account_id, 
                    wdah.end_date, 
                    wdah.name,
              			wdah.tax_rate
              ORDER BY end_date, name
            ),
            combined_details AS (
                SELECT
              		account_id,
              		title,
              		description,
              		date,
              		subtotal,
              		tax_rate,
              		amount
              		FROM recurring
              		WHERE date >= now()
                  UNION
                  SELECT
                        ps.account_id,
                        CONCAT('Payroll for ', ps.name) AS title,
                        CONCAT('Payroll for ', ps.name) AS description,
                        ps.end_date AS date,
              					ps.subtotal,
              					ps.tax_rate,
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
                                -w.amount AS subtotal,
                                    COALESCE((SELECT rate FROM taxes WHERE id = w.tax_id), 0) AS tax_rate,
                                    -w.amount + (-w.amount * COALESCE((SELECT rate FROM taxes WHERE id = w.tax_id), 0)) AS amount,
                                MIN(pb.date) AS date,
                                -(SELECT MAX(pb2.running_balance) FROM projected_balance pb2 WHERE pb2.account_id = w.account_id AND pb2.date <= MIN(pb.date)) AS running_balance
                            FROM 
                                wishlist w
                            JOIN 
                                projected_balance pb ON w.account_id = pb.account_id AND pb.running_balance > w.amount AND (w.date_available IS NULL OR pb.date >= w.date_available) AND pb.date > now()
                            GROUP BY 
                                w.account_id, w.title, w.description, w.amount, w.tax_id
                        ),
            transaction_with_balance AS (
                -- Calculate the remaining balance after each transaction (reversed for transactions)
                SELECT 
                    td.account_id,
                    td.title,
                    td.description,
                    td.date,
              			td.subtotal,
              			td.tax_rate,
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
              			cd.subtotal,
              			cd.tax_rate,
                    cd.amount,
                    COALESCE(SUM(-cd.amount) OVER (PARTITION BY cd.account_id ORDER BY cd.date, cd.title, cd.description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM 
                    combined_details cd
              WHERE 
                    cd.date < to_date
							
              ORDER BY date, title, description
            ),
            all_transactions AS (
                SELECT 
                    twb.account_id,
                    twb.title,
                    twb.description,
                    twb.date,
              			twb.subtotal,
              			twb.tax_rate,
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
              			wa.subtotal,
              			wa.tax_rate,
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
              			td.subtotal,
              			td.tax_rate,
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
              			subtotal,
              			tax_rate,
                    amount,
                    COALESCE(SUM(-amount) OVER (PARTITION BY account_id ORDER BY date, title, description ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS running_balance
                FROM (
                    SELECT 
                        account_id,
                        title,
                        description,
                        date,
                  			subtotal,
                  			tax_rate,
                        amount
                    FROM (
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                      			subtotal,
                      			tax_rate,
                            amount
                        FROM 
                            combined_details
                        UNION
                        SELECT 
                            account_id,
                            title,
                            description,
                            date,
                      			subtotal,
                      			tax_rate,
                            amount
                        FROM 
                            wishlist_affordable
                    ) AS generated_transactions
                ) AS combined
              ORDER BY date, title, description
            )
            SELECT 
              a.id AS account_id,
              COALESCE(t.transactions, '[]'::json) AS transactions,
              COALESCE(w.wishlists, '[]'::json) AS wishlists
            FROM 
              accounts a
              LEFT JOIN (
                SELECT 
                  a.id AS account_id,
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', gen_random_uuid(),
                      'title', twb.title,
                      'description', twb.description,
                      'amount', twb.subtotal,
                      'taxRate', twb.tax_rate,
                      'totalAmount', twb.amount,
                      'date', twb.date,
                      'balance', 
                        CASE 
                          WHEN twb.running_balance IS NOT NULL THEN COALESCE(cb.current_balance, 0) - twb.running_balance + twb.amount 
                          ELSE NULL 
                        END
                    )
                  ) FILTER (WHERE twb.title IS NOT NULL OR twb.description IS NOT NULL OR twb.subtotal IS NOT NULL OR twb.tax_rate IS NOT NULL OR twb.amount IS NOT NULL OR twb.date IS NOT NULL) AS transactions
                FROM 
                  accounts a
                LEFT JOIN 
                  current_balance cb ON a.id = cb.account_id
                LEFT JOIN 
                (
                  SELECT * FROM recalculate_balances 
                  WHERE date > from_date AND date <= to_date
                ) twb ON a.id = twb.account_id
                GROUP BY 
                  a.id
              ) t ON a.id = t.account_id
              LEFT JOIN (
                SELECT 
                  w.account_id,
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', w.id,
                      'title', w.title,
                      'description', w.description,
                      'amount', w.amount,
                      'taxId', w.tax_id,
                      'dateAvailable', w.date_available,
                      'dateCanPurchase', COALESCE(
                        (
                            SELECT 
                                MIN(pb.date)
                            FROM 
                                projected_balance pb
                            WHERE 
                                pb.running_balance > w.amount AND (w.date_available IS NULL OR pb.date >= w.date_available) AND pb.date > now()
                        ),
                        NULL
                        )
                    )
                  ) FILTER (WHERE w.title IS NOT NULL OR w.description IS NOT NULL OR w.amount IS NOT NULL OR w.tax_id IS NOT NULL OR w.date_available IS NOT NULL) AS wishlists
                FROM 
                  wishlist w
                GROUP BY 
                  w.account_id
              ) w ON a.id = w.account_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION process_payroll_for_job(selected_job_id integer) RETURNS void AS $$
DECLARE
    pay_period RECORD;
    cron_expression text;
    inner_sql text;
BEGIN
    -- Step 1: Unschedule all cron jobs related to the selected job_id
    FOR pay_period IN
        SELECT jobname 
        FROM cron.job
        WHERE jobname LIKE 'payroll-' || selected_job_id || '-%'
    LOOP
        -- Unschedule each payroll job related to the selected job_id
        PERFORM cron.unschedule(pay_period.jobname);
    END LOOP;

    -- Step 2: Proceed with payroll processing
    FOR pay_period IN
    WITH ordered_table AS (
            SELECT payroll_day,
            ROW_NUMBER() OVER (ORDER BY payroll_day) AS row_num
            FROM payroll_dates
            WHERE job_id = selected_job_id
    )
    SELECT
        CASE
						WHEN s2.payroll_start_day::integer < 0 THEN
							(make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
						ELSE 
							make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer)
					END AS start_date,
        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS payroll_date,
        COUNT(js.day_of_week) AS work_days,
        SUM(
            COALESCE(
                EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 * j.hourly_rate, 
                0
            )
        )::numeric(20, 2) AS gross_pay,
        SUM(
            COALESCE(
                EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 * j.hourly_rate * (1 - COALESCE(pt.rate, 0)), 
                0
            )
        )::numeric(20, 2) AS net_pay,
        SUM(
            COALESCE(
                EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600, 
                0
            )
        )::numeric(20, 2) AS hours_worked
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
                    WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') THEN 
                        EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                    ELSE payroll_day
                END AS unadjusted_payroll_end_day
            FROM ordered_table
        ) s2
        CROSS JOIN LATERAL (
            SELECT
                s2.payroll_start_day,
                CASE
                    WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 THEN
                        s2.unadjusted_payroll_end_day - 2
                    WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6 THEN
                        s2.unadjusted_payroll_end_day - 1
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
        ) AS gs(date) ON true
        LEFT JOIN (
            SELECT job_id, SUM(rate) AS rate
            FROM payroll_taxes
            GROUP BY job_id
        ) pt ON j.id = pt.job_id
    WHERE 
        j.id = selected_job_id
        AND js.day_of_week = EXTRACT(DOW FROM gs.date)::integer
    GROUP BY 
        s2.payroll_start_day, s1.adjusted_payroll_end_day
    ORDER BY 
        start_date, payroll_date
    LOOP
        cron_expression := '0 0 ' || EXTRACT(DAY FROM pay_period.payroll_date) || ' ' || EXTRACT(MONTH FROM pay_period.payroll_date) || ' *';

        inner_sql := format('INSERT INTO transaction_history (account_id, amount, tax_rate, title, description, date_created, date_modified) VALUES ((SELECT account_id FROM jobs WHERE id = %L), %L, %L, ''Payroll'', ''Payroll for %s to %s'', current_timestamp, current_timestamp)',
                    selected_job_id, pay_period.gross_pay, (pay_period.gross_pay - pay_period.net_pay) / pay_period.gross_pay, pay_period.start_date, pay_period.payroll_date);

        EXECUTE format('SELECT cron.schedule(%L, %L, %L)',
            'payroll-' || selected_job_id || '-' || EXTRACT(DAY FROM pay_period.payroll_date),
            cron_expression,
            inner_sql);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_accounts_dates
BEFORE INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_transactions_dates
BEFORE INSERT OR UPDATE ON transaction_history
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_expenses_dates
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_loans_dates
BEFORE INSERT OR UPDATE ON loans
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_wishlist_dates
BEFORE INSERT OR UPDATE ON wishlist
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_transfers_dates
BEFORE INSERT OR UPDATE ON transfers
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_cron_jobs_dates
BEFORE INSERT OR UPDATE ON cron_jobs
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_taxes_dates
BEFORE INSERT OR UPDATE ON taxes
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_income_dates
BEFORE INSERT OR UPDATE ON income
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_commute_systems_dates
BEFORE INSERT OR UPDATE ON commute_systems
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_fare_details_dates
BEFORE INSERT OR UPDATE ON fare_details
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_timeslots_details_dates
BEFORE INSERT OR UPDATE ON timeslots
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_commute_schedule_dates
BEFORE INSERT OR UPDATE ON commute_schedule
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_commute_history_dates
BEFORE INSERT OR UPDATE ON commute_history
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER set_null_columns_expenses
BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();

CREATE TRIGGER set_null_columns_loans
BEFORE INSERT OR UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();

CREATE TRIGGER trigger_check_fare_detail_id
BEFORE INSERT ON fare_details
FOR EACH ROW
EXECUTE FUNCTION check_fare_detail_id();
