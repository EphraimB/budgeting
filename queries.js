const pool = require('./db');
const { accountQueries, transactionQueries, expenseQueries, loanQueries, payrollQueries, wishlistQueries, transferQueries, currentBalanceQueries, cronJobQueries } = require('./queryData');
const scheduleCronJob = require('./jobs/scheduleCronJob');
const deleteCronJob = require('./jobs/deleteCronJob');
const getPayrollsForMonth = require('./getPayrolls');

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
const getTransactionsByAccount = (request, response, next) => {
    const { account_id, from_date } = request.query;

    pool.query(transactionQueries.getTransactionsDateFiltered, [parseInt(account_id), from_date], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
        }

        request.transaction = results.rows;

        next();
    });
}

// Get all transactions
const getTransactions = (request, response) => {
    const { account_id } = request.params;
    const { id } = request.query;

    if (!id) {
        pool.query(transactionQueries.getTransactions, [account_id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transactions", "param": null, "location": "query" } });
            }
            return response.status(200).json(results.rows);
        });
    } else {
        pool.query(transactionQueries.getTransaction, [account_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting transaction", "param": null, "location": "query" } });
            }
            return response.status(200).json(results.rows);
        });
    }
}

// Create transaction
const createTransaction = (request, response) => {
    const { account_id, amount, description } = request.body;

    pool.query(transactionQueries.createTransaction, [account_id, amount, description], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating transaction", "param": null, "location": "query" } });
        }

        return response.status(201).json(results.rows);
    });
}

// Update transaction
const updateTransaction = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, description } = request.body;

    pool.query(transactionQueries.updateTransaction, [account_id, amount, description, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating transaction", "param": null, "location": "query" } });
        }
        response.status(200).send(results.rows);
    });
}

// Delete transaction
const deleteTransaction = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(transactionQueries.deleteTransaction, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting transaction", "param": null, "location": "query" } });
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
    const negativeAmount = -amount;

    const { cronDate, uniqueId } = scheduleCronJob(begin_date, account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year);

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
        const cronId = results.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        pool.query(expenseQueries.createExpense, [account_id, cronId, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating expense", "param": null, "location": "query" } });
            }
            response.status(201).json(results.rows);
        });
    });
}

// Update expense
const updateExpense = (request, response) => {
    const id = parseInt(request.query.id);
    const { account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;

    // Get expense id to see if it exists
    pool.query(expenseQueries.getExpense, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting expense", "param": null, "location": "query" } });
        }

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            deleteCronJob(cronId).then(() => {
                const { uniqueId, cronDate } = scheduleCronJob(begin_date, account_id, amount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year);

                pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { "msg": "Error updating cron job", "param": null, "location": "query" } });
                    }

                    pool.query(expenseQueries.updateExpense, [account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, id], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error updating expense", "param": null, "location": "query" } });
                        }
                        response.status(200).json(results.rows);
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        };
    });
}

// Delete expense
const deleteExpense = (request, response) => {
    const { account_id, id } = request.query;

    pool.query(expenseQueries.getExpense, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error selecting expense", "param": null, "location": "query" } });
        }

        if (results.rows.length > 0) {
            const cronId = results.rows[0].cron_job_id;

            pool.query(expenseQueries.deleteExpense, [id], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error deleting expense", "param": null, "location": "query" } });
                }

                if (cronId) {
                    deleteCronJob(cronId);

                    pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error deleting cron job", "param": null, "location": "query" } });
                        }
                    });
                }

                response.status(200).send("Expense deleted successfully");
            });
        } else {
            response.status(200).send("expense doesn't exist");
        }
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
    const negativeAmount = -plan_amount;

    const { cronDate, uniqueId } = scheduleCronJob(begin_date, account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year);

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
        const cronId = results.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        pool.query(loanQueries.createLoan, [account_id, cronId, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating loan", "param": null, "location": "query" } });
            }
            response.status(201).json(results.rows);
        });
    });
}

// Update loan
const updateLoan = (request, response) => {
    const { account_id, id } = request.query;
    const { amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date } = request.body;
    const negativeAmount = -plan_amount;

    // Get expense id to see if it exists
    pool.query(loanQueries.getLoan, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting loan", "param": null, "location": "query" } });
        }

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            deleteCronJob(cronId).then(() => {
                const { uniqueId, cronDate } = scheduleCronJob(begin_date, account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year);

                pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { "msg": "Error updating cron job", "param": null, "location": "query" } });
                    }

                    pool.query(loanQueries.updateLoan, [account_id, amount, plan_amount, recipient, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, id], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error updating loan", "param": null, "location": "query" } });
                        }
                        response.status(200).json(results.rows);
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        };
    });
}

// Delete loan
const deleteLoan = (request, response) => {
    const { account_id, id } = request.query;

    pool.query(loanQueries.getLoan, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error selecting loan", "param": null, "location": "query" } });
        }

        if (results.rows.length > 0) {
            const cronId = results.rows[0].cron_job_id;

            pool.query(loanQueries.deleteLoan, [id], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error deleting loan", "param": null, "location": "query" } });
                }

                if (cronId) {
                    deleteCronJob(cronId);

                    pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error deleting cron job", "param": null, "location": "query" } });
                        }
                    });
                }

                response.status(200).send("Loan deleted successfully");
            });
        } else {
            response.status(200).send("Loan doesn't exist");
        }
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
    const employee_id = parseInt(request.query.employee_id);

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
    const { employee_id, name, rate } = request.body;

    pool.query(payrollQueries.createPayrollTax, [employee_id, name, rate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(201).json(results.rows);
    });
}

