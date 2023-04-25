const pool = require('./db');
const { accountQueries, depositQueries, withdrawalQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries } = require('./queryData');

// Get all accounts
const getAccounts = (request, response) => {
    const id = parseInt(request.query.id);

    if (!id) {
        pool.query(accountQueries.getAccounts, (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting accounts", "param": null, "location": "query" } });
            }
            return response.status(200).json(results.rows);
        });
    } else {
        pool.query(accountQueries.getAccount, [id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting account", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error creating account", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error updating account", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error deleting account", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get deposits by account
const getDepositsByAccount = (request, response, next) => {
    const { account_id, from_date } = request.query;

    pool.query(depositQueries.getDepositsDateFiltered, [parseInt(account_id), from_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting deposits", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error getting deposits", "param": null, "location": "query" } });
            }
            return response.status(200).json(results.rows);
        });
    } else {
        pool.query(depositQueries.getDeposit, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting deposit", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error creating deposit", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error updating deposit", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete deposit
const deleteDeposit = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(depositQueries.deleteDeposit, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting deposits", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get withdrawals by account
const getWithdrawalsByAccount = (request, response, next) => {
    const { account_id, from_date } = request.query;

    pool.query(withdrawalQueries.getWithdrawalsByAccount, [parseInt(account_id), from_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting withdrawals", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error getting withdrawals", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(withdrawalQueries.getWithdrawal, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting withdrawal", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error creating withdrawal", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error updating withdrawal", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete withdrawal
const deleteWithdrawal = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(withdrawalQueries.deleteWithdrawal, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting withdrawal", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get expenses by account
const getExpensesByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(expenseQueries.getExpensesByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error getting expenses", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(expenseQueries.getExpense, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting expense", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error creating expense", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error updating expense", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete expense
const deleteExpense = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(expenseQueries.deleteExpense, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting expense", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get loans by account
const getLoansByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(loanQueries.getLoansByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting loans", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error getting loans", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(loanQueries.getLoan, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting loan", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error creating loan", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error updating loan", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete loan
const deleteLoan = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(loanQueries.deleteLoan, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting loan", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get payrolls by account
const getPayrollsMiddleware = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(payrollQueries.getPayrollsMiddleware, [account_id, to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        request.payrolls = results.rows;

        next();
    });
}
// Get all payrolls
const getPayrolls = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);

    pool.query(payrollQueries.getPayrolls, [employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting payrolls", "param": null, "location": "query" } });
        }

        const returnObj = {
            employee_id,
            payrolls: results.rows,
        }
        response.status(200).json(returnObj);
    });
}

// Get payroll taxes
const getPayrollTaxes = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { id } = request.query;

    if (!id) {
        pool.query(payrollQueries.getPayrollTaxes, [employee_id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting payroll taxes", "param": null, "location": "query" } });
            }

            const returnObj = {
                employee_id,
                payroll_taxes: results.rows,
            }
            response.status(200).json(returnObj);
        });
    } else {
        pool.query(payrollQueries.getPayrollTax, [employee_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting payroll tax", "param": null, "location": "query" } });
            }

            const returnObj = {
                employee_id,
                payroll_tax: results.rows,
            }
            response.status(200).json(returnObj);
        });
    }
}

// Create payroll tax
const createPayrollTax = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { name, rate, applies_to } = request.body;

    pool.query(payrollQueries.createPayrollTax, [employee_id, name, rate, applies_to], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll tax", "param": null, "location": "query" } });
        }
        response.status(201).json(results.rows);
    });
}

// Get wishlists by account
const getWishlistsByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(wishlistQueries.getWishlistsByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting wishlists", "param": null, "location": "query" } });
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
                return response.status(400).send({ errors: { "msg": "Error getting wishlists", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(wishlistQueries.getWishlist, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting wishlist", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error creating wishlist", "param": null, "location": "query" } });
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
            return response.status(400).send({ errors: { "msg": "Error updating wishlist", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete wishlist
const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting wishlist", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get transfers by account
const getTransfersByAccount = (request, response, next) => {
    const { account_id, to_date } = request.query;

    pool.query(transferQueries.getTransfersByAccount, [parseInt(account_id), to_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transfers", "param": null, "location": "query" } });
        }

        request.transfers = results.rows;

        next();
    });
}

// Get transfers
const getTransfers = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(transferQueries.getTransfers, [account_id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transfers", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    } else {
        pool.query(transferQueries.getTransfer, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transfer", "param": null, "location": "query" } });
            }
            response.status(200).json(results.rows);
        });
    }
}

// Create transfer
const createTransfer = (request, response) => {
    const { source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    pool.query(transferQueries.createTransfer, [source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating transfer", "param": null, "location": "query" } });
        }
        response.status(201).send(results.rows);
    });
}

// Update transfer
const updateTransfer = (request, response) => {
    const id = parseInt(request.params.id);
    const { source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    pool.query(transferQueries.updateTransfer, [source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating transfer", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete transfer
const deleteTransfer = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(transferQueries.deleteTransfer, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting transfer", "param": null, "location": "query" } });
        }
        response.status(204).send();
    });
}

// Get current balance of account based on deposits and withdrawals
const getCurrentBalance = (request, response, next) => {
    const account_id = parseInt(request.query.account_id);

    pool.query(currentBalanceQueries.getCurrentBalance, [account_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting current balance", "param": null, "location": "query" } });
        }

        const currentBalance = parseFloat(results.rows[0].account_balance);

        request.currentBalance = currentBalance;

        next();
    });
}

// Export all functions
module.exports = {
    getAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    getDepositsByAccount,
    getDeposits,
    createDeposit,
    updateDeposit,
    deleteDeposit,
    getWithdrawalsByAccount,
    getWithdrawals,
    createWithdrawal,
    updateWithdrawal,
    deleteWithdrawal,
    getExpensesByAccount,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getLoansByAccount,
    getLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    getPayrollsMiddleware,
    getPayrolls,
    getPayrollTaxes,
    createPayrollTax,
    getWishlistsByAccount,
    getWishlists,
    createWishlist,
    updateWishlist,
    deleteWishlist,
    getTransfersByAccount,
    getTransfers,
    createTransfer,
    updateTransfer,
    deleteTransfer,
    getCurrentBalance
};