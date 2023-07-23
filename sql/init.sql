CREATE TABLE employee (
  employee_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL,
  regular_hours NUMERIC(4,2) NOT NULL,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  sick_days INTEGER NOT NULL DEFAULT 0,
  work_schedule BIT(7) NOT NULL
);

-- Create a accounts table in postgres
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  employee_id INTEGER REFERENCES accounts(account_id),
  account_name VARCHAR(255) NOT NULL,
  account_type INT NOT NULL,
  account_balance numeric(20, 2) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transactions table in postgres
CREATE TABLE IF NOT EXISTS transaction_history (
  transaction_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  transaction_amount numeric(12, 2) NOT NULL,
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
  account_id INT NOT NULL REFERENCES accounts(account_id),
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  expense_amount numeric(12, 2) NOT NULL,
  expense_title VARCHAR(255) NOT NULL,
  expense_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL,
  frequency_type_variable INT,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  expense_begin_date TIMESTAMP NOT NULL,
  expense_end_date TIMESTAMP,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a loans table in postgres
CREATE TABLE IF NOT EXISTS loans (
  loan_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  cron_job_id INT REFERENCES cron_jobs(cron_job_id),
  loan_amount numeric(12, 2) NOT NULL,
  loan_plan_amount numeric(12, 2) NOT NULL,
  loan_recipient VARCHAR(255) NOT NULL,
  loan_title VARCHAR(255) NOT NULL,
  loan_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL,
  frequency_type_variable INT,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  loan_interest_rate numeric(12, 2) NOT NULL,
  loan_interest_frequency_type INT NOT NULL,
  loan_begin_date TIMESTAMP NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create tables for payroll in postgres.
CREATE TABLE payroll_dates (
  payroll_date_id SERIAL PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employee(employee_id),
  payroll_start_day INTEGER NOT NULL,
  payroll_end_day INTEGER NOT NULL
);

CREATE TABLE payroll_taxes (
    payroll_taxes_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),
    name TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL
);

-- Create a wishlist table in postgres
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
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
  source_account_id INT NOT NULL REFERENCES accounts(account_id),
  destination_account_id INT NOT NULL REFERENCES accounts(account_id),
  transfer_amount numeric(12, 2) NOT NULL,
  transfer_title VARCHAR(255) NOT NULL,
  transfer_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL,
  frequency_type_variable INT,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  transfer_begin_date TIMESTAMP NOT NULL,
  transfer_end_date TIMESTAMP,
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