const accountQueries = {
  getAccounts: "SELECT accounts.account_id, accounts.account_name, accounts.account_type, COALESCE(accounts.account_balance, 0) + COALESCE(d.deposit_amount, 0) - COALESCE(w.withdrawal_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts LEFT JOIN (SELECT account_id, SUM(deposit_amount) AS deposit_amount FROM deposits GROUP BY account_id) AS d ON accounts.account_id = d.account_id LEFT JOIN (SELECT account_id, SUM(withdrawal_amount) AS withdrawal_amount FROM withdrawals GROUP BY account_id) AS w ON accounts.account_id = w.account_id ORDER BY accounts.account_id ASC",
  getAccount: "SELECT accounts.account_id, accounts.account_name, accounts.account_type, COALESCE(accounts.account_balance, 0) + COALESCE(d.deposit_amount, 0) - COALESCE(w.withdrawal_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts LEFT JOIN (SELECT account_id, SUM(deposit_amount) AS deposit_amount FROM deposits GROUP BY account_id) AS d ON accounts.account_id = d.account_id LEFT JOIN (SELECT account_id, SUM(withdrawal_amount) AS withdrawal_amount FROM withdrawals GROUP BY account_id) AS w ON accounts.account_id = w.account_id WHERE accounts.account_id = $1",
  createAccount: 'INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
  updateAccount: 'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4 RETURNING *',
  deleteAccount: 'DELETE FROM accounts WHERE account_id = $1',
};

const depositQueries = {
  getDepositsDateFiltered: 'SELECT * FROM deposits WHERE account_id = $1 AND date_created >= $2 ORDER BY date_created DESC',
  getDeposits: 'SELECT * FROM deposits WHERE account_id = $1 ORDER BY deposit_id ASC',
  getDeposit: 'SELECT * FROM deposits WHERE account_id = $1 AND deposit_id = $2',
  createDeposit: 'INSERT INTO deposits (account_id, deposit_amount, deposit_description) VALUES ($1, $2, $3) RETURNING *',
  updateDeposit: 'UPDATE deposits SET account_id = $1, deposit_amount = $2, deposit_description = $3 WHERE deposit_id = $4 RETURNING *',
  deleteDeposit: 'DELETE FROM deposits WHERE deposit_id = $1',
};

const withdrawalQueries = {
  getWithdrawalsByAccount: 'SELECT * FROM withdrawals WHERE account_id = $1 AND date_created >= $2 ORDER BY date_created DESC',
  getWithdrawals: 'SELECT * FROM withdrawals WHERE account_id = $1 ORDER BY withdrawal_id ASC',
  getWithdrawal: 'SELECT * FROM withdrawals WHERE account_id = $1 AND withdrawal_id = $2',
  createWithdrawal: 'INSERT INTO withdrawals (account_id, withdrawal_amount, withdrawal_description) VALUES ($1, $2, $3) RETURNING *',
  updateWithdrawal: 'UPDATE withdrawals SET account_id = $1, withdrawal_amount = $2, withdrawal_description = $3 WHERE withdrawal_id = $4 RETURNING *',
  deleteWithdrawal: 'DELETE FROM withdrawals WHERE withdrawal_id = $1',
};

const expenseQueries = {
  getExpensesByAccount: "SELECT * FROM expenses WHERE account_id = $1 AND expense_begin_date <= $2 ORDER BY expense_begin_date ASC",
  getExpenses: 'SELECT * FROM expenses WHERE account_id = $1 ORDER BY expense_id ASC',
  getExpense: 'SELECT * FROM expenses WHERE account_id = $1 AND expense_id = $2',
  createExpense: 'INSERT INTO expenses (account_id, expense_amount, expense_title, expense_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, expense_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
  updateExpense: 'UPDATE expenses SET account_id = $1, expense_amount = $2, expense_title = $3, expense_description = $4, frequency_type = $5, frequency_type_variable = $6, frequency_day_of_month = $7, frequency_day_of_week = $8, frequency_week_of_month = $9, frequency_month_of_year = $10, expense_begin_date = $11 WHERE expense_id = $12 RETURNING *',
  deleteExpense: 'DELETE FROM expenses WHERE expense_id = $1',
};

