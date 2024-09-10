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
  hourly_rate NUMERIC(6,2) NOT NULL,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  sick_days INTEGER NOT NULL DEFAULT 0
);

-- Create a work_schedule table in postgres
CREATE TABLE IF NOT EXISTS job_schedule (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE(day_of_week, start_time)
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
CREATE TABLE payroll_dates (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  payroll_day INTEGER NOT NULL
);

CREATE TABLE payroll_taxes (
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
  cron_job_id INT REFERENCES cron_jobs(id),
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
  cron_job_id INT REFERENCES cron_jobs(id) ON DELETE SET NULL,
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

CREATE OR REPLACE FUNCTION process_payroll_for_job(selected_job_id integer) RETURNS void AS $$
DECLARE
    pay_period RECORD;
    cron_expression text;
    inner_sql text;
BEGIN
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
            make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.payroll_start_day), 
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
            'payroll-' || selected_job_id || '-' || pay_period.start_date || '-' || pay_period.payroll_date,
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
