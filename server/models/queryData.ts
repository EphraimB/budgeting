interface AccountQueries {
    getAccounts: string;
    getAccount: string;
    createAccount: string;
    updateAccount: string;
    deleteAccount: string;
}

interface TransactionHistoryQueries {
    getTransactionsDateMiddleware: string;
    getAllTransactions: string;
    getTransactionById: string;
    getTransactionsByAccountId: string;
    getTransactionByIdAndAccountId: string;
    createTransaction: string;
    updateTransaction: string;
    deleteTransaction: string;
}

interface ExpenseQueries {
    getExpensesMiddleware: string;
    getAllExpenses: string;
    getExpenseById: string;
    getExpensesByAccountId: string;
    getExpenseByIdAndAccountId: string;
    createExpense: string;
    updateExpense: string;
    updateExpenseWithCronJobId: string;
    deleteExpense: string;
}

interface LoanQueries {
    getLoansMiddleware: string;
    getAllLoans: string;
    getLoansById: string;
    getLoansByAccountId: string;
    getLoansByIdAndAccountId: string;
    createLoan: string;
    updateLoan: string;
    updateLoanWithCronJobId: string;
    deleteLoan: string;
}

interface PayrollQueries {
    getPayrolls: string;
    getPayrollsMiddleware: string;
    getAllPayrollTaxes: string;
    getPayrollTaxesById: string;
    getPayrollTaxesByEmployeeId: string;
    getPayrollTaxesByIdAndEmployeeId: string;
    createPayrollTax: string;
    updatePayrollTax: string;
    deletePayrollTax: string;
    getAllPayrollDates: string;
    getPayrollDatesById: string;
    getPayrollDatesByEmployeeId: string;
    getPayrollDatesByIdAndEmployeeId: string;
    createPayrollDate: string;
    updatePayrollDate: string;
    deletePayrollDate: string;
    getEmployees: string;
    getEmployee: string;
    getAccountIdFromEmployee: string;
    createEmployee: string;
    updateEmployee: string;
    deleteEmployee: string;
}

interface WishlistQueries {
    getWishlistsMiddleware: string;
    getAllWishlists: string;
    getWishlistsById: string;
    getWishlistsByAccountId: string;
    getWishlistsByIdAndAccountId: string;
    createWishlist: string;
    updateWishlist: string;
    updateWishlistWithCronJobId: string;
    deleteWishlist: string;
}

interface TransferQueries {
    getTransfersMiddleware: string;
    getAllTransfers: string;
    getTransfersById: string;
    getTransfersByAccountId: string;
    getTransfersByIdAndAccountId: string;
    createTransfer: string;
    updateTransfer: string;
    updateTransferWithCronJobId: string;
    deleteTransfer: string;
}

interface CurrentBalanceQueries {
    getCurrentBalance: string;
}

interface CronJobQueries {
    cronJobsStartup: string;
    getCronJob: string;
    createCronJob: string;
    updateCronJob: string;
    deleteCronJob: string;
}

export const accountQueries: AccountQueries = {
    getAccounts: `
            SELECT 
            accounts.account_id,
            accounts.employee_id,
            accounts.account_name,
            accounts.account_type,
            COALESCE(accounts.account_balance, 0) + COALESCE(t.total_transaction_amount_after_tax, 0) AS account_balance,
            accounts.date_created, 
            accounts.date_modified 
        FROM 
            accounts
        LEFT JOIN 
            (SELECT 
            account_id, 
            SUM(transaction_amount + (transaction_amount * transaction_tax_rate)) AS total_transaction_amount_after_tax 
            FROM 
            transaction_history 
            GROUP BY 
            account_id) AS t ON accounts.account_id = t.account_id 
        ORDER BY 
            accounts.account_id ASC;
  `,
    getAccount: `
            SELECT 
            accounts.account_id,
            accounts.employee_id,
            accounts.account_name,
            accounts.account_type,
            COALESCE(accounts.account_balance, 0) + COALESCE(t.total_transaction_amount_after_tax, 0) AS account_balance,
            accounts.date_created, 
            accounts.date_modified 
        FROM 
            accounts
        LEFT JOIN 
            (SELECT 
            account_id, 
            SUM(transaction_amount + (transaction_amount * transaction_tax_rate)) AS total_transaction_amount_after_tax 
            FROM 
            transaction_history 
            GROUP BY 
            account_id) AS t ON accounts.account_id = t.account_id 
        WHERE 
            accounts.account_id = $1;
  `,
    createAccount:
        'INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
    updateAccount:
        'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4 RETURNING *',
    deleteAccount: 'DELETE FROM accounts WHERE account_id = $1',
};

