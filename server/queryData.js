const accountQueries = {
    getAccounts: 'SELECT accounts.account_id, accounts.account_name, accounts.account_type, accounts.account_balance + deposit_amount - withdrawal_amount AS account_balance, accounts.date_created, accounts.date_modified FROM accounts JOIN deposits ON accounts.account_id=deposits.account_id JOIN withdrawals ON accounts.account_id=withdrawals.account_id ORDER BY accounts.account_id ASC',
    getAccount: 'SELECT accounts.account_id, accounts.account_name, accounts.account_type, accounts.account_balance + deposit_amount - withdrawal_amount AS account_balance, accounts.date_created, accounts.date_modified FROM accounts JOIN deposits ON accounts.account_id=deposits.account_id JOIN withdrawals ON accounts.account_id=withdrawals.account_id WHERE accounts.account_id = $1',
    createAccount: 'INSERT INTO accounts (account_name, account_type, account_balance) VALUES ($1, $2, $3) RETURNING *',
    updateAccount: 'UPDATE accounts SET account_name = $1, account_type = $2, account_balance = $3 WHERE account_id = $4',
    deleteAccount: 'DELETE FROM accounts WHERE account_id = $1'
  };

  module.exports = {
    accountQueries
  }