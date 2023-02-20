-- Create the budgeting database
CREATE DATABASE budgeting;

-- Create a accounts table in postgres
CREATE TABLE IF NOT EXISTS accounts (
  account_id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  account_type INT NOT NULL,
  account_balance MONEY NOT NULL,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);

-- Create a deposits table in postgres
CREATE TABLE IF NOT EXISTS deposits (
  deposit_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  deposit_amount MONEY NOT NULL,
  deposit_description VARCHAR(255) NOT NULL,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);

-- Create a withdrawals table in postgres
CREATE TABLE IF NOT EXISTS withdrawals (
  withdrawal_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  withdrawal_amount MONEY NOT NULL,
  withdrawal_description VARCHAR(255) NOT NULL,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);

-- Create a expenses table in postgres
CREATE TABLE IF NOT EXISTS expenses (
  expense_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  expense_amount MONEY NOT NULL,
  expense_title VARCHAR(255) NOT NULL,
  expense_description VARCHAR(255) NOT NULL,
  frequency INT NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  timezone_offset INT NOT NULL,
  expense_begin_date DATE NOT NULL,
  expense_end_date DATE,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);

-- Create a loans table in postgres
CREATE TABLE IF NOT EXISTS loans (
  loan_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  loan_amount MONEY NOT NULL,
  loan_plan_amount MONEY NOT NULL,
  loan_recipient VARCHAR(255) NOT NULL,
  loan_title VARCHAR(255) NOT NULL,
  loan_description VARCHAR(255) NOT NULL,
  frequency INT NOT NULL,
  timezone VARCHAR(255) NOT NULL,
  timezone_offset INT NOT NULL,
  loan_begin_date DATE NOT NULL,
  loan_end_date DATE,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);

-- Create a wishlist table in postgres
CREATE TABLE IF NOT EXISTS wishlist (
  wishlist_id SERIAL PRIMARY KEY,
  account_id INT NOT NULL REFERENCES accounts(account_id),
  wishlist_amount MONEY NOT NULL,
  wishlist_title VARCHAR(255) NOT NULL,
  wishlist_description VARCHAR(255) NOT NULL,
  wishlist_priority INT NOT NULL,
  date_created DATE NOT NULL,
  date_modified DATE NOT NULL
);