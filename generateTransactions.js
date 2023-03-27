const fs = require('fs');
const path = require('path');

function generateTransactions(request, response, next) {
    const generateDailyLoans = require('./generateLoans/generateDailyLoans.js');
    const generateWeeklyLoans = require('./generateLoans/generateWeeklyLoans.js');
    const generateMonthlyLoans = require('./generateLoans/generateMonthlyLoans.js');
    const generateYearlyLoans = require('./generateLoans/generateYearlyLoans.js');
    const generateDailyTransfers = require('./generateTransfers/generateDailyTransfers.js');
    const generateWeeklyTransfers = require('./generateTransfers/generateWeeklyTransfers.js');
    const generateMonthlyTransfers = require('./generateTransfers/generateMonthlyTransfers.js');
    const generateYearlyTransfers = require('./generateTransfers/generateYearlyTransfers.js');
    const calculateBalances = require('./calculateBalances.js');
    const toDate = new Date(request.query.to_date);
    const currentBalance = request.currentBalance;
    const account_id = parseInt(request.query.account_id);
    const transactions = [];

    transactions.push(
        ...request.deposits.map(deposit => ({
            deposit_id: deposit.deposit_id,
            date: deposit.date_created,
            date_modified: deposit.date_modified,
            title: deposit.deposit_title,
            description: deposit.deposit_description,
            amount: parseFloat(deposit.deposit_amount)
        })),
        ...request.withdrawals.map(withdrawal => ({
            withdrawal_id: withdrawal.withdrawal_id,
            date: withdrawal.date_created,
            date_modified: withdrawal.date_modified,
            title: withdrawal.withdrawal_title,
            description: withdrawal.withdrawal_description,
            amount: parseFloat(-withdrawal.withdrawal_amount)
        }))
    );

    const pluginsDir = './plugins';

    // Read the plugin directories and mount the routes for each plugin
    fs.readdirSync(pluginsDir).forEach(plugin => {
        const pluginDir = path.join(__dirname, pluginsDir, plugin);

        if (fs.existsSync(pluginDir)) {
            const generateDir = `${pluginDir}/generate`;

            fs.readdir(generateDir, (err, files) => {
                if (err) {
                    console.error(err);
                    return;
                }
            });

            if (fs.existsSync(`${generateDir}`)) {
                const generateDaily = require(`${generateDir}/generateDaily.js`);
                const generateWeekly = require(`${generateDir}/generateWeekly.js`);
                const generateMonthly = require(`${generateDir}/generateMonthly.js`);
                const generateYearly = require(`${generateDir}/generateYearly.js`);

                const pluginName = plugin.replace('-plugin', '');

                request[pluginName].forEach(pluginItem => {
                    if (pluginItem.plugin_name === pluginName) {
                        if (pluginItem.frequency_type === 0) {
                            generateDaily(transactions, pluginItem, toDate);
                        } else if (pluginItem.frequency_type === 1) {
                            generateWeekly(transactions, pluginItem, toDate);
                        } else if (pluginItem.frequency_type === 2) {
                            generateMonthly(transactions, pluginItem, toDate);
                        } else if (pluginItem.frequency_type === 3) {
                            generateYearly(transactions, pluginItem, toDate);
                        }
                    }
                });
            };
        };
    });


    request.loans.forEach(loan => {
        if (loan.frequency_type === 0) {
            generateDailyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 1) {
            generateWeeklyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 2) {
            generateMonthlyLoans(transactions, loan, toDate)
        } else if (loan.frequency_type === 3) {
            generateYearlyLoans(transactions, loan, toDate)
        }
    });

    request.transfers.forEach(transfer => {
        if (transfer.frequency_type === 0) {
            generateDailyTransfers(transactions, transfer, toDate, account_id)
        } else if (transfer.frequency_type === 1) {
            generateWeeklyTransfers(transactions, transfer, toDate, account_id)
        } else if (transfer.frequency_type === 2) {
            generateMonthlyTransfers(transactions, transfer, toDate, account_id)
        } else if (transfer.frequency_type === 3) {
            generateYearlyTransfers(transactions, transfer, toDate, account_id)
        }
    });

    transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    calculateBalances(transactions, currentBalance);

    request.transactions = transactions;
    request.currentBalance = currentBalance;

    next();
};

module.exports = generateTransactions;