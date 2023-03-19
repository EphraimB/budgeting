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
            response.status(200).send(results.rows);
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
    const { account_id, from_date } = parseInt(request.query);

    pool.query(depositQueries.getDepositsDateFiltered, [account_id, from_date], (error, results) => {
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
    const { account_id, from_date } = parseInt(request.query);

    pool.query(withdrawalQueries.getWithdrawalsByAccount, [account_id, from_date], (error, results) => {
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
    const { account_id, to_date } = parseInt(request.query);

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
    const { account_id, to_date } = parseInt(request.query);

    pool.query(loanQueries.getLoansByAccount, [account_id, to_date], (error, results) => {
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
        response.status(200).send(results.rows);
    });
}

// Delete loan
const deleteLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.deleteLoan, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(204).send();
    });
}

// Get wishlists by account
const getWishlistsByAccount = (request, response, next) => {
    const { account_id } = parseInt(request.params);

    pool.query(wishlistQueries.getWishlistsByAccount, [account_id], (error, results) => {
        if (error) {
            throw error;
        }

        request.wishlists = results.rows;

        next();
    });
}

// Get all wishlists
const getWishlists = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(wishlistQueries.getWishlists, [account_id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(wishlistQueries.getWishlist, [account_id, id], (error, results) => {
            if (error) {
                throw error;
            }
            response.status(200).json(results.rows);
        });
    }
}

// Create wishlist
const createWishlist = (request, response) => {
    const { account_id, amount, title, description, priority } = request.body;

    pool.query(wishlistQueries.createWishlist, [account_id, amount, title, description, priority], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(201).send(results.rows);
    });
}

// Update wishlist
const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, priority } = request.body;

    pool.query(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(200).send(results.rows);
    });
}

// Delete wishlist
const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            throw error;
        }
        response.status(204).send();
    });
}

// Get current balance of account based on deposits and withdrawals
const getCurrentBalance = (request, response, next) => {
    const { account_id } = parseInt(request.body);

    pool.query(currentBalanceQueries.getCurrentBalance, [account_id], (error, results) => {
        if (error) {
            throw error;
        }

        const currentBalance = parseFloat(results.rows[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    });
}

// Export all functions
module.exports = { getAccounts, createAccount, updateAccount, deleteAccount, getDepositsByAccount, getDeposits, createDeposit, updateDeposit, deleteDeposit, getWithdrawalsByAccount, getWithdrawals, createWithdrawal, updateWithdrawal, deleteWithdrawal, getExpensesByAccount, getExpenses, createExpense, updateExpense, deleteExpense, getLoansByAccount, getLoans, createLoan, updateLoan, deleteLoan, getWishlistsByAccount, getWishlists, createWishlist, updateWishlist, deleteWishlist, getCurrentBalance };