export const transactionHistoryQueries: TransactionHistoryQueries = {
    getTransactionsDateMiddleware:
        'SELECT * FROM transaction_history WHERE account_id = $1 AND date_created >= $2 ORDER BY date_created DESC',
    getAllTransactions:
        'SELECT * FROM transaction_history ORDER BY transaction_id ASC',
    getTransactionById:
        'SELECT * FROM transaction_history WHERE transaction_id = $1',
    getTransactionsByAccountId:
        'SELECT * FROM transaction_history WHERE account_id = $1 ORDER BY transaction_id ASC',
    getTransactionByIdAndAccountId:
        'SELECT * FROM transaction_history WHERE transaction_id = $1 AND account_id = $2',
    createTransaction:
        'INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    updateTransaction:
        'UPDATE transaction_history SET account_id = $1, transaction_amount = $2, transaction_tax = $3, transaction_title = $4, transaction_description = $5 WHERE transaction_id = $6 RETURNING *',
    deleteTransaction:
        'DELETE FROM transaction_history WHERE transaction_id = $1',
};

export const expenseQueries: ExpenseQueries = {
    getExpensesMiddleware:
        'SELECT * FROM expenses WHERE account_id = $1 AND expense_begin_date <= $2 ORDER BY expense_begin_date ASC',
    getAllExpenses: 'SELECT * FROM expenses ORDER BY expense_id ASC',
    getExpenseById: 'SELECT * FROM expenses WHERE expense_id = $1',
    getExpensesByAccountId:
        'SELECT * FROM expenses WHERE account_id = $1 ORDER BY expense_id ASC',
    getExpenseByIdAndAccountId:
        'SELECT * FROM expenses WHERE expense_id = $1 AND account_id = $2',
    createExpense:
        'INSERT INTO expenses (account_id, tax_id, expense_amount, expense_title, expense_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, expense_subsidized, expense_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
    updateExpense:
        'UPDATE expenses SET account_id = $1, tax_id = $2, expense_amount = $3, expense_title = $4, expense_description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, expense_subsidized = $12, expense_begin_date = $13 WHERE expense_id = $14 RETURNING *',
    updateExpenseWithCronJobId:
        'UPDATE expenses SET cron_job_id = $1 WHERE expense_id = $2 RETURNING *',
    deleteExpense: 'DELETE FROM expenses WHERE expense_id = $1',
};

export const loanQueries: LoanQueries = {
    getLoansMiddleware:
        'SELECT * FROM loans WHERE account_id = $1 AND loan_begin_date <= $2 ORDER BY date_created ASC',
    getAllLoans: 'SELECT * FROM loans ORDER BY loan_id ASC',
    getLoansById: 'SELECT * FROM loans WHERE loan_id = $1',
    getLoansByAccountId:
        'SELECT * FROM loans WHERE account_id = $1 ORDER BY loan_id ASC',
    getLoansByIdAndAccountId:
        'SELECT * FROM loans WHERE loan_id = $1 AND account_id = $2',
    createLoan:
        'INSERT INTO loans (account_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, loan_interest_rate, loan_interest_frequency_type, loan_subsidized, loan_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
    updateLoan:
        'UPDATE loans SET account_id = $1, loan_amount = $2, loan_plan_amount = $3, loan_recipient = $4, loan_title = $5, loan_description = $6, frequency_type = $7, frequency_type_variable = $8, frequency_day_of_month = $9, frequency_day_of_week = $10, frequency_week_of_month = $11, frequency_month_of_year = $12, loan_interest_rate = $13, loan_interest_frequency_type = $14, loan_subsidized = $15, loan_begin_date = $16 WHERE loan_id = $17 RETURNING *',
    updateLoanWithCronJobId:
        'UPDATE loans SET cron_job_id = $1, interest_cron_job_id = $2 WHERE loan_id = $3 RETURNING *',
    deleteLoan: 'DELETE FROM loans WHERE loan_id = $1',
};

