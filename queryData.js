const accountQueries = {
  getAccounts: `
    SELECT accounts.account_id,
    accounts.account_name,
    accounts.account_type,
    COALESCE(accounts.account_balance, 0) + COALESCE(t.transaction_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts
    LEFT JOIN (SELECT account_id, SUM(transaction_amount) AS transaction_amount FROM transactions GROUP BY account_id) AS t ON accounts.account_id = t.account_id ORDER BY accounts.account_id ASC  
  `,
  getAccount: `
    SELECT accounts.account_id,
    accounts.account_name,
    accounts.account_type,
    COALESCE(accounts.account_balance, 0) + COALESCE(t.transaction_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts
    LEFT JOIN (SELECT account_id, SUM(transaction_amount) AS transaction_amount FROM transactions GROUP BY account_id) AS t ON accounts.account_id = t.account_id WHERE accounts.account_id = $1
  `,
  createAccount: 'INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
  updateAccount: 'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4 RETURNING *',
  deleteAccount: 'DELETE FROM accounts WHERE account_id = $1',
};

const transactionHistoryQueries = {
  getTransactionsDateFiltered: 'SELECT * FROM transaction_history WHERE account_id = $1 AND date_created >= $2 ORDER BY date_created DESC',
  getTransactions: 'SELECT * FROM transaction_history WHERE account_id = $1 ORDER BY transaction_id ASC',
  getTransaction: 'SELECT * FROM transaction_history WHERE account_id = $1 AND transaction_id = $2',
  createTransaction: 'INSERT INTO transaction_history (account_id, transaction_amount, transaction_title, transaction_description) VALUES ($1, $2, $3, $4) RETURNING *',
  updateTransaction: 'UPDATE transaction_history SET account_id = $1, transaction_amount = $2, transaction_title = $3, transaction_description = $4 WHERE transaction_id = $5 RETURNING *',
  deleteTransaction: 'DELETE FROM transaction_history WHERE transaction_id = $1',
};

const expenseQueries = {
  getExpensesByAccount: "SELECT * FROM expenses WHERE account_id = $1 AND expense_begin_date <= $2 ORDER BY expense_begin_date ASC",
  getExpenses: 'SELECT * FROM expenses WHERE account_id = $1 ORDER BY expense_id ASC',
  getExpense: 'SELECT * FROM expenses WHERE account_id = $1 AND expense_id = $2',
  createExpense: 'INSERT INTO expenses (account_id, cron_job_id, expense_amount, expense_title, expense_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, expense_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
  updateExpense: 'UPDATE expenses SET account_id = $1, expense_amount = $2, expense_title = $3, expense_description = $4, frequency_type = $5, frequency_type_variable = $6, frequency_day_of_month = $7, frequency_day_of_week = $8, frequency_week_of_month = $9, frequency_month_of_year = $10, expense_begin_date = $11 WHERE expense_id = $12 RETURNING *',
  deleteExpense: 'DELETE FROM expenses WHERE expense_id = $1',
};

const loanQueries = {
  getLoansByAccount: 'SELECT * FROM loans WHERE account_id = $1 AND loan_begin_date <= $2 ORDER BY date_created ASC',
  getLoans: 'SELECT * FROM loans WHERE account_id = $1 ORDER BY loan_id ASC',
  getLoan: 'SELECT * FROM loans WHERE account_id = $1 AND loan_id = $2',
  createLoan: 'INSERT INTO loans (account_id, cron_job_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, loan_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
  updateLoan: 'UPDATE loans SET account_id = $1, loan_amount = $2, loan_plan_amount = $3, loan_recipient = $4, loan_title = $5, loan_description = $6, frequency_type = $7, frequency_type_variable = $8, frequency_day_of_month = $9, frequency_day_of_week = $10, frequency_week_of_month = $11, frequency_month_of_year = $12, loan_begin_date = $13 WHERE loan_id = $14 RETURNING *',
  deleteLoan: 'DELETE FROM loans WHERE loan_id = $1',
};

