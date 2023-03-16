const accountQueries = {
    getAccounts: "SELECT accounts.account_id, accounts.account_name, accounts.account_type, COALESCE(accounts.account_balance, 0) + COALESCE(d.deposit_amount, 0) - COALESCE(w.withdrawal_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts LEFT JOIN (SELECT account_id, SUM(deposit_amount) AS deposit_amount FROM deposits GROUP BY account_id) AS d ON accounts.account_id = d.account_id LEFT JOIN (SELECT account_id, SUM(withdrawal_amount) AS withdrawal_amount FROM withdrawals GROUP BY account_id) AS w ON accounts.account_id = w.account_id ORDER BY accounts.account_id ASC",
    getAccount: "SELECT accounts.account_id, accounts.account_name, accounts.account_type, COALESCE(accounts.account_balance, 0) + COALESCE(d.deposit_amount, 0) - COALESCE(w.withdrawal_amount, 0) AS account_balance, accounts.date_created, accounts.date_modified FROM accounts LEFT JOIN (SELECT account_id, SUM(deposit_amount) AS deposit_amount FROM deposits GROUP BY account_id) AS d ON accounts.account_id = d.account_id LEFT JOIN (SELECT account_id, SUM(withdrawal_amount) AS withdrawal_amount FROM withdrawals GROUP BY account_id) AS w ON accounts.account_id = w.account_id WHERE accounts.account_id = $1",
    createAccount: 'INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
    updateAccount: 'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4',
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
    getLoansByAccount: 'SELECT * FROM loans WHERE account_id = $1 AND loan_begin_date <= $2 ORDER BY date_created DESC',
    getLoans: 'SELECT * FROM loans WHERE account_id = $1 ORDER BY loan_id ASC',
    getLoan: 'SELECT * FROM loans WHERE account_id = $1 AND loan_id = $2',
    createLoan: 'INSERT INTO loans (account_id, loan_amount, loan_plan_amount, loan_recipient, loan_title, loan_description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, loan_begin_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
    updateLoan: 'UPDATE loans SET account_id = $1, loan_amount = $2, loan_plan_amount = $3, loan_recipient = $4, loan_title = $5, loan_description = $6, frequency_type = $7, frequency_type_variable = $8, frequency_day_of_month = $9, frequency_day_of_week = $10, frequency_week_of_month = $11, frequency_month_of_year = $12, loan_begin_date = $13 WHERE loan_id = $14 RETURNING *',
    deleteLoan: 'DELETE FROM loans WHERE loan_id = $1',
  };

  const wishlistQueries = {
    getWishlistsByAccount: 'SELECT * FROM wishlist WHERE account_id = $1 ORDER BY date_created DESC',
    getWishlists: 'SELECT * FROM wishlist WHERE account_id = $1 ORDER BY wishlist_id ASC',
    getWishlist: 'SELECT * FROM wishlist WHERE account_id = $1 AND wishlist_id = $2',
    createWishlist: 'INSERT INTO wishlist (account_id, wishlist_amount, wishlist_description) VALUES ($1, $2, $3) RETURNING *',
    updateWishlist: 'UPDATE wishlist SET account_id = $1, wishlist_amount = $2, wishlist_description = $3 WHERE wishlist_id = $4 RETURNING *',
    deleteWishlist: 'DELETE FROM wishlist WHERE wishlist_id = $1',
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
    wishlistQueries,
    currentBalanceQueries,
  }