export const payrollQueries: PayrollQueries = {
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
    getAllPayrollTaxes: 'SELECT * FROM payroll_taxes',
    getPayrollTaxesById:
        'SELECT * FROM payroll_taxes WHERE payroll_taxes_id = $1',
    getPayrollTaxesByEmployeeId:
        'SELECT * FROM payroll_taxes WHERE employee_id = $1',
    getPayrollTaxesByIdAndEmployeeId:
        'SELECT * FROM payroll_taxes WHERE payroll_taxes_id = $1 AND employee_id = $2',
    createPayrollTax:
        'INSERT INTO payroll_taxes (employee_id, name, rate) VALUES ($1, $2, $3) RETURNING *',
    updatePayrollTax:
        'UPDATE payroll_taxes SET name = $1, rate = $2 WHERE payroll_taxes_id = $3 RETURNING *',
    deletePayrollTax: 'DELETE FROM payroll_taxes WHERE payroll_taxes_id = $1',
    getAllPayrollDates: 'SELECT * FROM payroll_dates',
    getPayrollDatesById:
        'SELECT * FROM payroll_dates WHERE payroll_date_id = $1',
    getPayrollDatesByEmployeeId:
        'SELECT * FROM payroll_dates WHERE employee_id = $1',
    getPayrollDatesByIdAndEmployeeId:
        'SELECT * FROM payroll_dates WHERE payroll_date_id = $1 AND employee_id = $2',
    createPayrollDate:
        'INSERT INTO payroll_dates (employee_id, payroll_start_day, payroll_end_day) VALUES ($1, $2, $3) RETURNING *',
    updatePayrollDate:
        'UPDATE payroll_dates SET payroll_start_day = $1, payroll_end_day = $2 WHERE payroll_date_id = $3 RETURNING *',
    deletePayrollDate: 'DELETE FROM payroll_dates WHERE payroll_date_id = $1',
    getEmployees: 'SELECT * FROM employee',
    getEmployee: 'SELECT * FROM employee WHERE employee_id = $1',
    getAccountIdFromEmployee:
        'SELECT account_id FROM accounts WHERE employee_id = $1',
    createEmployee:
        'INSERT INTO employee (name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    updateEmployee:
        'UPDATE employee SET name = $1, hourly_rate = $2, regular_hours = $3, vacation_days = $4, sick_days = $5, work_schedule = $6 WHERE employee_id = $7 RETURNING *',
    deleteEmployee: 'DELETE FROM employee WHERE employee_id = $1',
};

export const wishlistQueries: WishlistQueries = {
    getWishlistsMiddleware:
        'SELECT * FROM wishlist WHERE account_id = $1 AND date_created <= $2 ORDER BY wishlist_priority ASC',
    getAllWishlists: 'SELECT * FROM wishlist ORDER BY wishlist_priority ASC',
    getWishlistsById: 'SELECT * FROM wishlist WHERE wishlist_id = $1',
    getWishlistsByAccountId: 'SELECT * FROM wishlist WHERE account_id = $1',
    getWishlistsByIdAndAccountId:
        'SELECT * FROM wishlist WHERE wishlist_id = $1 AND account_id = $2',
    createWishlist:
        'INSERT INTO wishlist (account_id, tax_id, cron_job_id, wishlist_amount, wishlist_title, wishlist_description, wishlist_priority, wishlist_url_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
    updateWishlist:
        'UPDATE wishlist SET account_id = $1, tax_id = $2, wishlist_amount = $3, wishlist_title = $4, wishlist_description = $5, wishlist_priority = $6, wishlist_url_link = $7 WHERE wishlist_id = $8 RETURNING *',
    updateWishlistWithCronJobId:
        'UPDATE wishlist SET cron_job_id = $1 WHERE wishlist_id = $2 RETURNING *',
    deleteWishlist: 'DELETE FROM wishlist WHERE wishlist_id = $1',
};

export const transferQueries: TransferQueries = {
    getTransfersMiddleware:
        'SELECT * FROM transfers WHERE (source_account_id = $1 OR destination_account_id = $1) AND date_created <= $2 ORDER BY date_created ASC',
    getAllTransfers: 'SELECT * FROM transfers ORDER BY transfer_id ASC',
    getTransfersById: 'SELECT * FROM transfers WHERE transfer_id = $1',
    getTransfersByAccountId:
        'SELECT * FROM transfers WHERE source_account_id = $1 OR destination_account_id = $1',
    getTransfersByIdAndAccountId:
        'SELECT * FROM transfers WHERE transfer_id = $1 AND (source_account_id = $2 OR destination_account_id = $2)',
    createTransfer:
        'INSERT INTO transfers (source_account_id, destination_account_id, transfer_amount, transfer_title, transfer_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, transfer_begin_date, transfer_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
    updateTransfer:
        'UPDATE transfers SET source_account_id = $1, destination_account_id = $2, transfer_amount = $3, transfer_title = $4, transfer_description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, transfer_begin_date = $12, transfer_end_date = $13 WHERE transfer_id = $14 RETURNING *',
    updateTransferWithCronJobId:
        'UPDATE transfers SET cron_job_id = $1 WHERE transfer_id = $2 RETURNING *',
    deleteTransfer: 'DELETE FROM transfers WHERE transfer_id = $1',
};

