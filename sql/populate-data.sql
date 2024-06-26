INSERT INTO accounts (account_name) VALUES ('Personal');
INSERT INTO accounts (account_name) VALUES ('Savings');

INSERT INTO jobs (account_id, job_name, hourly_rate, vacation_days, sick_days) VALUES (1, 'Testing Inc.', 16.00, 15, 15);
INSERT INTO job_schedule (job_id, day_of_week, start_time, end_time) VALUES (1, 1, '09:00:00', '17:00:00');
INSERT INTO job_schedule (job_id, day_of_week, start_time, end_time) VALUES (1, 2, '09:00:00', '17:00:00');
INSERT INTO job_schedule (job_id, day_of_week, start_time, end_time) VALUES (1, 3, '09:00:00', '17:00:00');
INSERT INTO job_schedule (job_id, day_of_week, start_time, end_time) VALUES (1, 4, '09:00:00', '17:00:00');

INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (1, 1000.00, 0, 'Test Deposit', 'Just a test deposit');
INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (2, 5000.00, 0, 'Test Deposit', 'Just a test deposit');

INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (1, -100.00, 0, 'Test Withdrawal', 'Just a test withdrawal');
INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES (2, -500.00, 0.08875, 'Test Withdrawal', 'Just a test withdrawal');

INSERT INTO payroll_dates (job_id, payroll_day) VALUES (1, 15), (1, 31);

-- Insert mock data for payroll_taxes table
INSERT INTO payroll_taxes (job_id, name, rate) VALUES 
    (1, 'Federal Income Tax', 0.15),
    (1, 'State Income Tax', 0.05),
    (1, 'Social Security Tax', 0.062),
    (1, 'Medicare Tax', 0.0145);