const loanQueries = {
  getLoansByAccount: 'SELECT * FROM loans WHERE account_id = $1 AND loan_begin_date <= $2 ORDER BY date_created ASC',
  getLoans: 'SELECT * FROM loans WHERE account_id = $1 ORDER BY loan_id ASC',
  getLoan: 'SELECT * FROM loans WHERE account_id = $1 AND loan_id = $2',
  createLoan: 'INSERT INTO loans (account_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, loan_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
  updateLoan: 'UPDATE loans SET account_id = $1, loan_amount = $2, loan_plan_amount = $3, loan_recipient = $4, loan_title = $5, loan_description = $6, frequency_type = $7, frequency_type_variable = $8, frequency_day_of_month = $9, frequency_day_of_week = $10, frequency_week_of_month = $11, frequency_month_of_year = $12, loan_begin_date = $13 WHERE loan_id = $14 RETURNING *',
  deleteLoan: 'DELETE FROM loans WHERE loan_id = $1',
};

const payrollQueries = {
  getPayrolls: `
        SELECT make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, pd.payroll_start_day::integer) AS start_date,
        make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, pd.payroll_end_day::integer) AS end_date,
        work_days::integer,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN (t.hours_worked * e.hourly_rate)
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * work_days
        ))::numeric(20, 2) AS gross_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN ((t.hours_worked * e.hourly_rate) * (1 - COALESCE(pt.rate, 0)))
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
        ))::numeric(20, 2) AS net_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN e.regular_hours
                ELSE NULL
            END,
            e.regular_hours * work_days
        ))::numeric(20, 2) AS hours_worked
      FROM (
        SELECT 
      pd.employee_id,
      pd.payroll_start_day,
      CASE 
        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, pd.payroll_end_day_corrected::integer)) = 0 
            THEN pd.payroll_end_day_corrected - 2 -- If it's a Sunday, subtract 2 days to get to Friday
        WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, pd.payroll_end_day_corrected::integer)) = 6
            THEN pd.payroll_end_day_corrected - 1 -- If it's a Saturday, subtract 1 day to get to Friday
        ELSE pd.payroll_end_day_corrected
      END AS payroll_end_day
      FROM (
        SELECT 
            employee_id,
            payroll_start_day,
            CASE 
                WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                ELSE payroll_end_day 
            END AS payroll_end_day_corrected
        FROM payroll_dates
      ) pd
      ) pd
      JOIN employee e ON e.employee_id = pd.employee_id
      CROSS JOIN LATERAL (
      WITH dates AS (
      SELECT generate_series(
              make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, pd.payroll_start_day), 
              make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, CASE 
                WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')::integer
                ELSE payroll_end_day 
            END),
              '1 day'
            )::date AS date
      FROM payroll_dates pd
      WHERE pd.employee_id = e.employee_id AND pd.payroll_start_day <= EXTRACT(DAY FROM current_date) AND pd.payroll_end_day >= EXTRACT(DAY FROM current_date)
      )
      SELECT SUM(CASE 
                WHEN (work_schedule::integer & (1 << (7 - extract(dow from dates.date))::integer)) <> 0 
                THEN 1 
                ELSE 0 
              END) AS work_days
      FROM dates
      ) s
      LEFT JOIN (
      SELECT *
      FROM timecards
      WHERE date_trunc('month', work_date) = date_trunc('month', current_date)
      ) t ON e.employee_id = t.employee_id
      LEFT JOIN (
      SELECT DISTINCT ON (employee_id) employee_id, rate
      FROM payroll_taxes
      ) pt ON e.employee_id = pt.employee_id
      WHERE e.account_id = $1
      GROUP BY pd.payroll_start_day, pd.payroll_end_day, e.employee_id, e.account_id, work_days
   `,
  getPayrollsMiddleware: `
        SELECT make_date(extract(year from d1)::integer, extract(month from d1)::integer, pd.payroll_start_day::integer) AS start_date,
        make_date(extract(year from d1)::integer, extract(month from d1)::integer, pd.payroll_end_day::integer) AS end_date,
        work_days::integer,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN (t.hours_worked * e.hourly_rate)
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * work_days
        ))::numeric(20, 2) AS gross_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN ((t.hours_worked * e.hourly_rate) * (1 - COALESCE(pt.rate, 0)))
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
        ))::numeric(20, 2) AS net_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN e.regular_hours
                ELSE NULL
            END,
            e.regular_hours * work_days
        ))::numeric(20, 2) AS hours_worked
        FROM employee e
      CROSS JOIN LATERAL (
        WITH payroll_dates_cte AS (
          SELECT 
            employee_id,
            payroll_start_day,
            CASE 
              WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
              THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
              ELSE payroll_end_day 
            END AS payroll_end_day
          FROM payroll_dates
        )
        SELECT 
          pd.employee_id,
          pd.payroll_start_day,
          CASE 
            WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, pd.payroll_end_day::integer)) = 0 
                THEN pd.payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
            WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, pd.payroll_end_day::integer)) = 6
                THEN pd.payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
            ELSE pd.payroll_end_day
          END AS payroll_end_day,
          d1
        FROM payroll_dates_cte pd
        CROSS JOIN LATERAL generate_series(
          current_date, 
          make_date(extract(year from $2::date)::integer, extract(month from $2::date)::integer, pd.payroll_end_day::integer), 
          '1 month'
        ) AS d1
      ) pd
      CROSS JOIN LATERAL (
      SELECT SUM(CASE 
            WHEN (work_schedule::integer & (1 << (7 - extract(dow from dates.date))::integer)) <> 0 
            THEN 1 
            ELSE 0 
          END) AS work_days
          FROM (
              SELECT generate_series(
                      make_date(extract(year from d1)::integer, extract(month from d1)::integer, pd.payroll_start_day), 
                      make_date(extract(year from d1)::integer, extract(month from d1)::integer, CASE 
                        WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')::integer
                        ELSE payroll_end_day 
                    END),
                      '1 day'
                    )::date AS date
              FROM payroll_dates pd
              WHERE pd.employee_id = e.employee_id AND pd.payroll_start_day <= EXTRACT(DAY FROM d1)
              AND make_date(extract(year from d1)::integer, extract(month from d1)::integer, CASE 
                        WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') 
                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')::integer
                        ELSE payroll_end_day 
                    END) >= d1
          ) dates
      ) s
      LEFT JOIN (
      SELECT *
      FROM timecards
      WHERE date_trunc('month', work_date) = date_trunc('month', current_date)
      ) t ON e.employee_id = t.employee_id
      LEFT JOIN (
      SELECT DISTINCT ON (employee_id) employee_id, rate
      FROM payroll_taxes
      ) pt ON e.employee_id = pt.employee_id
      WHERE e.account_id = $1
      GROUP BY d1, pd.payroll_start_day, pd.payroll_end_day, e.employee_id, e.account_id, work_days
   `,

   getPayrollsMiddlewareNarowedDown: `
        SELECT make_date(extract(year from d1)::integer, extract(month from d1)::integer, s.payroll_start_day::integer) AS start_date,
        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s.payroll_end_day::integer) AS end_date,
        SUM(s.work_days::integer) AS work_days,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN (t.hours_worked * e.hourly_rate)
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * work_days
        ))::numeric(20, 2) AS gross_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN ((t.hours_worked * e.hourly_rate) * (1 - COALESCE(pt.rate, 0)))
                ELSE NULL
            END,
            e.regular_hours * e.hourly_rate * (1 - COALESCE(pt.rate, 0)) * work_days
        ))::numeric(20, 2) AS net_pay,
        SUM(COALESCE(
            CASE
                WHEN (e.work_schedule::integer & CAST(power(2, EXTRACT(DOW FROM t.work_date) - 1) AS INTEGER)) > 0
                    THEN e.regular_hours
                ELSE NULL
            END,
            e.regular_hours * work_days
        ))::numeric(20, 2) AS hours_worked
        FROM employee e
      CROSS JOIN LATERAL (
        SELECT 
        d1.date,
        pd.payroll_start_day,
        CASE 
          WHEN pd.payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1.date) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')
            THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1.date) + INTERVAL '1 MONTH' - INTERVAL '1 DAY')
          WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, pd.payroll_end_day::integer)) = 0 
            THEN pd.payroll_end_day - 2 -- If it's a Sunday, subtract 2 days to get to Friday
          WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, pd.payroll_end_day::integer)) = 6
            THEN pd.payroll_end_day - 1 -- If it's a Saturday, subtract 1 day to get to Friday
          ELSE pd.payroll_end_day
        END AS payroll_end_day,
          dates.date,
          d1.date AS d1,
          SUM(CASE 
            WHEN (work_schedule::integer & (1 << (7 - extract(dow from dates.date))::integer)) <> 0 
            THEN 1 
            ELSE 0 
          END) AS work_days
        FROM payroll_dates pd
        CROSS JOIN LATERAL generate_series(
          current_date, 
          make_date(extract(year from '2023-07-19'::date)::integer, extract(month from '2023-07-19'::date)::integer, pd.payroll_end_day::integer), 
          '1 month'
        ) AS d1(date)
        CROSS JOIN LATERAL generate_series(
          make_date(extract(year from d1)::integer, extract(month from d1)::integer, pd.payroll_start_day), 
          make_date(extract(year from d1)::integer, extract(month from d1)::integer, CASE 
                        WHEN payroll_end_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                        THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')::integer
                        ELSE payroll_end_day 
                    END),
          '1 day'
        ) AS dates(date)
        LEFT JOIN employee e ON pd.employee_id = e.employee_id
        GROUP BY pd.employee_id, pd.payroll_start_day, pd.payroll_end_day, dates.date, d1
        ORDER BY pd.employee_id, pd.payroll_start_day, dates.date
      ) s
      LEFT JOIN (
      SELECT *
      FROM timecards
      WHERE date_trunc('month', work_date) = date_trunc('month', current_date)
      ) t ON e.employee_id = t.employee_id
      LEFT JOIN (
      SELECT DISTINCT ON (employee_id) employee_id, rate
      FROM payroll_taxes
      ) pt ON e.employee_id = pt.employee_id
      WHERE e.account_id = 1 AND work_days <> 0
      GROUP BY d1, s.payroll_start_day, s.payroll_end_day, e.employee_id, e.account_id, s.work_days
  `,
}