export const currentBalanceQueries: CurrentBalanceQueries = {
    getCurrentBalance: `
            SELECT 
        accounts.account_id,
        COALESCE(accounts.account_balance, 0) + COALESCE(t.transaction_amount_after_tax, 0) AS account_balance
    FROM 
        accounts
    LEFT JOIN 
        (SELECT 
            account_id, 
            SUM(transaction_amount + (transaction_amount * transaction_tax_rate)) AS transaction_amount_after_tax 
        FROM 
            transaction_history 
        GROUP BY 
            account_id
        ) AS t ON accounts.account_id = t.account_id 
    WHERE 
        accounts.account_id = $1;
`,
};

export const cronJobQueries: CronJobQueries = {
    cronJobsStartup: 'SELECT * FROM cron_jobs',
    getCronJob: 'SELECT * FROM cron_jobs WHERE cron_job_id = $1',
    createCronJob:
        'INSERT INTO cron_jobs (unique_id, cron_expression) VALUES ($1, $2) RETURNING *',
    updateCronJob:
        'UPDATE cron_jobs SET unique_id = $1, cron_expression = $2 WHERE cron_job_id = $3 RETURNING *',
    deleteCronJob: 'DELETE FROM cron_jobs WHERE cron_job_id = $1',
};

export const taxesQueries = {
    getTaxes: 'SELECT * FROM taxes',
    getTax: 'SELECT * FROM taxes WHERE tax_id = $1',
    createTax:
        'INSERT INTO taxes (tax_rate, tax_title, tax_description, tax_type) VALUES ($1, $2, $3, $4) RETURNING *',
    updateTax:
        'UPDATE taxes SET tax_rate = $1, tax_title = $2, tax_description = $3, tax_type = $4 WHERE tax_id = $5 RETURNING *',
    deleteTax: 'DELETE FROM taxes WHERE tax_id = $1',
};

export const incomeQueries = {
    getIncomeMiddleware:
        'SELECT * FROM income WHERE account_id = $1 AND date_created <= $2 ORDER BY income_id ASC',
    getIncome: 'SELECT * FROM income',
    getIncomeById: 'SELECT * FROM income WHERE income_id = $1',
    getIncomeByAccountId: 'SELECT * FROM income WHERE account_id = $1',
    getIncomeByIdAndAccountId:
        'SELECT * FROM income WHERE income_id = $1 AND account_id = $2',
    createIncome:
        'INSERT INTO income (account_id, tax_id, income_amount, income_title, income_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, income_begin_date, income_end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
    updateIncome:
        'UPDATE income SET account_id = $1, tax_id = $2, income_amount = $3, income_title = $4, income_description = $5, frequency_type = $6, frequency_type_variable = $7, frequency_day_of_month = $8, frequency_day_of_week = $9, frequency_week_of_month = $10, frequency_month_of_year = $11, income_begin_date = $12, income_end_date = $13 WHERE income_id = $14 RETURNING *',
    updateIncomeWithCronJobId:
        'UPDATE income SET cron_job_id = $1 WHERE income_id = $2 RETURNING *',
    deleteIncome: 'DELETE FROM income WHERE income_id = $1',
};

export const commuteSystemQueries = {
    getCommuteSystems: 'SELECT * FROM commute_systems',
    getCommuteSystemByAccountId:
        'SELECT * FROM commute_systems WHERE account_id = $1',
    getCommuteSystemByIdAndAccountId:
        'SELECT * FROM commute_systems WHERE commute_system_id = $1 AND account_id = $2',
    getCommuteSystemById:
        'SELECT * FROM commute_systems WHERE commute_system_id = $1',
    createCommuteSystem:
        'INSERT INTO commute_systems (account_id, name, fare_cap, fare_cap_duration) VALUES ($1, $2, $3, $4) RETURNING *',
    updateCommuteSystem:
        'UPDATE commute_systems SET account_id = $1, name = $2, fare_cap = $3, fare_cap_duration = $4 WHERE commute_system_id = $5 RETURNING *',
    deleteCommuteSystem:
        'DELETE FROM commute_systems WHERE commute_system_id = $1',
};

