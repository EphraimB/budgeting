const pool = require('./db');
const { accountQueries, depositQueries, withdrawalQueries, expenseQueries, loanQueries, wishlistQueries, currentBalanceQueries } = require('./queryData');

// Get all accounts
const getAccounts = (request, response) => {
    pool.query(accountQueries.getAccounts, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get account by id
const getAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.getAccount, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create account
const createAccount = (request, response) => {
    const { name, type, balance } = request.body;

    pool.query(accountQueries.createAccount,
        [name, type, balance],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(201).json(results.rows);
        });
}

// Update account
const updateAccount = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, type, balance } = request.body;

    pool.query(
        accountQueries.updateAccount,
        [name, type, balance, id],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).send(`Account modified with ID: ${id}`);
        }
    );
}

// Delete account
const deleteAccount = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(accountQueries.deleteAccount, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Account deleted with ID: ${id}`);
    });
}

// Get deposits by account
const getDepositsByAccount = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);
    const months = parseInt(request.params.months);

    pool.query(depositQueries.getDepositsByAccount, [accountId], (error, results) => {
        if (error) {
            throw error;
        }
        
        request.deposits = results.rows;

        next();
    });
}

// Get all deposits
const getDeposits = (request, response) => {
    pool.query(depositQueries.getDeposits, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get deposit by id
const getDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.getDeposit, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create deposit
const createDeposit = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(depositQueries.createDeposit, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Deposit added with ID: ${results.insertId}`);
    });
}

// Update deposit
const updateDeposit = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(depositQueries.updateDeposit, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit modified with ID: ${id}`);
    }
    );
}

// Delete deposit
const deleteDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.deleteDeposit, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Deposit deleted with ID: ${id}`);
    });
}

// Get withdrawals by account
const getWithdrawalsByAccount = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);
    const months = parseInt(request.params.months);

    pool.query(withdrawalQueries.getWithdrawalsByAccount, [accountId], (error, results) => {
        if (error) {
            throw error;
        }

        request.withdrawals = results.rows;

        next();
    });
}

// Get all withdrawals
const getWithdrawals = (request, response) => {
    pool.query(withdrawalQueries.getWithdrawals, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get withdrawal by id
const getWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.getWithdrawal, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create withdrawal
const createWithdrawal = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(withdrawalQueries.createWithdrawal, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Withdrawal added with ID: ${results.insertId}`);
    });
}

// Update withdrawal
const updateWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(withdrawalQueries.updateWithdrawal, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal modified with ID: ${id}`);
    });
}

// Delete withdrawal
const deleteWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.deleteWithdrawal, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Withdrawal deleted with ID: ${id}`);
    });
}

// Get expenses by account
const getExpensesByAccount = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);
    const months = parseInt(request.params.months);

    pool.query(expenseQueries.getExpensesByAccount, [accountId], (error, results) => {
        if (error) {
            throw error;
        }

        request.expenses = results.rows;

        next();
    });
}

// Get all expenses
const getExpenses = (request, response) => {
    pool.query(expenseQueries.getExpenses, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get expense by id
const getExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.getExpense, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create expense
const createExpense = (request, response) => {
    const { account_id, amount, title, description, frequency, begin_date } = request.body;

    pool.query(expenseQueries.createExpense, [account_id, amount, title, description, frequency, begin_date], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Expense added with ID: ${results.insertId}`);
    });
}

// Update expense
const updateExpense = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(expenseQueries.updateExpense, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Expense modified with ID: ${id}`);
    });
}

// Delete expense
const deleteExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.deleteExpense, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Expense deleted with ID: ${id}`);
    });
}

// Get loans by account
const getLoansByAccount = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);
    const months = parseInt(request.params.months);

    pool.query(loanQueries.getLoansByAccount, [accountId], (error, results) => {
        if (error) {
            throw error;
        }

        request.loans = results.rows;

        next();
    });
}

// Get all loans
const getLoans = (request, response) => {
    pool.query(loanQueries.getLoans, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get loan by id
const getLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.getLoan, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create loan
const createLoan = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(loanQueries.createLoan, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Loan added with ID: ${results.insertId}`);
    });
}

// Update loan
const updateLoan = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(loanQueries.updateLoan, [account_id, amount, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Loan modified with ID: ${id}`);
    });
}

// Delete loan
const deleteLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.deleteLoan, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Loan deleted with ID: ${id}`);
    });
}

// Get wishlists by account
const getWishlistsByAccount = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);
    const months = parseInt(request.params.months);

    pool.query(wishlistQueries.getWishlistsByAccount, [accountId], (error, results) => {
        if (error) {
            throw error;
        }

        request.wishlists = results.rows;

        next();
    });
}

// Get all wishlists
const getWishlists = (request, response) => {
    pool.query(wishlistQueries.getWishlists, (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Get wishlist by id
const getWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.getWishlist, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).json(results.rows);
    });
}

// Create wishlist
const createWishlist = (request, response) => {
    const { name, description } = request.body;

    pool.query(wishlistQueries.createWishlist, [name, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(`Wishlist added with ID: ${results.insertId}`);
    });
}

// Update wishlist
const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { name, description } = request.body;

    pool.query(wishlistQueries.updateWishlist, [name, description, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Wishlist modified with ID: ${id}`);
    });
}

// Delete wishlist
const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(`Wishlist deleted with ID: ${id}`);
    });
}

// Get current balance of account based on deposits and withdrawals
const getCurrentBalance = (request, response, next) => {
    const accountId = parseInt(request.params.accountId);

    pool.query(currentBalanceQueries.getCurrentBalance, [accountId], (error, results) => {
        if (error) {
            throw error;
        }
        
        const currentBalance = results.rows[0].account_balance;
        request.currentBalance = currentBalance;

        next();
    });
}

// Export all functions
module.exports = { getAccounts, getAccount, createAccount, updateAccount, deleteAccount, getDepositsByAccount, getDeposits, getDeposit, createDeposit, updateDeposit, deleteDeposit, getWithdrawalsByAccount, getWithdrawals, getWithdrawal, createWithdrawal, updateWithdrawal, deleteWithdrawal, getExpensesByAccount, getExpenses, getExpense, createExpense, updateExpense, deleteExpense, getLoansByAccount, getLoans, getLoan, createLoan, updateLoan, deleteLoan, getWishlistsByAccount, getWishlists, getWishlist, createWishlist, updateWishlist, deleteWishlist, getCurrentBalance };