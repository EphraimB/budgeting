const pool = require('./db');
const { accountQueries, depositQueries, withdrawalQueries, expenseQueries, loanQueries, wishlistQueries, currentBalanceQueries } = require('./queryData');

// Get all accounts
const getAccounts = (request, response) => {
    const id = parseInt(request.query.id);

    if (!id) {
        pool.query(accountQueries.getAccounts, (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).json(results.rows);
        });
    } else {
        pool.query(accountQueries.getAccount, [id], (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).json(results.rows);
        });
    }
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
        response.status(204).send();
    });
}

// Get deposits by account
const getDepositsByAccount = (request, response, next) => {
    const accountId = parseInt(request.body.account_id);
    const fromDate = request.body.from_date;

    if (!accountId) {
        response.status(400).send("Account ID must be provided");
        return;
    }

    if (isNaN(accountId)) {
        response.status(400).send("Account ID must be a number");
        return;
    }

    if (!fromDate) {
        response.status(400).send("From date must be provided");
        return;
    }

    // Validate date format in yyyy-mm-dd format
    if (!fromDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        response.status(400).send("From date must be in yyyy-mm-dd format");
        return;
    }

    pool.query(depositQueries.getDepositsDateFiltered, [accountId, fromDate], (error, results) => {
        if (error) {
            throw error;
        }

        request.deposits = results.rows;

        next();
    });
}

// Get all deposits
const getDeposits = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(depositQueries.getDeposits, [account_id], (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).json(results.rows);
        });
    } else {
        pool.query(depositQueries.getDeposit, [account_id, id], (error, results) => {
            if (error) {
                throw error;
            }
            return response.status(200).json(results.rows);
        });
    }
}

// Create deposit
const createDeposit = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(depositQueries.createDeposit, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).json(results.rows);
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
        response.status(200).send(results.rows);
    });
}

// Delete deposit
const deleteDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.deleteDeposit, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(204).send();
    });
}

// Get withdrawals by account
const getWithdrawalsByAccount = (request, response, next) => {
    const accountId = parseInt(request.body.account_id);
    const fromDate = request.body.from_date;

    if (!accountId) {
        response.status(400).send("Account ID must be provided");
        return;
    }

    if (isNaN(accountId)) {
        response.status(400).send("Account ID must be a number");
        return;
    }

    if (!fromDate) {
        response.status(400).send("From date must be provided");
        return;
    }

    // Validate date format in yyyy-mm-dd format
    if (!fromDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        response.status(400).send("From date must be in yyyy-mm-dd format");
        return;
    }

    pool.query(withdrawalQueries.getWithdrawalsByAccount, [accountId, fromDate], (error, results) => {
        if (error) {
            throw error;
        }

        request.withdrawals = results.rows;

        next();
    });
}

// Get all withdrawals
const getWithdrawals = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(withdrawalQueries.getWithdrawals, [account_id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(withdrawalQueries.getWithdrawal, [account_id, id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
}

// Create withdrawal
const createWithdrawal = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(withdrawalQueries.createWithdrawal, [account_id, amount, description], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).json(results.rows);
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
        response.status(200).send(results.rows);
    });
}

// Delete withdrawal
const deleteWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.deleteWithdrawal, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(204).send();
    });
}

// Get expenses by account
const getExpensesByAccount = (request, response, next) => {
    const account_id = parseInt(request.body.account_id);
    const to_date = request.body.to_date;

    if (!account_id) {
        response.status(400).send("Account ID must be provided");
        return;
    }

    if (isNaN(account_id)) {
        response.status(400).send("Account ID must be a number");
        return;
    }

    if (account_id <= 0) {
        response.status(400).send("Account ID must be greater than 0");
        return;
    }

    if (!to_date) {
        response.status(400).send("To date must be provided");
        return;
    }

    // Validate date format in yyyy-mm-dd format
    if (!to_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        response.status(400).send("To date must be in yyyy-mm-dd format");
        return;
    }

    pool.query(expenseQueries.getExpensesByAccount, [account_id, to_date], (error, results) => {
        if (error) {
            throw error;
        }

        request.expenses = results.rows;

        next();
    });
}

// Get all expenses
const getExpenses = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(expenseQueries.getExpenses, [account_id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(expenseQueries.getExpense, [account_id, id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
}

// Create expense
const createExpense = (request, response) => {
    const { account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;

    pool.query(expenseQueries.createExpense, [account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).json(results.rows);
    });
}

// Update expense
const updateExpense = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;

    pool.query(expenseQueries.updateExpense, [account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(results.rows);
    });
}

// Delete expense
const deleteExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.deleteExpense, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(204).send();
    });
}

// Get loans by account
const getLoansByAccount = (request, response, next) => {
    const accountId = parseInt(request.body.account_id);
    const to_date = request.body.to_date;

    if (!accountId) {
        response.status(400).send("Account ID must be provided");
        return;
    }

    if (accountId < 1) {
        response.status(400).send("Account ID must be greater than 0");
        return;
    }

    if (!to_date) {
        response.status(400).send("To date must be provided");
        return;
    }

    // If to date isn't in the format YYYY-MM-DD, it will be rejected
    if (!to_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        response.status(400).send("To date must be in the format YYYY-MM-DD");
        return;
    }

    pool.query(loanQueries.getLoansByAccount, [accountId, to_date], (error, results) => {
        if (error) {
            throw error;
        }

        request.loans = results.rows;

        next();
    });
}

// Get all loans
const getLoans = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(loanQueries.getLoans, [account_id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(loanQueries.getLoan, [account_id, id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
}

// Create loan
const createLoan = (request, response) => {
    const { account_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;

    pool.query(loanQueries.createLoan, [account_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).json(results.rows);
    });
}

// Update loan
const updateLoan = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;

    pool.query(loanQueries.updateLoan, [account_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, id], (error, results) => {
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
    const accountId = parseInt(request.body.account_id);

    if (isNaN(accountId)) {
        return response.status(400).send(`Account ID must be a number`);
    }

    if (accountId < 0) {
        return response.status(400).send(`Account ID must be greater than 0`);
    }

    pool.query(currentBalanceQueries.getCurrentBalance, [accountId], (error, results) => {
        if (error) {
            throw error;
        }

        const currentBalance = parseFloat(results.rows[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    });
}

// Export all functions
module.exports = { getAccounts, createAccount, updateAccount, deleteAccount, getDepositsByAccount, getDeposits, createDeposit, updateDeposit, deleteDeposit, getWithdrawalsByAccount, getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal, getExpensesByAccount, getExpenses, createExpense, updateExpense, deleteExpense, getLoansByAccount, getLoans, createLoan, updateLoan, deleteLoan, getWishlistsByAccount, getWishlists, getWishlist, createWishlist, updateWishlist, deleteWishlist, getCurrentBalance };