const payrollQueries = {
  getPayrolls: `
        SELECT make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day::integer) AS start_date,
        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day) AS end_date,
        SUM(s.work_days::integer) AS work_days,
        SUM(COALESCE(
            e.regular_hours * e.hourly_rate * work_days
        ))::numeric(20, 2) AS gross_pay,
        SUM(COALESCE(
            e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
        ))::numeric(20, 2) AS net_pay,
      SUM(COALESCE(
            e.regular_hours * work_days
        ))::numeric(20, 2) AS hours_worked
        FROM employee e
      CROSS JOIN LATERAL (
      SELECT
        payroll_start_day,
        CASE 
              WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
              THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
              ELSE payroll_end_day 
            END AS unadjusted_payroll_end_day
        FROM payroll_dates
      ) s2
      CROSS JOIN LATERAL (
        SELECT
        s2.payroll_start_day,
        CASE
              WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                  THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
              WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                  THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
              ELSE s2.unadjusted_payroll_end_day
          END::integer AS adjusted_payroll_end_day
      ) s1
      CROSS JOIN LATERAL(
        SELECT
        generate_series(
          make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.payroll_start_day), 
          make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_end_day),
          '1 day'
          )
        ) AS dates(date)
      CROSS JOIN LATERAL (
        SELECT
          SUM(CASE 
            WHEN (work_schedule::integer & (1 << (6 - extract(dow from dates.date)::integer))) <> 0
            THEN 1 
            ELSE 0 
          END) AS work_days
        FROM employee e
      ) s
      LEFT JOIN (
        SELECT employee_id, SUM(rate) AS rate
        FROM payroll_taxes
        GROUP BY employee_id
      ) pt ON e.employee_id = pt.employee_id
      WHERE e.employee_id = $1 AND work_days <> 0
      GROUP BY s2.payroll_start_day, e.employee_id, e.employee_id, s.work_days, s1.adjusted_payroll_end_day
      ORDER BY start_date, end_date
   `,
  getPayrollsMiddleware: `
        SELECT make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer) AS start_date,
        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) AS end_date,
        SUM(s.work_days::integer) AS work_days,
        SUM(COALESCE(
            e.regular_hours * e.hourly_rate * work_days
        ))::numeric(20, 2) AS gross_pay,
        SUM(COALESCE(
            e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
        ))::numeric(20, 2) AS net_pay,
      SUM(COALESCE(
            e.regular_hours * work_days
        ))::numeric(20, 2) AS hours_worked
        FROM employee e
      CROSS JOIN LATERAL generate_series(
          current_date, 
          $2::date + INTERVAL '1 month',
          '1 month'
      ) AS d1(date)
      CROSS JOIN LATERAL (
      SELECT
        payroll_start_day,
        CASE 
              WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
              THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')
              ELSE payroll_end_day 
            END AS unadjusted_payroll_end_day
        FROM payroll_dates
      ) s2
      CROSS JOIN LATERAL (
        SELECT
        s2.payroll_start_day,
        CASE
              WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                  THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
              WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                  THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
              ELSE s2.unadjusted_payroll_end_day
          END::integer AS adjusted_payroll_end_day
      ) s1
      CROSS JOIN LATERAL(
        SELECT
        generate_series(
          make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.payroll_start_day), 
          make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day),
          '1 day'
          )
        ) AS dates(date)
      CROSS JOIN LATERAL (
        SELECT
          SUM(CASE 
            WHEN (work_schedule::integer & (1 << (6 - extract(dow from dates.date)::integer))) <> 0
            THEN 1 
            ELSE 0 
          END) AS work_days
        FROM employee e
      ) s
      LEFT JOIN (
        SELECT employee_id, SUM(rate) AS rate
        FROM payroll_taxes
        GROUP BY employee_id
      ) pt ON e.employee_id = pt.employee_id
      WHERE e.employee_id = $1 AND work_days <> 0 AND make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) >= CURRENT_DATE AND make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) <= $2::date
      GROUP BY d1, s2.payroll_start_day, e.employee_id, e.employee_id, s.work_days, s1.adjusted_payroll_end_day
      ORDER BY start_date, end_date
   `,
  getPayrollTaxes: 'SELECT * FROM payroll_taxes WHERE employee_id = $1',
  getPayrollTax: 'SELECT * FROM payroll_taxes WHERE employee_id = $1 AND payroll_taxes_id = $2',
  createPayrollTax: 'INSERT INTO payroll_taxes (employee_id, name, rate) VALUES ($1, $2, $3) RETURNING *',
  updatePayrollTax: 'UPDATE payroll_taxes SET name = $1, rate = $2 WHERE payroll_taxes_id = $3 RETURNING *',
  deletePayrollTax: 'DELETE FROM payroll_taxes WHERE payroll_taxes_id = $1',
  getPayrollDates: 'SELECT * FROM payroll_dates WHERE employee_id = $1',
  getPayrollDate: 'SELECT * FROM payroll_dates WHERE employee_id = $1 AND payroll_date_id = $2',
  createPayrollDate: 'INSERT INTO payroll_dates (employee_id, payroll_start_day, payroll_end_day) VALUES ($1, $2, $3) RETURNING *',
  updatePayrollDate: 'UPDATE payroll_dates SET payroll_start_day = $1, payroll_end_day = $2 WHERE payroll_date_id = $3 RETURNING *',
  deletePayrollDate: 'DELETE FROM payroll_dates WHERE payroll_date_id = $1',
  getEmployees: 'SELECT * FROM employee',
  getEmployee: 'SELECT * FROM employee WHERE employee_id = $1',
  getAccountIdFromEmployee: 'SELECT account_id FROM accounts WHERE employee_id = $1',
  createEmployee: 'INSERT INTO employee (name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  updateEmployee: 'UPDATE employee SET name = $1, hourly_rate = $2, regular_hours = $3, vacation_days = $4, sick_days = $5, work_schedule = $6 WHERE employee_id = $7 RETURNING *',
  deleteEmployee: 'DELETE FROM employee WHERE employee_id = $1',
}

