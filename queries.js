import pool from './db.js';
import { payrollQueries, wishlistQueries, transferQueries, cronJobQueries } from './queryData.js';
import scheduleCronJob from './jobs/scheduleCronJob.js';
import deleteCronJob from './jobs/deleteCronJob.js';
import getPayrollsForMonth from './getPayrolls.js';

const employeeParse = employee => ({
    employee_id: parseInt(employee.employee_id),
    name: employee.name,
    hourly_rate: parseFloat(employee.hourly_rate),
    regular_hours: parseInt(employee.regular_hours),
    vacation_days: parseInt(employee.vacation_days),
    sick_days: parseInt(employee.sick_days),
    work_schedule: employee.work_schedule,
});

// Get employee
export const getEmployee = (request, response) => {
    const { id } = request.query;
    const query = id ? payrollQueries.getEmployee : payrollQueries.getEmployees;
    const params = id ? [id] : [];

    pool.query(query, params, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting employee', param: null, location: 'query' } });
        }

        // Parse the data to the correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Create employee
export const createEmployee = (request, response) => {
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.createEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating employee", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(201).send(employees);
    });
};

// Update employee
export const updateEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);
    const { name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule } = request.body;

    pool.query(payrollQueries.updateEmployee, [name, hourly_rate, regular_hours, vacation_days, sick_days, work_schedule, employee_id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating employee", "param": null, "location": "query" } });
        }

        getPayrollsForMonth(employee_id);

        // Parse the data to correct format and return an object
        const employees = results.rows.map(employee => employeeParse(employee));

        response.status(200).send(employees);
    });
};

// Delete employee
export const deleteEmployee = (request, response) => {
    const employee_id = parseInt(request.params.employee_id);

    // Check if there are any associated payroll dates or payroll taxes
    pool.query(payrollQueries.getPayrollDates, [employee_id], (error, payrollDatesResults) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting payroll dates', param: null, location: 'query' } });
        }

        const hasPayrollDates = payrollDatesResults.rows.length > 0;

        pool.query(payrollQueries.getPayrollTaxes, [employee_id], (error, payrollTaxesResults) => {
            if (error) {
                return response.status(400).send({ errors: { msg: 'Error getting payroll taxes', param: null, location: 'query' } });
            }

            const hasPayrollTaxes = payrollTaxesResults.rows.length > 0;

            if (hasPayrollDates || hasPayrollTaxes) {
                return response.status(400).send({ errors: { msg: 'You need to delete employee-related data before deleting the employee', param: null, location: 'query' } });
            } else {
                pool.query(payrollQueries.deleteEmployee, [employee_id], (error, results) => {
                    if (error) {
                        return response.status(400).send({ errors: { msg: 'Error deleting employee', param: null, location: 'query' } });
                    }

                    getPayrollsForMonth(employee_id);

                    response.status(200).send('Successfully deleted employee');
                });
            }
        });
    });
};

const wishlistsParse = wishlist => ({
    wishlist_id: parseInt(wishlist.wishlist_id),
    wishlist_amount: parseFloat(wishlist.wishlist_amount),
    wishlist_title: wishlist.wishlist_title,
    wishlist_description: wishlist.wishlist_description,
    wishlist_url_link: wishlist.wishlist_url_link,
    wishlist_priority: parseInt(wishlist.wishlist_priority),
    wishlist_date_available: wishlist.wishlist_date_available,
    date_created: wishlist.date_created,
    date_updated: wishlist.date_updated,
});

// Get all wishlists
export const getWishlists = (request, response) => {
    const { id } = request.query;
    const query = id ? wishlistQueries.getWishlist : wishlistQueries.getWishlists;
    const queryArgs = id ? [id] : [];

    pool.query(query, queryArgs, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting wishlists', param: null, location: 'query' } });
        }

        // Parse the data to the correct format
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(200).send(wishlists);
    });
};

// Create wishlist
export const createWishlist = (request, response) => {
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.createWishlist, [account_id, amount, title, description, priority, url_link], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error creating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(201).send(wishlists);
    });
};

// Update wishlist
export const updateWishlist = (request, response) => {
    const id = parseInt(request.params.id);
    const { account_id, amount, title, description, priority, url_link } = request.body;

    pool.query(wishlistQueries.updateWishlist, [account_id, amount, title, description, priority, url_link, id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error updating wishlist", "param": null, "location": "query" } });
        }

        // Parse the data to correct format and return an object
        const wishlists = results.rows.map(wishlist => wishlistsParse(wishlist));

        response.status(200).send(wishlists);
    });
};

