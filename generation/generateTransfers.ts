import { Transfer } from "../types/types";

type GenerateDateFunction = (currentDate: Date, transfer: Transfer) => Date;

/**
 * 
 * @param transactions - The transactions to generate transfers for
 * @param skippedTransactions - The transactions to skip
 * @param transfer - The transfer to generate
 * @param toDate - The date to generate transfers to
 * @param fromDate - The date to generate transfers from
 * @param account_id - The account id to generate transfers for
 * @param generateDateFn - The function to generate the next date
 * Generate transfers for a given transfer
 */
const generateTransfers = (transactions: any[], skippedTransactions: any[], transfer: Transfer, toDate: Date, fromDate: Date, account_id: number, generateDateFn: GenerateDateFunction): void => {
    let transferDate: Date = new Date(transfer.transfer_begin_date);

    if (transfer.frequency_month_of_year !== null && transfer.frequency_month_of_year !== undefined) {
        transferDate.setMonth(transfer.frequency_month_of_year);
    }

    if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
        let newDay: number;

        if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
            let daysUntilNextFrequency: number = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
            daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = transferDate.getDate() + daysUntilNextFrequency;
        }

        if (transfer.frequency_week_of_month !== null && transfer.frequency_week_of_month !== undefined) {
            // first day of the month
            transferDate.setDate(1);
            const daysToAdd: number = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            transferDate.setDate(transferDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = transferDate.getDate() + 7 * (transfer.frequency_week_of_month);
        }

        transferDate.setDate(newDay);
    }

    while (transferDate <= toDate) {
        const newTransaction = {
            transfer_id: transfer.transfer_id,
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: new Date(transferDate),
            amount: transfer.destination_account_id === account_id ? +transfer.transfer_amount : -transfer.transfer_amount
        };

        if (transferDate > new Date()) {
            if (fromDate > transferDate) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }
        }

        transferDate = generateDateFn(transferDate, transfer);
    }
};

/**
 * 
 * @param transactions - The transactions to generate transfers for
 * @param skippedTransactions - The transactions to skip
 * @param transfer - The transfer to generate
 * @param toDate - The date to generate transfers to
 * @param fromDate - The date to generate transfers from
 * @param account_id - The account id to generate transfers for
 * Generate daily transfers for a given transfer
 */
export const generateDailyTransfers = (transactions: any[], skippedTransactions: any[], transfer: Transfer, toDate: Date, fromDate: Date, account_id: number): void => {
    const generateDateFn = (currentDate: Date, transfer: Transfer): Date => {
        const newDate: Date = currentDate;
        newDate.setDate(newDate.getDate() + (transfer.frequency_type_variable || 1));
        return newDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

/**
 * 
 * @param transactions - The transactions to generate transfers for
 * @param skippedTransactions - The transactions to skip
 * @param transfer - The transfer to generate
 * @param toDate - The date to generate transfers to
 * @param fromDate - The date to generate transfers from
 * @param account_id - The account id to generate transfers for
 * Generate monthly transfers for a given transfer
 */
export const generateMonthlyTransfers = (transactions: any[], skippedTransactions: any[], transfer: Transfer, toDate: Date, fromDate: Date, account_id: number): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, transfer: Transfer): Date => {
        const transferDate: Date = new Date(transfer.transfer_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        transferDate.setMonth(transferDate.getMonth() + monthsIncremented + (transfer.frequency_type_variable || 1));

        if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
            let newDay: number;

            if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
                let daysUntilNextFrequency: number = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
                daysUntilNextFrequency = daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = transferDate.getDate() + daysUntilNextFrequency;
            }

            if (transfer.frequency_week_of_month !== null && transfer.frequency_week_of_month !== undefined) {
                // first day of the month
                transferDate.setDate(1);
                const daysToAdd: number = (7 + transfer.frequency_day_of_week - transferDate.getDay()) % 7;
                // setting to the first occurrence of the desired day of week
                transferDate.setDate(transferDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay = transferDate.getDate() + 7 * (transfer.frequency_week_of_month);
            }

            transferDate.setDate(newDay);
        }

        monthsIncremented += (transfer.frequency_type_variable || 1);

        return transferDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateWeeklyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    const transferDate = new Date(transfer.transfer_begin_date);

    if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
        const startDay = new Date(transfer.transfer_begin_date).getDay();
        const frequency_day_of_week = transfer.frequency_day_of_week;

        transferDate.setDate(transferDate.getDate() + (frequency_day_of_week + 7 - startDay) % 7);
    }

    const generateDateFn = (currentDate, transfer) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 7 * (transfer.frequency_type_variable || 1));
        return newDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};

export const generateYearlyTransfers = (transactions, skippedTransactions, transfer, toDate, fromDate, account_id) => {
    let yearsIncremented = 0;
    const generateDateFn = (currentDate, transfer) => {
        const transferDate = new Date(transfer.transfer_begin_date);

        transferDate.setFullYear(transferDate.getFullYear() + yearsIncremented + (transfer.frequency_type_variable || 1));

        if (transfer.frequency_month_of_year !== null && transfer.frequency_month_of_year !== undefined) {
            transferDate.setMonth(transfer.frequency_month_of_year);
        }

        if (transfer.frequency_day_of_week !== null && transfer.frequency_day_of_week !== undefined) {
            const daysToAdd = (7 - transferDate.getDay() + transfer.frequency_day_of_week) % 7;
            transferDate.setDate(transferDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (transfer.frequency_week_of_month !== null && transfer.frequency_week_of_month !== undefined) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate = new Date(transferDate.getTime());
                proposedDate.setDate(proposedDate.getDate() + 7 * (transfer.frequency_week_of_month));

                if (proposedDate.getMonth() === transferDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    transferDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }

        yearsIncremented += (transfer.frequency_type_variable || 1);

        return transferDate;
    };

    generateTransfers(transactions, skippedTransactions, transfer, toDate, fromDate, account_id, generateDateFn);
};
