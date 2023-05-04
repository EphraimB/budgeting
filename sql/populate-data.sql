INSERT INTO employee (name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule) VALUES ('John Doe', 16.00, 8, 15, 15, B'0111100');;

INSERT INTO accounts (employee_id, account_name, account_type, account_balance) VALUES (1, 'Personal', 0, 1000.00);
INSERT INTO accounts (employee_id, account_name, account_type, account_balance) VALUES (null, 'Savings', 1, 5000.00);

INSERT INTO transactions (account_id, transaction_amount, transaction_description, date_created, date_modified) VALUES (1, 1000.00, 'Test Deposit', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day');
INSERT INTO transactions (account_id, transaction_amount, transaction_description, date_created, date_modified) VALUES (2, 5000.00, 'Test Deposit', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day');

INSERT INTO transactions (account_id, transaction_amount, transaction_description, date_created, date_modified) VALUES (1, -100.00, 'Test Withdrawal', NOW() - INTERVAL '2 day', NOW() - INTERVAL '2 day');
INSERT INTO transactions (account_id, transaction_amount, transaction_description, date_created, date_modified) VALUES (2, -500.00, 'Test Withdrawal', NOW() - INTERVAL '3 day', NOW() - INTERVAL '3 day');

INSERT INTO transfers (source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, transfer_begin_date) VALUES (1, 2, 100.00, 'Test Transfer', 'Test Transfer Description', 2, 1,  NOW() + INTERVAL '1 month');

INSERT INTO payroll_dates (employee_id, payroll_start_day, payroll_end_day) VALUES (1, 1, 15), (1, 16, 31);

-- Insert mock data for payroll_taxes table
INSERT INTO payroll_taxes (employee_id, name, rate, applies_to) VALUES 
    (1, 'Federal Income Tax', 0.15, 'gross_salary'),
    (1, 'State Income Tax', 0.05, 'gross_salary'),
    (1, 'Social Security Tax', 0.062, 'gross_salary'),
    (1, 'Medicare Tax', 0.0145, 'gross_salary');


INSERT INTO wishlist (account_id, wishlist_amount, wishlist_title, wishlist_description, wishlist_priority, wishlist_date_available) VALUES (1, 100.00, 'Test Wishlist', 'Test Wishlist Description', 1, NOW() + INTERVAL '1 month');
INSERT INTO wishlist (account_id, wishlist_amount, wishlist_title, wishlist_description, wishlist_priority, wishlist_date_available) VALUES (1, 5000.00, 'Test Wishlist 2', 'Test Wishlist Description 2', 2, null);