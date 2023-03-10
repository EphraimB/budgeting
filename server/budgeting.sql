-- Create the budgeting database
CREATE DATABASE budgeting;

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
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
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
  frequency_day_of_month INT,
  frequency_day_of_week INT,
  frequency_week_of_month INT,
  loan_begin_date TIMESTAMP NOT NULL,
  date_created TIMESTAMP NOT NULL,
  date_modified TIMESTAMP NOT NULL
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
    NEW.frequency_day_of_month = NULL;
    NEW.frequency_week_of_month = NULL;
  ELSIF NEW.frequency_type = 1 THEN
    NEW.frequency_week_of_month = NULL;
  END IF;
  RETURN NEW;
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

CREATE TRIGGER set_null_columns_expenses BEFORE INSERT OR UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();

CREATE TRIGGER set_null_columns_loans BEFORE INSERT OR UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION set_null_columns();