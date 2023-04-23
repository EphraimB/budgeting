INSERT INTO employee (name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule) VALUES ('John Doe', 16.00, 8, 10, 5, B'0111100');;

INSERT INTO accounts (employee_id, account_name, account_type, account_balance) VALUES (1, 'Personal', 0, 1000.00);
INSERT INTO accounts (employee_id, account_name, account_type, account_balance) VALUES (null, 'Savings', 1, 5000.00);

INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES (1, 1000.00, 'Test Deposit');
INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES (2, 5000.00, 'Test Deposit');

INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES (1, 100.00, 'Test Withdrawal');
INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES (2, 500.00, 'Test Withdrawal');

INSERT INTO expenses (account_id, expense_amount, expense_title, expense_description, frequency_type, frequency_type_variable, expense_begin_date) VALUES (1, 100.00, 'Test Expense', 'Test Expense Description', 2, 1, NOW() + INTERVAL '1 month');

INSERT INTO loans (account_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, loan_begin_date) VALUES (1, 1000.00, 100.00, 'John Doe', 'Test Loan', 'Test Loan Description', 2, 1,  NOW() + INTERVAL '1 month');

INSERT INTO transfers (source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, transfer_begin_date) VALUES (1, 2, 100.00, 'Test Transfer', 'Test Transfer Description', 2, 1,  NOW() + INTERVAL '1 month');

INSERT INTO payroll_dates (employee_id, payroll_start_day, payroll_end_day) VALUES (1, 1, 15), (1, 16, 31);

-- Insert mock data for payroll_taxes table
INSERT INTO payroll_taxes (employee_id, name, rate, applies_to) VALUES 
    (1, 'Federal Income Tax', 0.15, 'gross_salary'),
    (1, 'State Income Tax', 0.05, 'gross_salary'),
    (1, 'Social Security Tax', 0.062, 'gross_salary'),
    (1, 'Medicare Tax', 0.0145, 'gross_salary');