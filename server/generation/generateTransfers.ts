import { type Transfer, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { type Dayjs } from 'dayjs';

type GenerateDateFunction = (currentDate: Dayjs, transfer: Transfer) => Dayjs;

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
const generateTransfers = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    transfer: Transfer,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
    generateDateFn: GenerateDateFunction,
): void => {
    let transferDate: Dayjs = dayjs(transfer.transfer_begin_date);

    if (
        transfer.frequency_month_of_year !== null &&
        transfer.frequency_month_of_year !== undefined
    ) {
        transferDate.month(transfer.frequency_month_of_year);
    }

    if (
        transfer.frequency_day_of_week !== null &&
        transfer.frequency_day_of_week !== undefined
    ) {
        let newDay: number = transferDate.date();

        if (
            transfer.frequency_day_of_week !== null &&
            transfer.frequency_day_of_week !== undefined
        ) {
            let daysUntilNextFrequency: number =
                (7 + transfer.frequency_day_of_week - transferDate.day()) % 7;
            daysUntilNextFrequency =
                daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = transferDate.date() + daysUntilNextFrequency;
        }

        if (
            transfer.frequency_week_of_month !== null &&
            transfer.frequency_week_of_month !== undefined
        ) {
            // first day of the month
            transferDate.date(1);
            const daysToAdd: number =
                (7 + transfer.frequency_day_of_week - transferDate.day()) % 7;
            // setting to the first occurrence of the desired day of week
            transferDate.add(daysToAdd, 'day');

            // setting to the desired week of the month
            newDay = transferDate.date() + 7 * transfer.frequency_week_of_month;
        }

        transferDate.date(newDay);
    }

    while (transferDate.diff(toDate) < 0) {
        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            transfer_id: transfer.transfer_id,
            title: transfer.transfer_title,
            description: transfer.transfer_description,
            date: dayjs(transferDate),
            amount:
                transfer.destination_account_id === account_id
                    ? +transfer.transfer_amount
                    : -transfer.transfer_amount,
            tax_rate: 0,
            total_amount:
                transfer.destination_account_id === account_id
                    ? +transfer.transfer_amount
                    : -transfer.transfer_amount,
        };

        if (transferDate.diff(dayjs()) < 0) {
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
export const generateDailyTransfers = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    transfer: Transfer,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
): void => {
    const generateDateFn = (currentDate: Dayjs, transfer: Transfer): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            transfer.frequency_type_variable !== null &&
                transfer.frequency_type_variable !== undefined
                ? transfer.frequency_type_variable
                : 1,
            'day',
        );

        return newDate;
    };

    generateTransfers(
        transactions,
        skippedTransactions,
        transfer,
        toDate,
        fromDate,
        account_id,
        generateDateFn,
    );
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
export const generateMonthlyTransfers = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    transfer: Transfer,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
): void => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, transfer: Transfer): Dayjs => {
        const transferDate: Dayjs = dayjs(transfer.transfer_begin_date).add(
            monthsIncremented +
                (transfer.frequency_type_variable !== null &&
                transfer.frequency_type_variable !== undefined
                    ? transfer.frequency_type_variable
                    : 1),
            'month',
        );

        if (
            transfer.frequency_day_of_week !== null &&
            transfer.frequency_day_of_week !== undefined
        ) {
            let newDay: number = transferDate.date();

            if (
                transfer.frequency_day_of_week !== null &&
                transfer.frequency_day_of_week !== undefined
            ) {
                let daysUntilNextFrequency: number =
                    (7 + transfer.frequency_day_of_week - transferDate.day()) %
                    7;
                daysUntilNextFrequency =
                    daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = transferDate.date() + daysUntilNextFrequency;
            }

            if (
                transfer.frequency_week_of_month !== null &&
                transfer.frequency_week_of_month !== undefined
            ) {
                // first day of the month
                transferDate.date(1);
                const daysToAdd: number =
                    (7 + transfer.frequency_day_of_week - transferDate.day()) %
                    7;
                // setting to the first occurrence of the desired day of week
                transferDate.add(daysToAdd, 'day');

                // setting to the desired week of the month
                newDay =
                    transferDate.date() + 7 * transfer.frequency_week_of_month;
            }

            transferDate.date(newDay);
        }

        monthsIncremented +=
            transfer.frequency_type_variable !== null &&
            transfer.frequency_type_variable !== undefined
                ? transfer.frequency_type_variable
                : 1;

        return transferDate;
    };

    generateTransfers(
        transactions,
        skippedTransactions,
        transfer,
        toDate,
        fromDate,
        account_id,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate transfers for
 * @param skippedTransactions - The transactions to skip
 * @param transfer - The transfer to generate
 * @param toDate - The date to generate transfers to
 * @param fromDate - The date to generate transfers from
 * @param account_id - The account id to generate transfers for
 * Generate weekly transfers for a given transfer
 */
export const generateWeeklyTransfers = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    transfer: Transfer,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
): void => {
    const transferDate: Dayjs = dayjs(transfer.transfer_begin_date);

    if (
        transfer.frequency_day_of_week !== null &&
        transfer.frequency_day_of_week !== undefined
    ) {
        const startDay: number = dayjs(transfer.transfer_begin_date).day();
        const frequency_day_of_week: number = transfer.frequency_day_of_week;

        transferDate.add((frequency_day_of_week + 7 - startDay) % 7, 'day');
    }

    const generateDateFn = (currentDate: Dayjs, transfer: Transfer): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            transfer.frequency_type_variable !== null &&
                transfer.frequency_type_variable !== undefined
                ? transfer.frequency_type_variable
                : 1,
            'week',
        );

        return newDate;
    };

    generateTransfers(
        transactions,
        skippedTransactions,
        transfer,
        toDate,
        fromDate,
        account_id,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate transfers for
 * @param skippedTransactions - The transactions to skip
 * @param transfer - The transfer to generate
 * @param toDate - The date to generate transfers to
 * @param fromDate - The date to generate transfers from
 * @param account_id - The account id to generate transfers for
 * Generate yearly transfers for a given transfer
 */
export const generateYearlyTransfers = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    transfer: Transfer,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
): void => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, transfer: Transfer): Dayjs => {
        const transferDate: Dayjs = dayjs(transfer.transfer_begin_date).add(
            yearsIncremented +
                (transfer.frequency_type_variable !== null &&
                transfer.frequency_type_variable !== undefined
                    ? transfer.frequency_type_variable
                    : 1),
            'year',
        );

        if (
            transfer.frequency_month_of_year !== null &&
            transfer.frequency_month_of_year !== undefined
        ) {
            transferDate.month(transfer.frequency_month_of_year);
        }

        if (
            transfer.frequency_day_of_week !== null &&
            transfer.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - transferDate.day() + transfer.frequency_day_of_week) % 7;
            transferDate.add(daysToAdd, 'day'); // this is the first occurrence of the day_of_week

            if (
                transfer.frequency_week_of_month !== null &&
                transfer.frequency_week_of_month !== undefined
            ) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate: Dayjs = dayjs(transferDate).add(
                    transfer.frequency_week_of_month,
                    'week',
                );

                if (proposedDate.diff(transferDate, 'month') === 0) {
                    // it's in the same month, so it's a valid date
                    transferDate.date(proposedDate.date());
                }
            }
        }

        yearsIncremented +=
            transfer.frequency_type_variable !== null &&
            transfer.frequency_type_variable !== undefined
                ? transfer.frequency_type_variable
                : 1;

        return transferDate;
    };

    generateTransfers(
        transactions,
        skippedTransactions,
        transfer,
        toDate,
        fromDate,
        account_id,
        generateDateFn,
    );
};
