INSERT INTO accounts (account_name, account_type, account_balance) VALUES ('Personal', 0, 1000.00);
INSERT INTO accounts (account_name, account_type, account_balance) VALUES ('Savings', 1, 5000.00);

INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES (1, 1000.00, 'Test Deposit');
INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES (2, 5000.00, 'Test Deposit');

INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES (1, 100.00, 'Test Withdrawal');
INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES (2, 500.00, 'Test Withdrawal');

INSERT INTO expenses (account_id, expense_amount, expense_title, expense_description, frequency_type, frequency_type_variable, expense_begin_date) VALUES (1, 100.00, 'Test Expense', 'Test Expense Description', 2, 1, '2023-01-01');

INSERT INTO loans (account_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, loan_begin_date) VALUES (1, 1000.00, 100.00, 'John Doe', 'Test Loan', 'Test Loan Description', 2, 1, '2023-04-01');

INSERT INTO transfers (source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, transfer_begin_date) VALUES (1, 2, 100.00, 'Test Transfer', 'Test Transfer Description', 2, 1, '2023-04-01');