// Update payroll tax
const updatePayrollTax = (request, response) => {
    const { employee_id, id } = request.query;
    const { name, rate } = request.body;

    pool.query(payrollQueries.updatePayrollTax, [name, rate, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send(results.rows);
    });
}

// Delete payroll tax
const deletePayrollTax = (request, response) => {
    const { employee_id, id } = request.query;

    pool.query(payrollQueries.deletePayrollTax, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll tax", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);
        
        response.status(204).send();
    });
}

// Get payroll dates
const getPayrollDates = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { id } = request.query;

    if (!id) {
        pool.query(payrollQueries.getPayrollDates, [employee_id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting payroll dates", "param": null, "location": "query" } });
            }

            const returnObj = {
                employee_id,
                payroll_dates: results.rows,
            }
            response.status(200).json(returnObj);
        });
    } else {
        pool.query(payrollQueries.getPayrollDate, [employee_id, id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting payroll date", "param": null, "location": "query" } });
            }

            const returnObj = {
                employee_id,
                payroll_date: results.rows,
            }
            response.status(200).json(returnObj);
        });
    }
}

// Create payroll date
const createPayrollDate = (request, response) => {
    const { employee_id, start_day, end_day } = request.body;

    pool.query(payrollQueries.createPayrollDate, [employee_id, start_day, end_day], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(201).json(results.rows);
    });
}

// Update payroll date
const updatePayrollDate = (request, response) => {
    const { employee_id, id } = request.query;
    const { start_day, end_day } = request.body;

    pool.query(payrollQueries.updatePayrollDate, [start_day, end_day, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send(results.rows);
    });
}

// Delete payroll date
const deletePayrollDate = (request, response) => {
    const { employee_id, id } = request.query;

    pool.query(payrollQueries.deletePayrollDate, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting payroll date", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(204).send();
    });
}

// Get employee
const getEmployee = (request, response) => {
    const { id } = request.query;

    if (!id) {
        pool.query(payrollQueries.getEmployees, (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting employee", "param": null, "location": "query" } });
            }

            response.status(200).json(results.rows);
        });
    } else {
        pool.query(payrollQueries.getEmployee, [id], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error getting employee", "param": null, "location": "query" } });
            }

            response.status(200).json(results.rows);
        });
    }
}

// Create employee
const createEmployee = (request, response) => {
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating employee", "param": null, "location": "query" } });
        }
        response.status(201).json(results.rows);
    });
}

// Update employee
const updateEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating employee", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        response.status(200).send(results.rows);
    });
}

// Delete employee
const deleteEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);

    pool.query(payrollQueries.deleteEmployee, [employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting employee", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);
        
        response.status(204).send();
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
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating wishlist", "param": null, "location": "query" } });
        }
        response.status(201).send(results.rows);
    });
}

// Update wishlist
const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id], (error, results) => {
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

    const negativeAmount = -amount;

    const { cronDate, uniqueId } = scheduleCronJob(begin_date, source_account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id);

    pool.query(cronJobQueries.createCronJob, [uniqueId, cronDate], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating cron job", "param": null, "location": "query" } });
        }
        const cronId = results.rows[0].cron_job_id;

        console.log('Cron job created ' + cronId)

        pool.query(transferQueries.createTransfer, [cronId, source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date], (error, results) => {
            if (error) {
                return response.status(400).send({ errors: { "msg": "Error creating transfer", "param": null, "location": "query" } });
            }
            response.status(201).send(results.rows);
        });
    });
}

// Update transfer
const updateTransfer = (request, response) => {
    const { source_account_id, id } = request.query;
    const { destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date } = request.body;

    const negativeAmount = -amount;

    // Get expense id to see if it exists
    pool.query(transferQueries.getTransfer, [source_account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error getting transfer", "param": null, "location": "query" } });
        }

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            deleteCronJob(cronId).then(() => {
                const { uniqueId, cronDate } = scheduleCronJob(begin_date, source_account_id, negativeAmount, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, destination_account_id);

                pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { "msg": "Error updating cron job", "param": null, "location": "query" } });
                    }

                    pool.query(transferQueries.updateTransfer, [source_account_id, destination_account_id, amount, title, description, frequency_type, frequency_type_variable, frequency_day_of_month, frequency_day_of_week, frequency_week_of_month, frequency_month_of_year, begin_date, end_date, id], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error updating transfer", "param": null, "location": "query" } });
                        }
                        response.status(200).send(results.rows);
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        };
    });
}

// Delete transfer
const deleteTransfer = (request, response) => {
    const { account_id, id } = request.query;

    pool.query(transferQueries.getTransfer, [account_id, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error selecting transfer", "param": null, "location": "query" } });
        }

        if (results.rows.length > 0) {
            const cronId = results.rows[0].cron_job_id;

            pool.query(transferQueries.deleteTransfer, [id], (error, results) => {
                if (error) {
                    return response.status(400).send({ errors: { "msg": "Error deleting transfer", "param": null, "location": "query" } });
                }

                if (cronId) {
                    deleteCronJob(cronId);

                    pool.query(cronJobQueries.deleteCronJob, [cronId], (error, results) => {
                        if (error) {
                            return response.status(400).send({ errors: { "msg": "Error deleting cron job", "param": null, "location": "query" } });
                        }
                    });
                }

                response.status(200).send("Transfer deleted successfully");
            });
        } else {
            response.status(200).send("Transfer doesn't exist");
        }
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
    getTransactionsByAccount,
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
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
    updatePayrollTax,
    deletePayrollTax,
    getPayrollDates,
    createPayrollDate,
    updatePayrollDate,
    deletePayrollDate,
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
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