const wishlistQueries = {
  getWishlistsByAccount: 'SELECT * FROM wishlist WHERE account_id = $1 AND date_created <= $2 ORDER BY date_created ASC',
  getWishlists: 'SELECT * FROM wishlist WHERE account_id = $1 ORDER BY wishlist_id ASC',
  getWishlist: 'SELECT * FROM wishlist WHERE account_id = $1 AND wishlist_id = $2',
  createWishlist: 'INSERT INTO wishlist (account_id, wishlist_amount, wishlist_title, wishlist_description, wishlist_priority) VALUES ($1, $2, $3, $4, $5) RETURNING *',
  updateWishlist: 'UPDATE wishlist SET account_id = $1, wishlist_amount = $2, wishlist_title = $3, wishlist_description = $4, wishlist_priority = $5 WHERE wishlist_id = $6 RETURNING *',
  deleteWishlist: 'DELETE FROM wishlist WHERE wishlist_id = $1',
};

const transferQueries = {
  getTransfersByAccount: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) AND date_created <= $2 ORDER BY date_created ASC',
  getTransfers: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) ORDER BY transfer_id ASC',
  getTransfer: 'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) AND transfer_id = $2',
  createTransfer: 'INSERT INTO transfers (source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, transfer_begin_date, transfer_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
  updateTransfer: 'UPDATE transfers SET source_account_id = $1, destination_account_id = $2, transfer_amount = $3, transfer_title = $4, transfer_description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, transfer_begin_date = $12, transfer_end_date = $13 WHERE transfer_id = $14 RETURNING *',
  deleteTransfer: 'DELETE FROM transfers WHERE transfer_id = $1',
};

const currentBalanceQueries = {
  getCurrentBalance: "SELECT accounts.account_id, COALESCE(accounts.account_balance, 0) + COALESCE(SUM(deposits.deposit_amount), 0) - COALESCE(SUM(withdrawals.withdrawal_amount), 0) AS account_balance FROM accounts LEFT JOIN deposits ON accounts.account_id = deposits.account_id LEFT JOIN withdrawals ON accounts.account_id = withdrawals.account_id WHERE accounts.account_id = $1 GROUP BY accounts.account_id",
};

module.exports = {
  accountQueries,
  depositQueries,
  withdrawalQueries,
  expenseQueries,
  loanQueries,
  payrollQueries,
  wishlistQueries,
  currentBalanceQueries,
  transferQueries,
}