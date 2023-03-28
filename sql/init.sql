-- Create a accounts table in postgres
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_type INT NOT NULL,
  account_balance numeric(20, 2) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a deposits table in postgres
CREATE TABLE IF NOT EXISTS deposits (
  deposit_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  deposit_amount numeric(20, 2) NOT NULL,
  deposit_description VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a withdrawals table in postgres
CREATE TABLE IF NOT EXISTS withdrawals (
  withdrawal_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  withdrawal_amount numeric(20, 2) NOT NULL,
  withdrawal_description VARCHAR(255) NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a expenses table in postgres
CREATE TABLE IF NOT EXISTS expenses (
  expense_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  expense_amount numeric(20, 2) NOT NULL,
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
  loan_amount numeric(20, 2) NOT NULL,
  loan_plan_amount numeric(20, 2) NOT NULL,
  loan_recipient VARCHAR(255) NOT NULL,
  loan_title VARCHAR(255) NOT NULL,
  loan_description VARCHAR(255) NOT NULL,
  frequency_type INT NOT NULL,
  frequency_type_variable INT,
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  frequency_month_of_year INT,
  loan_begin_date TIMESTAMP NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create tables for payroll in postgres.
CREATE TABLE payroll_dates (
  payroll_date_id SERIAL PRIMARY KEY,
  day_of_month INTEGER NOT NULL
);

CREATE TABLE employee (
  employee_id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(account_id),
  name TEXT NOT NULL,
  hourly_rate NUMERIC(6,2) NOT NULL,
  regular_hours NUMERIC(4,2) NOT NULL,
  vacation_days INTEGER NOT NULL DEFAULT 0,
  sick_days INTEGER NOT NULL DEFAULT 0,
  work_schedule BIT(7) NOT NULL
);

CREATE TABLE timecards (
  timecards_id SERIAL PRIMARY KEY,
  work_date DATE NOT NULL,
  hours_worked NUMERIC(4,2) NOT NULL,
  is_vacation_day BOOLEAN NOT NULL DEFAULT false,
  is_sick_day BOOLEAN NOT NULL DEFAULT false,
  employee_id INTEGER NOT NULL REFERENCES employee(employee_id)
);

CREATE TABLE payroll_taxes (
    payroll_taxes_id SERIAL PRIMARY KEY,
    employee_id INTEGER NOT NULL REFERENCES employee(employee_id),
    name TEXT NOT NULL,
    rate NUMERIC(5,2) NOT NULL,
    applies_to TEXT
);

-- Create a wishlist table in postgres
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  wishlist_amount numeric(20, 2) NOT NULL,
  wishlist_title VARCHAR(255) NOT NULL,
  wishlist_description VARCHAR(255) NOT NULL,
  wishlist_priority INT NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
);

-- Create a transfers table in postgres that will transfer money from one account to another
CREATE TABLE IF NOT EXISTS transfers (
  transfer_id SERIAL PRIMARY KEY,
  source_account_id INT NOT NULL REFERENCES accounts(account_id),
  destination_account_id INT NOT NULL REFERENCES accounts(account_id),
  transfer_amount numeric(20, 2) NOT NULL,
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

CREATE OR REPLACE FUNCTION set_null_columns() RETURNS TRIGGER AS $$
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

CREATE OR REPLACE FUNCTION add_timecard_if_needed()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM timecards
    WHERE employee_id = NEW.employee_id
      AND work_date = NEW.work_date
      AND hours_worked = NEW.hours_worked
      AND is_vacation_day = NEW.is_vacation_day
      AND is_sick_day = NEW.is_sick_day
  ) THEN
    RETURN NULL;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_accounts_dates
BEFORE INSERT OR UPDATE ON accounts
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_deposits_dates
BEFORE INSERT OR UPDATE ON deposits
FOR EACH ROW
EXECUTE PROCEDURE update_dates();

CREATE TRIGGER update_withdrawals_dates
BEFORE INSERT OR UPDATE ON withdrawals
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

CREATE TRIGGER set_null_columns_expenses BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();

CREATE TRIGGER set_null_columns_loans BEFORE INSERT OR UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();

CREATE TRIGGER timecards_insert_trigger
BEFORE INSERT ON timecards
FOR EACH ROW
EXECUTE FUNCTION add_timecard_if_needed();