export const commuteHistoryQueries = {
    getCommuteHistory: 'SELECT * FROM commute_history',
    getCommuteHistoryByAccountId:
        'SELECT * FROM commute_history WHERE account_id = $1',
    getCommuteHistoryByIdAndAccountId:
        'SELECT * FROM commute_history WHERE commute_history_id = $1 AND account_id = $2',
    getCommuteHistoryById:
        'SELECT * FROM commute_history WHERE commute_history_id = $1',
    createCommuteHistory:
        'INSERT INTO commute_history (account_id, fare_amount, commute_system, fare_type, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    updateCommuteHistory:
        'UPDATE commute_history SET account_id = $1, fare_amount = $2, commute_system = $3, fare_type = $4, timestamp = $5 WHERE commute_history_id = $6 RETURNING *',
    deleteCommuteHistory:
        'DELETE FROM commute_history WHERE commute_history_id = $1',
};

export const fareDetailsQueries = {
    getFareDetails: `
        SELECT fare_detail_id,
            fare_details.account_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            begin_in_effect_day_of_week,
            begin_in_effect_time,
            end_in_effect_day_of_week,
            end_in_effect_time,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
            FROM fare_details
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
    `,
    getFareDetailsByAccountId: `
        SELECT fare_detail_id,
            fare_details.account_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            begin_in_effect_day_of_week,
            begin_in_effect_time,
            end_in_effect_day_of_week,
            end_in_effect_time,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
            FROM fare_details
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
            WHERE fare_details.account_id = $1
        `,
    getFareDetailsByIdAndAccountId: `
        SELECT fare_detail_id,
            fare_details.account_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            begin_in_effect_day_of_week,
            begin_in_effect_time,
            end_in_effect_day_of_week,
            end_in_effect_time,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
            FROM fare_details
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
            WHERE fare_details.fare_detail_id = $1 AND fare_details.account_id = $2
        `,
    getFareDetailsById: `
        SELECT fare_detail_id,
            fare_details.account_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            begin_in_effect_day_of_week,
            begin_in_effect_time,
            end_in_effect_day_of_week,
            end_in_effect_time,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
            FROM fare_details
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
            WHERE fare_details.fare_detail_id = $1`,
    createFareDetails:
        'INSERT INTO fare_details (account_id, commute_system_id, name, fare_amount, begin_in_effect_day_of_week, begin_in_effect_time, end_in_effect_day_of_week, end_in_effect_time, alternate_fare_detail_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
    updateFareDetails:
        'UPDATE fare_details SET account_id = $1, commute_system_id = $2, name = $3, fare_amount = $4, begin_in_effect_day_of_week = $5, begin_in_effect_time = $6, end_in_effect_day_of_week = $7, end_in_effect_time = $8, alternate_fare_detail_id = $9 WHERE fare_detail_id = $10 RETURNING *',
    deleteFareDetails: 'DELETE FROM fare_details WHERE fare_detail_id = $1',
};

export const commuteTicketQueries = {
    getCommuteTickets: `
        SELECT commute_ticket_id,
        commute_tickets.account_id,
        commute_tickets.fare_detail_id AS fare_detail_id,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_tickets.date_created,
        commute_tickets.date_modified
        FROM commute_tickets
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
    `,
    getCommuteTicketsByAccountId: `
        SELECT commute_ticket_id,
        commute_tickets.account_id,
        commute_tickets.fare_detail_id AS fare_detail_id,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_tickets.date_created,
        commute_tickets.date_modified
        FROM commute_tickets
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_tickets.account_id = $1
    `,
    getCommuteTicketsByIdAndAccountId: `
            SELECT commute_ticket_id,
            commute_tickets.account_id,
            commute_tickets.fare_detail_id AS fare_detail_id,
            concat(commute_systems.name, ' ', fare_details.name) AS name,
            commute_tickets.date_created,
            commute_tickets.date_modified
            FROM commute_tickets
            LEFT JOIN fare_details
            ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
            WHERE commute_tickets.account_id = $1
            AND commute_tickets.commute_ticket_id = $2
        `,
    getCommuteTicketsById: `
        SELECT commute_ticket_id,
            commute_tickets.account_id,
            commute_tickets.fare_detail_id AS fare_detail_id,
            concat(commute_systems.name, ' ', fare_details.name) AS name,
            commute_tickets.date_created,
            commute_tickets.date_modified
            FROM commute_tickets
            LEFT JOIN fare_details
            ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
            LEFT JOIN commute_systems
            ON fare_details.commute_system_id = commute_systems.commute_system_id
            WHERE commute_tickets.commute_ticket_id = $1
        `,
    createCommuteTicket:
        'INSERT INTO commute_tickets (account_id, fare_detail_id) VALUES ($1, $2) RETURNING *',
    updateCommuteTicket:
        'UPDATE commute_tickets SET account_id = $1, fare_detail_id = $2 WHERE commute_ticket_id = $3 RETURNING *',
    deleteCommuteTicket:
        'DELETE FROM commute_tickets WHERE commute_ticket_id = $1',
};

