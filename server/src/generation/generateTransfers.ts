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
    transfer: any,
    toDate: Dayjs,
    fromDate: Dayjs,
    account_id: number,
    generateDateFn: GenerateDateFunction,
): void => {
    let transferDate: Dayjs = dayjs(transfer.transfer_begin_date);

    if (transfer.frequency_month_of_year)
        transferDate = transferDate.month(transfer.frequency_month_of_year);

    // Adjust for the day of the week
    if (transfer.frequency_day_of_week) {
        transferDate = transferDate.startOf('month');
        let firstOccurrence = transferDate.day(transfer.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(transferDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        // Adjust for the specific week of the month
        if (transfer.frequency_week_of_month) {
            transferDate = firstOccurrence.add(
                transfer.frequency_week_of_month,
                'week',
            );
        } else {
            transferDate = firstOccurrence;
        }
    }

    while (transferDate.diff(toDate) <= 0) {
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

        if (transferDate.diff() > 0) {
            if (transferDate.diff(fromDate) < 0) {
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
            transfer.frequency_type_variable
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
        let transferDate: Dayjs = dayjs(transfer.transfer_begin_date).add(
            monthsIncremented +
                (transfer.frequency_type_variable
                    ? transfer.frequency_type_variable
                    : 1),
            'month',
        );

        // Adjust for the day of the week
        if (transfer.frequency_day_of_week) {
            transferDate = transferDate.startOf('month');
            let firstOccurrence = transferDate.day(
                transfer.frequency_day_of_week,
            );

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(transferDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (transfer.frequency_week_of_month) {
                transferDate = firstOccurrence.add(
                    transfer.frequency_week_of_month,
                    'week',
                );
            } else {
                transferDate = firstOccurrence;
            }
        }

        monthsIncremented += transfer.frequency_type_variable
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
    let transferDate: Dayjs = dayjs(transfer.transfer_begin_date);

    // Adjust for the day of the week
    if (transfer.frequency_day_of_week) {
        transferDate = transferDate.startOf('month');
        let firstOccurrence = transferDate.day(transfer.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(transferDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        transferDate = firstOccurrence;
    }

    const generateDateFn = (currentDate: Dayjs, transfer: Transfer): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            transfer.frequency_type_variable
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
        let transferDate: Dayjs = dayjs(transfer.transfer_begin_date).add(
            yearsIncremented +
                (transfer.frequency_type_variable
                    ? transfer.frequency_type_variable
                    : 1),
            'year',
        );

        if (transfer.frequency_month_of_year)
            transferDate = transferDate.month(transfer.frequency_month_of_year);

        // Adjust for the day of the week
        if (transfer.frequency_day_of_week) {
            transferDate = transferDate.startOf('month');
            let firstOccurrence = transferDate.day(
                transfer.frequency_day_of_week,
            );

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(transferDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (transfer.frequency_week_of_month) {
                transferDate = firstOccurrence.add(
                    transfer.frequency_week_of_month,
                    'week',
                );
            } else {
                transferDate = firstOccurrence;
            }
        }

        yearsIncremented += transfer.frequency_type_variable
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
