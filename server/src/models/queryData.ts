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

interface JobQueries {
    getJobsByAccountId: string;
    getJobs: string;
    getJob: string;
    getJobsWithSchedulesByAccountId: string;
    getJobsWithSchedulesByJobIdAndAccountId: string;
    getJobScheduleByJobId: string;
    getJobsWithSchedulesByJobId: string;
    getAllJobsWithSchedules: string;
    getAccountIdFromJobs: string;
    createJob: string;
    createJobSchedule: string;
    updateJob: string;
    updateJobSchedule: string;
    deleteJob: string;
    deleteJobSchedule: string;
    deleteJobScheduleByJobId: string;
}

interface PayrollQueries {
    getPayrolls: string;
    getPayrollsMiddleware: string;
    getAllPayrollTaxes: string;
    getPayrollTaxesById: string;
    getPayrollTaxesByJobId: string;
    getPayrollTaxesByIdAndJobId: string;
    createPayrollTax: string;
    updatePayrollTax: string;
    deletePayrollTax: string;
    getAllPayrollDates: string;
    getPayrollDatesById: string;
    getPayrollDatesByJobId: string;
    getPayrollDatesByIdAndJobId: string;
    createPayrollDate: string;
    updatePayrollDate: string;
    deletePayrollDate: string;
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
            accounts.account_name,
            COALESCE(t.total_transaction_amount_after_tax, 0) AS account_balance,
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
            accounts.account_name,
            COALESCE(t.total_transaction_amount_after_tax, 0) AS account_balance,
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
        'INSERT INTO accounts (account_name) VALUES ($1) RETURNING *',
    updateAccount:
        'UPDATE accounts SET account_name = $1 WHERE account_id = $2 RETURNING *',
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

export const jobQueries: JobQueries = {
    getJobsByAccountId: 'SELECT * FROM jobs WHERE account_id = $1',
    getJobs: `
        SELECT * FROM jobs
    `,
    getJob: 'SELECT * FROM jobs WHERE job_id = $1',
    getJobScheduleByJobId: 'SELECT * FROM job_schedule WHERE job_id = $1',
    getJobsWithSchedulesByAccountId: `
        SELECT
            j.job_id AS "job_id",
            j.account_id AS "account_id",
            j.job_name AS "job_name",
            j.hourly_rate AS "hourly_rate",
            j.vacation_days AS "vacation_days",
            j.sick_days AS "sick_days",
            COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
            COALESCE(json_agg(
                json_build_object(
                    'day_of_week', js.day_of_week,
                    'start_time', js.start_time,
                    'end_time', js.end_time
                ) ORDER BY js.day_of_week
            ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
        FROM
            jobs j
        JOIN
            job_schedule js ON j.job_id = js.job_id
        WHERE
            j.account_id = $1
        GROUP BY
            j.job_id;
    `,
    getJobsWithSchedulesByJobIdAndAccountId: `
        SELECT
            j.job_id AS "job_id",
            j.account_id AS "account_id",
            j.job_name AS "job_name",
            j.hourly_rate AS "hourly_rate",
            j.vacation_days AS "vacation_days",
            j.sick_days AS "sick_days",
            COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
            COALESCE(json_agg(
                json_build_object(
                    'day_of_week', js.day_of_week,
                    'start_time', js.start_time,
                    'end_time', js.end_time
                ) ORDER BY js.day_of_week
            ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
        FROM
            jobs j
        JOIN
            job_schedule js ON j.job_id = js.job_id
        WHERE
            j.job_id = $1
            AND j.account_id = $2
        GROUP BY
            j.job_id;
    `,
    getJobsWithSchedulesByJobId: `
        SELECT
            j.job_id AS "job_id",
            j.account_id AS "account_id",
            j.job_name AS "job_name",
            j.hourly_rate AS "hourly_rate",
            j.vacation_days AS "vacation_days",
            j.sick_days AS "sick_days",
            COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
            COALESCE(json_agg(
                json_build_object(
                    'day_of_week', js.day_of_week,
                    'start_time', js.start_time,
                    'end_time', js.end_time
                ) ORDER BY js.day_of_week
            ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
        FROM
            jobs j
        JOIN
            job_schedule js ON j.job_id = js.job_id
        WHERE
            j.job_id = $1
        GROUP BY
            j.job_id;
    `,
    getAllJobsWithSchedules: `
        SELECT
            j.job_id AS "job_id",
            j.account_id AS "account_id",
            j.job_name AS "job_name",
            j.hourly_rate AS "hourly_rate",
            j.vacation_days AS "vacation_days",
            j.sick_days AS "sick_days",
            COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
            COALESCE(json_agg(
                json_build_object(
                    'day_of_week', js.day_of_week,
                    'start_time', js.start_time,
                    'end_time', js.end_time
                ) ORDER BY js.day_of_week
            ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
        FROM
            jobs j
        LEFT JOIN
            job_schedule js ON j.job_id = js.job_id
        GROUP BY
            j.job_id;
    `,
    getAccountIdFromJobs: 'SELECT account_id FROM accounts WHERE job_id = $1',
    createJob:
        'INSERT INTO jobs (account_id, job_name, hourly_rate, vacation_days, sick_days) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    createJobSchedule:
        'INSERT INTO job_schedule (job_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
    updateJob:
        'UPDATE jobs SET account_id = $1, job_name = $2, hourly_rate = $3, vacation_days = $4, sick_days = $5 WHERE job_id = $6 RETURNING *',
    updateJobSchedule:
        'UPDATE job_schedule SET day_of_week = $1, start_time = $2, end_time = $3 WHERE job_schedule_id = $4 RETURNING *',
    deleteJob: 'DELETE FROM jobs WHERE job_id = $1',
    deleteJobSchedule: 'DELETE FROM job_schedule WHERE job_id = $1',
    deleteJobScheduleByJobId:
        'DELETE FROM job_schedule WHERE job_schedule_id = $1',
};

export const payrollQueries: PayrollQueries = {
    getPayrolls: `
    WITH ordered_table AS (
        SELECT payroll_day,
        ROW_NUMBER() OVER (ORDER BY payroll_day) AS row_num
        FROM payroll_dates
    )
    SELECT 
                make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s2.payroll_start_day) AS start_date,
                make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_day) AS end_date,
                COUNT(js.day_of_week) AS work_days,
                SUM(
                    COALESCE(
                        EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 * j.hourly_rate, 
                        0
                    )
                )::numeric(20, 2) AS gross_pay,
                SUM(
                    COALESCE(
                        EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 * j.hourly_rate * (1 - COALESCE(pt.rate, 0)), 
                        0
                    )
                )::numeric(20, 2) AS net_pay,
                SUM(
                    COALESCE(
                        EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600, 
                        0
                    )
                )::numeric(20, 2) AS hours_worked
            FROM 
                jobs j
                JOIN job_schedule js ON j.job_id = js.job_id
                CROSS JOIN LATERAL (
                    SELECT
                        COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1 AS payroll_start_day,
                        CASE 
                            WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY') THEN 
                                EXTRACT(DAY FROM DATE_TRUNC('MONTH', current_date) + INTERVAL '1 MONTH - 1 DAY')
                            ELSE payroll_day 
                        END AS unadjusted_payroll_day
                    FROM ordered_table
                ) s2
                CROSS JOIN LATERAL (
                    SELECT 
                        COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1 AS payroll_start_day,
                        CASE
                            WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_day::integer)) = 0 THEN
                                s2.unadjusted_payroll_day - 2
                            WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM current_date)::integer, EXTRACT(MONTH FROM current_date)::integer, s2.unadjusted_payroll_day::integer)) = 6 THEN
                                s2.unadjusted_payroll_day - 1
                            ELSE s2.unadjusted_payroll_day
                        END::integer AS adjusted_payroll_day
                    FROM ordered_table
                ) s1
                JOIN LATERAL generate_series(
                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.payroll_start_day),
                    make_date(extract(year from current_date)::integer, extract(month from current_date)::integer, s1.adjusted_payroll_day),
                    '1 day'::interval
                ) AS gs(date) ON true
                LEFT JOIN (
                    SELECT job_id, SUM(rate) AS rate
                    FROM payroll_taxes
                    GROUP BY job_id
                ) pt ON j.job_id = pt.job_id
            WHERE 
                j.job_id = $1
                AND js.day_of_week = EXTRACT(DOW FROM gs.date)::integer
            GROUP BY 
                s2.payroll_start_day, s1.adjusted_payroll_day
            ORDER BY 
                start_date, end_date
    `,
    getPayrollsMiddleware: `
        WITH work_days_and_hours AS (
            WITH ordered_table AS (
                SELECT payroll_day,
                ROW_NUMBER() OVER (ORDER BY payroll_day) AS row_num
                FROM payroll_dates
            )
                SELECT
                    CASE
						WHEN s2.payroll_start_day::integer < 0 THEN
							(make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
						ELSE 
							make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
					END AS start_date,
                    make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day) AS end_date,
                    d.date AS work_date,
                    EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600 AS hours_worked_per_day,
                    j.hourly_rate,
                    COALESCE(pt.rate, 0) AS tax_rate
                FROM 
                    jobs j
                    JOIN job_schedule js ON j.job_id = js.job_id
                    CROSS JOIN LATERAL generate_series(current_date, $2::date + INTERVAL '1 month', '1 month') AS d1(date)
                    CROSS JOIN LATERAL (
                        SELECT
							 CASE WHEN
                                (SELECT COUNT(*) FROM payroll_dates) = 1 AND payroll_day < 31 THEN -(payroll_day + 1)
							 ELSE 
								COALESCE(LAG(payroll_day) OVER (ORDER BY row_num), 0) + 1
							 END AS payroll_start_day,
                            CASE 
                                WHEN payroll_day > EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY') 
                                THEN EXTRACT(DAY FROM DATE_TRUNC('MONTH', d1) + INTERVAL '1 MONTH - 1 DAY')
                                ELSE payroll_day 
                            END AS unadjusted_payroll_end_day
                        FROM ordered_table
                    ) s2
                    CROSS JOIN LATERAL (
                        SELECT
                            s2.payroll_start_day,
                            CASE
                                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 0 
                                    THEN s2.unadjusted_payroll_end_day - 2 -- If it's a Sunday, adjust to Friday
                                WHEN EXTRACT(DOW FROM MAKE_DATE(EXTRACT(YEAR FROM d1)::integer, EXTRACT(MONTH FROM d1)::integer, s2.unadjusted_payroll_end_day::integer)) = 6
                                    THEN s2.unadjusted_payroll_end_day - 1 -- If it's a Saturday, adjust to Friday
                                ELSE s2.unadjusted_payroll_end_day
                            END::integer AS adjusted_payroll_end_day
                    ) s1
                    JOIN LATERAL generate_series(
                    CASE
						WHEN s2.payroll_start_day::integer < 0 THEN
							(make_date(extract(year from d1)::integer, extract(month from d1)::integer, ABS(s2.payroll_start_day::integer)) - INTERVAL '1 MONTH')::DATE
						ELSE 
							make_date(extract(year from d1)::integer, extract(month from d1)::integer, s2.payroll_start_day::integer)
					END, 
                        make_date(extract(year from d1)::integer, extract(month from d1)::integer, s1.adjusted_payroll_end_day),
                        '1 day'
                    ) AS d(date) ON js.day_of_week = EXTRACT(DOW FROM d.date)::integer
                    LEFT JOIN (
                        SELECT job_id, SUM(rate) AS rate
                        FROM payroll_taxes
                        GROUP BY job_id
                    ) pt ON j.job_id = pt.job_id
                WHERE 
                    j.job_id = $1 
                    AND d.date >= CURRENT_DATE 
                    AND d.date <= $2::date
            )
            SELECT
                start_date,
                end_date,
                COUNT(work_date) AS work_days,
                SUM(hours_worked_per_day * hourly_rate) AS gross_pay,
                SUM(hours_worked_per_day * hourly_rate * (1 - tax_rate)) AS net_pay,
                SUM(hours_worked_per_day) AS hours_worked
            FROM 
                work_days_and_hours
            GROUP BY 
                start_date, end_date
            ORDER BY 
                start_date, end_date;
   `,
    getAllPayrollTaxes: 'SELECT * FROM payroll_taxes',
    getPayrollTaxesById:
        'SELECT * FROM payroll_taxes WHERE payroll_taxes_id = $1',
    getPayrollTaxesByJobId: 'SELECT * FROM payroll_taxes WHERE job_id = $1',
    getPayrollTaxesByIdAndJobId:
        'SELECT * FROM payroll_taxes WHERE payroll_taxes_id = $1 AND job_id = $2',
    createPayrollTax:
        'INSERT INTO payroll_taxes (job_id, name, rate) VALUES ($1, $2, $3) RETURNING *',
    updatePayrollTax:
        'UPDATE payroll_taxes SET name = $1, rate = $2 WHERE payroll_taxes_id = $3 RETURNING *',
    deletePayrollTax: 'DELETE FROM payroll_taxes WHERE payroll_taxes_id = $1',
    getAllPayrollDates: 'SELECT * FROM payroll_dates',
    getPayrollDatesById:
        'SELECT * FROM payroll_dates WHERE payroll_date_id = $1',
    getPayrollDatesByJobId: 'SELECT * FROM payroll_dates WHERE job_id = $1',
    getPayrollDatesByIdAndJobId:
        'SELECT * FROM payroll_dates WHERE payroll_date_id = $1 AND job_id = $2',
    createPayrollDate:
        'INSERT INTO payroll_dates (job_id, payroll_day) VALUES ($1, $2) RETURNING *',
    updatePayrollDate:
        'UPDATE payroll_dates SET payroll_day = $1 WHERE payroll_date_id = $2 RETURNING *',
    deletePayrollDate: 'DELETE FROM payroll_dates WHERE payroll_date_id = $1',
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
        COALESCE(t.transaction_amount_after_tax, 0) AS account_balance
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
    getTaxRateByTaxId: 'SELECT tax_rate FROM taxes WHERE tax_id = $1',
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
    getCommuteSystemById:
        'SELECT * FROM commute_systems WHERE commute_system_id = $1',
    createCommuteSystem:
        'INSERT INTO commute_systems (name, fare_cap, fare_cap_duration) VALUES ($1, $2, $3) RETURNING *',
    updateCommuteSystem:
        'UPDATE commute_systems SET name = $1, fare_cap = $2, fare_cap_duration = $3 WHERE commute_system_id = $4 RETURNING *',
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
        SELECT fare_details.fare_detail_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            timed_pass_duration,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
        FROM fare_details
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
    `,
    getFareDetailsById: `
        SELECT fare_details.fare_detail_id,
            fare_details.commute_system_id AS commute_system_id,
            commute_systems.name AS system_name,
            fare_details.name AS fare_type,
            fare_amount,
            timed_pass_duration,
            alternate_fare_detail_id,
            fare_details.date_created,
            fare_details.date_modified
        FROM fare_details
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE fare_details.fare_detail_id = $1`,
    createFareDetails:
        'INSERT INTO fare_details (commute_system_id, name, fare_amount, timed_pass_duration, alternate_fare_detail_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    updateFareDetails:
        'UPDATE fare_details SET commute_system_id = $1, name = $2, fare_amount = $3, timed_pass_duration = $4 alternate_fare_detail_id = $5 WHERE fare_detail_id = $6 RETURNING *',
    deleteFareDetails: 'DELETE FROM fare_details WHERE fare_detail_id = $1',
};

export const commuteScheduleQueries = {
    getCommuteSchedules: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
    `,
    getCommuteSchedulesByAccountId: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedule.account_id = $1
    `,
    getCommuteSchedulesByIdAndAccountId: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedule.account_id = $1
        AND commute_schedule.commute_schedule_id = $2
    `,
    getCommuteSchedulesById: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedule.commute_schedule_id = $1
    `,
    getCommuteScheduleByDayAndTimeExcludingId: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedule.account_id = $1
        AND commute_schedule.day_of_week = $2
        AND (
        -- New schedule starts within an existing schedule's time slot
        (commute_schedule.start_time <= $3 AND $3 < commute_schedule.start_time + interval '1 minute' * commute_schedule.duration)
        OR
        -- Existing schedule starts within new schedule's time slot
        (commute_schedule.start_time < $3 + interval '1 minute' * $4 AND commute_schedule.start_time >= $3)
        )
        AND commute_schedule.commute_schedule_id <> $5
    `,
    getCommuteScheduleByDayAndTime: `
        SELECT commute_schedule_id,
            commute_systems.commute_system_id,
            commute_schedule.account_id AS account_id,
            commute_schedule.cron_job_id AS cron_job_id,
            commute_schedule.fare_detail_id AS fare_detail_id,
            commute_schedule.day_of_week AS day_of_week,
            concat(commute_systems.name, ' ', fare_details.name) AS pass,
            commute_schedule.start_time AS start_time,
            commute_schedule.duration AS duration,
            fare_details.fare_amount AS fare_amount,
            fare_details.timed_pass_duration AS timed_pass_duration,
            commute_schedule.date_created,
            commute_schedule.date_modified
        FROM commute_schedule
        LEFT JOIN fare_details
        ON commute_schedule.fare_detail_id = fare_details.fare_detail_id
        LEFT JOIN commute_systems
        ON fare_details.commute_system_id = commute_systems.commute_system_id
        WHERE commute_schedule.account_id = $1
        AND commute_schedule.day_of_week = $2
        AND (
        -- New schedule starts within an existing schedule's time slot
        (commute_schedule.start_time <= $3 AND $3 < commute_schedule.start_time + interval '1 minute' * commute_schedule.duration)
        OR
        -- Existing schedule starts within new schedule's time slot
        (commute_schedule.start_time < $3 + interval '1 minute' * $4 AND commute_schedule.start_time >= $3)
        )
    `,
    createCommuteSchedule:
        'INSERT INTO commute_schedule (account_id, day_of_week, fare_detail_id, start_time, duration) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    updateCommuteSchedule:
        'UPDATE commute_schedule SET account_id = $1, day_of_week = $2, fare_detail_id = $3, start_time = $4, duration = $5 WHERE commute_schedule_id = $6 RETURNING *',
    deleteCommuteSchedule:
        'DELETE FROM commute_schedule WHERE commute_schedule_id = $1',
    updateCommuteWithCronJobId:
        'UPDATE commute_schedule SET cron_job_id = $1 WHERE commute_schedule_id = $2 RETURNING *',
};

export const fareTimeslotsQueries = {
    getTimeslotsByFareId: 'SELECT * FROM timeslots WHERE fare_detail_id = $1',
    getTimeslots: 'SELECT * FROM timeslots',
    createTimeslot:
        'INSERT INTO timeslots (fare_detail_id, day_of_week, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
    updateTimeslot:
        'UPDATE timeslots SET fare_detail_id = $1 day_of_week = $2, start_time = $3, end_time = $4 WHERE timeslot_id = $5',
    deleteTimeslot: 'DELETE FROM timeslots WHERE timeslot_id = $1',
    deleteTimeslotByFareId: 'DELETE FROM timeslots WHERE fare_detail_id = $1',
};

export const commuteOverviewQueries = {
    getCommuteOverview: `
        WITH RECURSIVE days AS (
            SELECT date_trunc('month', current_date)::date as day
            UNION ALL
            SELECT day + 1
            FROM days
            WHERE day < date_trunc('month', current_date)::date + interval '1 month' - interval '1 day'
        ),
        count_days AS (
            SELECT
            extract(dow from day)::int AS day_of_week,
            COUNT(*) AS num_days
            FROM days
            GROUP BY day_of_week
        ),
        ticket_fares AS (
            SELECT
                cs.commute_schedule_id,
                cs.day_of_week,
                csy.name AS system_name,
                fd.commute_system_id,
                csy.fare_cap AS fare_cap,
                csy.fare_cap_duration AS fare_cap_duration,
                COALESCE(fd.fare_amount, 0) AS fare_amount,
                (
                    SELECT COALESCE(SUM(ch.fare_amount), 0)
                    FROM commute_history ch
                    WHERE ch.account_id = cs.account_id
                    AND ch.commute_system = csy.name
                    AND (
                        (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                        (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                        (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                    )
                ) AS current_spent
            FROM commute_schedule cs
            JOIN fare_details fd ON cs.fare_detail_id = fd.fare_detail_id
            JOIN commute_systems csy ON fd.commute_system_id = csy.commute_system_id
            WHERE cs.account_id = $1
        )
        SELECT
            tf.commute_system_id,
            tf.system_name,
            COALESCE(SUM(tf.fare_amount), 0) AS total_cost_per_week,
            COALESCE(SUM(tf.fare_amount * cd.num_days), 0) AS total_cost_per_month,
            COALESCE(COUNT(tf.commute_schedule_id), 0) AS rides,
            tf.fare_cap AS fare_cap,
            tf.fare_cap_duration AS fare_cap_duration,
            tf.current_spent
        FROM ticket_fares tf
        JOIN count_days cd ON tf.day_of_week = cd.day_of_week
        GROUP BY tf.commute_system_id, tf.system_name, tf.fare_cap, tf.fare_cap_duration, tf.current_spent;
    `,
};

export const fareCappingQueries = {
    getFareCapping: `
        WITH RECURSIVE ticket_fares AS (
            SELECT
                cs.commute_schedule_id,
                cs.day_of_week,
                csy.name AS system_name,
                fd.commute_system_id,
                csy.fare_cap AS fare_cap,
                csy.fare_cap_duration AS fare_cap_duration,
                COALESCE(fd.fare_amount, 0) AS fare_amount,
                (
                    SELECT COALESCE(SUM(ch.fare_amount), 0)
                    FROM commute_history ch
                    WHERE ch.account_id = cs.account_id
                    AND ch.commute_system = csy.name
                    AND (
                        (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                        (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                        (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                    )
                ) AS current_spent
            FROM commute_schedule cs
            JOIN fare_details fd ON cs.fare_detail_id = fd.fare_detail_id
            JOIN commute_systems csy ON fd.commute_system_id = csy.commute_system_id
            WHERE cs.account_id = $1
        )
        SELECT
            tf.commute_system_id,
            tf.system_name,
            tf.fare_cap AS fare_cap,
            tf.fare_cap_duration AS fare_cap_duration,
            tf.current_spent
        FROM ticket_fares tf
        GROUP BY tf.commute_system_id, tf.system_name, tf.fare_cap, tf.fare_cap_duration, tf.current_spent;
    `,
};

export const cronQueries = {
    scheduleCreateTransactionHistory: `SELECT 
        cron.schedule($1, $$
            INSERT INTO transaction_history (account_id, transaction_amount, transaction_tax_rate, transaction_title, transaction_description) VALUES ($2, $3, $4, $5, $6)
        $$);`,
};