export const commutePassesQueries = {
    getCommutePasses: `
        SELECT commute_pass_id,
        commute_schedule.account_id AS account_id,
        commute_passes.commute_ticket_id AS commute_ticket_id,
        commute_schedule.day_of_week AS day_of_week,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_schedules.commute_system_id AS commute_system_id,
        commute_passes.start_time AS start_time,
        commute_passes.duration AS duration,
        commute_passes.date_created,
        commute_passes.date_modified
        FROM commute_passes
        LEFT JOIN commute_schedules
        ON commute_passes.commute_schedule_id = commute_schedules.commute_schedule_id
        LEFT JOIN commute_tickets
        ON commute_schedules.commute_ticket_id = commute_tickets.commute_ticket_id
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
    `,
    getCommutePassesByAccountId: `
        SELECT commute_pass_id,
        commute_schedule.account_id AS account_id,
        commute_passes.commute_ticket_id AS commute_ticket_id,
        commute_schedule.day_of_week AS day_of_week,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_schedules.commute_system_id AS commute_system_id,
        commute_passes.start_time AS start_time,
        commute_passes.duration AS duration,
        commute_passes.date_created,
        commute_passes.date_modified
        FROM commute_passes
        LEFT JOIN commute_schedules
        ON commute_passes.commute_schedule_id = commute_schedules.commute_schedule_id
        LEFT JOIN commute_tickets
        ON commute_schedules.commute_ticket_id = commute_tickets.commute_ticket_id
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedules.account_id = $1
    `,
    getCommutePassesByIdAndAccountId: `
        SELECT commute_pass_id,
        commute_schedule.account_id AS account_id,
        commute_passes.commute_ticket_id AS commute_ticket_id,
        commute_schedule.day_of_week AS day_of_week,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_schedules.commute_system_id AS commute_system_id,
        commute_passes.start_time AS start_time,
        commute_passes.duration AS duration,
        commute_passes.date_created,
        commute_passes.date_modified
        FROM commute_passes
        LEFT JOIN commute_schedules
        ON commute_passes.commute_schedule_id = commute_schedules.commute_schedule_id
        LEFT JOIN commute_tickets
        ON commute_schedules.commute_ticket_id = commute_tickets.commute_ticket_id
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedules.account_id = $1
        AND commute_schedules.commute_schedule_id = $2
    `,
    getCommutePassesById: `
        SELECT commute_schedule_id,
        commute_schedules.account_id AS account_id,
        commute_schedules.commute_ticket_id AS commute_ticket_id,
        commute_schedules.day_of_week AS day_of_week,
        concat(commute_systems.name, ' ', fare_details.name) AS name,
        commute_schedules.commute_system_id AS commute_system_id,
        commute_schedules.time_of_day AS start_time,
        commute_schedules.duration AS duration,
        commute_schedules.date_created,
        commute_schedules.date_modified
        FROM commute_schedules
        LEFT JOIN commute_tickets
        ON commute_schedules.commute_ticket_id = commute_tickets.commute_ticket_id
        LEFT JOIN fare_details
        ON commute_tickets.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedules.commute_schedule_id = $1
    `,
    createCommuteSchedule:
        'INSERT INTO commute_schedules (account_id, commute_ticket_id, day_of_week, time_of_day, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    updateCommuteSchedule:
        'UPDATE commute_schedules SET account_id = $1, commute_ticket_id = $2, day_of_week = $3, time_of_day = $4, duration = $5 WHERE commute_schedule_id = $6 RETURNING *',
    deleteCommuteSchedule:
        'DELETE FROM commute_schedules WHERE commute_schedule_id = $1',
};
