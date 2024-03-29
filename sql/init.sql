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
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a jobs table in postgres
CREATE TABLE IF NOT EXISTS jobs (
  job_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  sick_days INTEGER NOT NULL DEFAULT 0
);

-- Create a work_schedule table in postgres
CREATE TABLE IF NOT EXISTS job_schedule (
  job_schedule_id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  UNIQUE(day_of_week, start_time)
);

-- Create a taxes table in postgres
CREATE TABLE IF NOT EXISTS taxes (
  tax_id SERIAL PRIMARY KEY,
  tax_rate numeric(8, 6) NOT NULL,
  tax_title VARCHAR(255) NOT NULL,
  tax_description VARCHAR(255) NOT NULL,
  tax_type INT NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transactions table in postgres
CREATE TABLE IF NOT EXISTS transaction_history (
  transaction_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  transaction_amount numeric(12, 2) NOT NULL,
  transaction_tax_rate numeric(8, 6) NOT NULL,
  transaction_title VARCHAR(255) NOT NULL,
  transaction_description VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a cron_jobs table in postgres
CREATE TABLE IF NOT EXISTS cron_jobs (
  cron_job_id SERIAL PRIMARY KEY,
  unique_id VARCHAR(255) NOT NULL,
  cron_expression VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a expenses table in postgres
CREATE TABLE IF NOT EXISTS expenses (
  expense_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(tax_id),
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  expense_amount numeric(12, 2) NOT NULL,
  expense_title VARCHAR(255) NOT NULL,
  expense_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  expense_subsidized numeric(2,2) NOT NULL DEFAULT 0,
  expense_begin_date TIMESTAMP NOT NULL,
  expense_end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a loans table in postgres
CREATE TABLE IF NOT EXISTS loans (
  loan_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  interest_cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  loan_amount numeric(12, 2) NOT NULL,
  loan_plan_amount numeric(12, 2) NOT NULL,
  loan_recipient VARCHAR(255) NOT NULL,
  loan_title VARCHAR(255) NOT NULL,
  loan_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  loan_interest_rate numeric(2, 2) NOT NULL,
  loan_interest_frequency_type INT NOT NULL,
  loan_subsidized numeric(2,2) NOT NULL,
  loan_begin_date TIMESTAMP NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create tables for payroll in postgres.
CREATE TABLE payroll_dates (
  payroll_date_id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  payroll_end_date INTEGER NOT NULL
);

CREATE TABLE payroll_taxes (
    payroll_taxes_id SERIAL PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL
);

-- Create a wishlist table in postgres
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(tax_id),
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  wishlist_amount numeric(12, 2) NOT NULL,
  wishlist_title VARCHAR(255) NOT NULL,
  wishlist_description VARCHAR(255) NOT NULL,
  wishlist_url_link VARCHAR(255),
  wishlist_priority INT NOT NULL,
  wishlist_date_available TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transfers table in postgres that will transfer money from one account to another
CREATE TABLE IF NOT EXISTS transfers (
  transfer_id SERIAL PRIMARY KEY,
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  source_account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  destination_account_id INT NOT NULL REFERENCES accounts(account_id),
  transfer_amount numeric(12, 2) NOT NULL,
  transfer_title VARCHAR(255) NOT NULL,
  transfer_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  transfer_begin_date TIMESTAMP NOT NULL,
  transfer_end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a income table in postgres
CREATE TABLE IF NOT EXISTS income (
  income_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  tax_id INT REFERENCES taxes(tax_id),
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  income_amount numeric(12, 2) NOT NULL,
  income_title VARCHAR(255) NOT NULL,
  income_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL DEFAULT 2,
  frequency_type_variable INT NOT NULL DEFAULT 1,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  income_begin_date TIMESTAMP NOT NULL,
  income_end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS commute_systems (
  commute_system_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  fare_cap NUMERIC(5,2),
  fare_cap_duration INT,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS fare_details (
  fare_detail_id SERIAL PRIMARY KEY,
  commute_system_id INT NOT NULL REFERENCES commute_systems(commute_system_id),
  name VARCHAR(255) NOT NULL,
  fare_amount NUMERIC(5,2) NOT NULL,
  timed_pass_duration INT,
  is_fixed_days BOOLEAN DEFAULT FALSE,
  is_monthly BOOLEAN DEFAULT FALSE,
  alternate_fare_detail_id INT REFERENCES fare_details(fare_detail_id),
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS timeslots (
  timeslot_id SERIAL PRIMARY KEY,
  fare_detail_id INT NOT NULL REFERENCES fare_details(fare_detail_id),
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS commute_schedule (
  commute_schedule_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  day_of_week INT NOT NULL,
  start_time TIME NOT NULL,
  duration INT NOT NULL,
  fare_detail_id INT NOT NULL REFERENCES fare_details(fare_detail_id),
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL,
  UNIQUE(day_of_week, start_time)
);

CREATE TABLE IF NOT EXISTS commute_history (
  commute_history_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  fare_amount NUMERIC(5,2) NOT NULL,
  commute_system VARCHAR(255) NOT NULL,
  fare_type VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  is_timed_pass BOOLEAN DEFAULT FALSE,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS active_timed_passes (
  active_pass_id SERIAL PRIMARY KEY,
  commute_schedule_id INT NOT NULL REFERENCES commute_schedule(commute_schedule_id),
  fare_detail_id INT NOT NULL REFERENCES fare_details(fare_detail_id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
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

CREATE OR REPLACE FUNCTION update_wishlist_priority()
RETURNS TRIGGER AS $$
BEGIN
  NEW.wishlist_priority = (SELECT COALESCE(MAX(wishlist_priority), 0) + 1 FROM wishlist);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_fare_detail_id()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if alternate_fare_detail_id is equal to the new fare_detail_id
    IF NEW.alternate_fare_detail_id = NEW.fare_detail_id THEN
        RAISE EXCEPTION 'alternate_fare_detail_id cannot be the same as fare_detail_id';
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
    SELECT 
        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer) AS start_date,
        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
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
        JOIN job_schedule js ON j.job_id = js.job_id
        CROSS JOIN LATERAL (
            SELECT 
                payroll_start_day,
                CASE 
                    WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') THEN 
                        EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                    ELSE payroll_end_day 
                END AS unadjusted_payroll_end_day
            FROM payroll_dates
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
        ) pt ON j.job_id = pt.job_id
    WHERE 
        j.job_id = selected_job_id
        AND js.day_of_week = EXTRACT(DOW FROM gs.date)::integer
    GROUP BY 
        s2.payroll_start_day, s1.adjusted_payroll_end_day
    ORDER BY 
        start_date, end_date
    LOOP
        cron_expression := '0 0 ' || EXTRACT(DAY FROM pay_period.end_date) || ' ' || EXTRACT(MONTH FROM pay_period.end_date) || ' *';

        inner_sql := format('INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description, date_created, date_modified) VALUES ((SELECT account_id FROM jobs WHERE job_id = %L), %L, %L, ''Payroll'', ''Payroll for %s to %s'', current_timestamp, current_timestamp)',
                    selected_job_id, pay_period.gross_pay, (pay_period.gross_pay - pay_period.net_pay) / pay_period.gross_pay, pay_period.start_date, pay_period.end_date);

        EXECUTE format('SELECT cron.schedule(%L, %L, %L)',
            'payroll-' || selected_job_id || '-' || pay_period.start_date || '-' || pay_period.end_date,
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

CREATE TRIGGER update_comute_systems_dates
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

CREATE TRIGGER update_active_timed_passes_dates
BEFORE INSERT OR UPDATE ON active_timed_passes
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

CREATE TRIGGER update_wishlist_priority_trigger
BEFORE INSERT ON wishlist
FOR EACH ROW
EXECUTE FUNCTION update_wishlist_priority();

CREATE TRIGGER trigger_check_fare_detail_id
BEFORE INSERT ON fare_details
FOR EACH ROW
EXECUTE FUNCTION check_fare_detail_id();