const wishlistQueries = {
  getWishlistsByAccount: 'SELECT * FROM wishlist WHERE account_id = $1 AND date_created <= $2 ORDER BY wishlist_priority ASC',
  getWishlists: 'SELECT * FROM wishlist WHERE account_id = $1 ORDER BY wishlist_priority ASC',
  getWishlist: 'SELECT * FROM wishlist WHERE account_id = $1 AND wishlist_id = $2',
  createWishlist: 'INSERT INTO wishlist (account_id, wishlist_amount, wishlist_title, wishlist_description, wishlist_priority, wishlist_url_link) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  updateWishlist: 'UPDATE wishlist SET account_id = $1, wishlist_amount = $2, wishlist_title = $3, wishlist_description = $4, wishlist_priority = $5, wishlist_url_link = $6 WHERE wishlist_id = $7 RETURNING *',
  deleteWishlist: 'DELETE FROM wishlist WHERE wishlist_id = $1',
};

const transferQueries = {
  getTransfersByAccount: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) AND date_created <= $2 ORDER BY date_created ASC',
  getTransfers: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) ORDER BY transfer_id ASC',
  getTransfer: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) AND transfer_id = $2',
  createTransfer: 'INSERT INTO transfers (cron_job_id, source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, transfer_begin_date, transfer_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
  updateTransfer: 'UPDATE transfers SET source_account_id = $1, destination_account_id = $2, transfer_amount = $3, transfer_title = $4, transfer_description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, transfer_begin_date = $12, transfer_end_date = $13 WHERE transfer_id = $14 RETURNING *',
  deleteTransfer: 'DELETE FROM transfers WHERE transfer_id = $1',
};

const currentBalanceQueries = {
  getCurrentBalance: "SELECT accounts.account_id, COALESCE(accounts.account_balance, 0) + COALESCE(SUM(transactions.transaction_amount), 0) AS account_balance FROM accounts LEFT JOIN transactions ON accounts.account_id = transactions.account_id WHERE accounts.account_id = $1 GROUP BY accounts.account_id",
};

const cronJobQueries = {
  cronJobsStartup: 'SELECT * FROM cron_jobs',
  getCronJob: 'SELECT * FROM cron_jobs WHERE cron_job_id = $1',
  createCronJob: 'INSERT INTO cron_jobs (unique_id, cron_expression) VALUES ($1, $2) RETURNING *',
  updateCronJob: 'UPDATE cron_jobs SET unique_id = $1, cron_expression = $2 WHERE cron_job_id = $3 RETURNING *',
  deleteCronJob: 'DELETE FROM cron_jobs WHERE cron_job_id = $1',
};

const generatedTransactionsQueries = {
  getGeneratedTransactions: `
      SELECT
      transaction_title AS title,
      transaction_description AS description,
      date_created AS date,
      transaction_amount AS amount
    FROM transaction_history
    WHERE account_id = $1 AND date_created >= $2
    UNION
    SELECT
      expense_title AS title,
      expense_description AS description,
      expense_begin_date AS date,
      expense_amount AS amount
    FROM expenses
    WHERE account_id = $1 AND date_created >= $2
    ORDER BY date
  `,
}

module.exports = {
  accountQueries,
  transactionHistoryQueries,
  expenseQueries,
  loanQueries,
  payrollQueries,
  wishlistQueries,
  currentBalanceQueries,
  transferQueries,
  cronJobQueries,
  generatedTransactionsQueries
}