// Delete wishlist
export const deleteWishlist = (request, response) => {
    const id = parseInt(request.params.id);

    pool.query(wishlistQueries.deleteWishlist, [id], (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { "msg": "Error deleting wishlist", "param": null, "location": "query" } });
        }

        response.status(200).send("Successfully deleted wishlist item");
    });
};

const transfersParse = transfer => ({
    transfer_id: parseInt(transfer.transfer_id),
    source_account_id: parseInt(transfer.source_account_id),
    destination_account_id: parseInt(transfer.destination_account_id),
    transfer_amount: parseFloat(transfer.transfer_amount),
    transfer_title: transfer.transfer_title,
    transfer_description: transfer.transfer_description,
    frequency_type: parseInt(transfer.frequency_type),
    frequency_type_variable: parseInt(transfer.frequency_type_variable),
    frequency_day_of_month: parseInt(transfer.frequency_day_of_month),
    frequency_day_of_week: parseInt(transfer.frequency_day_of_week),
    frequency_week_of_month: parseInt(transfer.frequency_week_of_month),
    frequency_month_of_year: parseInt(transfer.frequency_month_of_year),
    transfer_begin_date: transfer.transfer_begin_date,
    transfer_end_date: transfer.transfer_end_date,
    date_created: transfer.date_created,
    date_updated: transfer.date_updated,
});

// Get transfers
export const getTransfers = (request, response) => {
    const { account_id, id } = request.query;
    const query = id ? transferQueries.getTransfer : transferQueries.getTransfers;
    const queryArgs = id ? [account_id, id] : [account_id];

    pool.query(query, queryArgs, (error, results) => {
        if (error) {
            return response.status(400).send({ errors: { msg: 'Error getting transfers', param: null, location: 'query' } });
        }

        // Parse the data to the correct format
        const transfers = results.rows.map(transfer => transfersParse(transfer));

        response.status(200).json(transfers);
    });
};

// Create transfer
export const createTransfer = (request, response) => {
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

            // Parse the data to correct format and return an object
            const transfers = results.rows.map(transfer => transfersParse(transfer));

            response.status(201).send(transfers);
        });
    });
};

// Update transfer
export const updateTransfer = async (request, response) => {
    const { id } = request.params;
    const {
        source_account_id,
        destination_account_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date
    } = request.body;

    const negativeAmount = -amount;

    try {
        // Check if the transfer exists
        const results = await pool.query(transferQueries.getTransfer, [source_account_id, id]);

        if (results.rows.length === 0) {
            return response.status(200).send([]);
        } else {
            const cronId = results.rows[0].cron_job_id;

            await deleteCronJob(cronId);

            const { uniqueId, cronDate } = scheduleCronJob(
                begin_date,
                source_account_id,
                negativeAmount,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                destination_account_id
            );

            await pool.query(cronJobQueries.updateCronJob, [uniqueId, cronDate, cronId]);

            const transferResults = await pool.query(transferQueries.updateTransfer, [
                source_account_id,
                destination_account_id,
                amount,
                title,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                begin_date,
                end_date,
                id
            ]);

            // Parse the data to correct format and return an object
            const transfers = transferResults.rows.map(transfer => transfersParse(transfer));

            response.status(200).send(transfers);
        }
    } catch (error) {
        response.status(400).send({ errors: { msg: 'Error updating transfer', param: null, location: 'query' } });
    }
};

// Delete transfer
export const deleteTransfer = async (request, response) => {
    const { account_id } = request.query;
    const { id } = request.params;

    try {
        const transferResults = await pool.query(transferQueries.getTransfer, [account_id, id]);

        if (transferResults.rows.length > 0) {
            const cronId = transferResults.rows[0].cron_job_id;

            await pool.query(transferQueries.deleteTransfer, [id]);

            if (cronId) {
                await deleteCronJob(cronId);
                await pool.query(cronJobQueries.deleteCronJob, [cronId]);
            }

            response.status(200).send("Transfer deleted successfully");
        } else {
            response.status(200).send("Transfer doesn't exist");
        }
    } catch (error) {
        response.status(400).send({ errors: { msg: "Error deleting transfer", param: null, location: "query" } });
    }
};