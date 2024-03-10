import { type Response } from 'express';
import pool from '../config/db.js';
import dayjs, { type Dayjs } from 'dayjs';
import { logger } from '../config/winston.js';

/**
 *
 * @param response - Response object
 * @param message - Error message
 * Sends a response with an error message
 */
export const handleError = (response: Response, message: string): void => {
    response.status(500).send(message);
};

/**
 *
 * @param query - SQL query
 * @param params - Query parameters
 * @returns - Query result
 */
export const executeQuery = async <T = any>(
    query: string,
    params: any[] = [],
): Promise<T[]> => {
    try {
        const { rows } = await pool.query(query, params);
        return rows;
    } catch (error) {
        throw new Error(error);
    }
};

/**
 *
 * @param name - Name of the cron job
 * @param cronSchedule - Cron schedule
 * @param query - SQL query
 * Schedules a cron job
 */
export const scheduleQuery = async (
    name: string,
    cronSchedule: string,
    query: string,
) => {
    const scheduleQueryText = `
      SELECT cron.schedule('${name}', $1, $2);
    `;
    try {
        const res = await pool.query(scheduleQueryText, [cronSchedule, query]);
        logger.info('Job scheduled:', res.rows[0]);
    } catch (err) {
        logger.error('Error scheduling job:', err);
    }
};

/**
 *
 * @param name - Name of the cron job
 * Unschedules a cron job
 */
export const unscheduleQuery = async (name: string) => {
    const unscheduleQueryText = `
      SELECT cron.unschedule('${name}');
    `;
    try {
        const res = await pool.query(unscheduleQueryText);
        logger.info('Job unscheduled:', res.rows[0]);
    } catch (err) {
        logger.error('Error unscheduling job:', err);
    }
};

/**
 *
 * @param input - The input to parse
 * @returns The parsed input or null if the input is not a integer
 */
export const parseIntOrFallback = (
    input: string | null | undefined,
): number | null => {
    if (input === null || input === undefined) return null;

    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? null : parsed;
};

/**
 *
 * @param input - The input to parse
 * @returns The parsed input or null if the input is not a float
 */
export const parseFloatOrFallback = (
    input: string | null | undefined,
): number | null => {
    if (input === null || input === undefined) return null;

    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? null : parsed;
};

/**
 *
 * @param transaction - Transaction object
 * @returns The next transaction frequency date
 */
export const nextTransactionFrequencyDate = (
    transaction: any,
): string | null => {
    let nextDate: string | null = null;

    if (dayjs(transaction.begin_date).isAfter()) {
        return transaction.begin_date;
    }

    // Find the next expense date based on the frequency values
    switch (transaction.frequency_type) {
        case 0: // Daily
            nextDate = dayjs(transaction.begin_date)
                .add(
                    transaction.frequency_type_variable !== null &&
                        transaction.frequency_type_variable !== undefined
                        ? transaction.frequency_type_variable
                        : 1,
                    'day',
                )
                .format();

            break;
        case 1: // Weekly
            const expenseDate: Dayjs = dayjs(transaction.begin_date);

            if (
                transaction.frequency_day_of_week !== null &&
                transaction.frequency_day_of_week !== undefined
            ) {
                const startDay: number = dayjs(transaction.begin_date).day();
                const frequency_day_of_week: number =
                    transaction.frequency_day_of_week;

                expenseDate.add(
                    (frequency_day_of_week + 7 - startDay) % 7,
                    'day',
                );
            }

            expenseDate.add(
                transaction.frequency_type_variable !== null &&
                    transaction.frequency_type_variable !== undefined
                    ? transaction.frequency_type_variable
                    : 1,
                'week',
            );

            nextDate = expenseDate.format();

            break;
        case 2: // Monthly
            let transactionDate: Dayjs = dayjs(transaction.begin_date).add(
                transaction.frequency_type_variable !== null &&
                    transaction.frequency_type_variable !== undefined
                    ? transaction.frequency_type_variable
                    : 1,
                'month',
            );

            if (
                transaction.frequency_day_of_week !== null &&
                transaction.frequency_day_of_week !== undefined
            ) {
                let newDay: number = transactionDate.date();

                if (
                    transaction.frequency_day_of_week !== null &&
                    transaction.frequency_day_of_week !== undefined
                ) {
                    let daysUntilNextFrequency =
                        (7 +
                            transaction.frequency_day_of_week -
                            transactionDate.day()) %
                        7;
                    daysUntilNextFrequency =
                        daysUntilNextFrequency === 0
                            ? 7
                            : daysUntilNextFrequency;
                    newDay = transactionDate.date() + daysUntilNextFrequency;
                }

                if (
                    transaction.frequency_week_of_month !== null &&
                    transaction.frequency_week_of_month !== undefined
                ) {
                    // first day of the month
                    transactionDate.date(1);
                    const daysToAdd: number =
                        (7 +
                            transaction.frequency_day_of_week -
                            transactionDate.day()) %
                        7;
                    // setting to the first occurrence of the desired day of week
                    transactionDate.add(daysToAdd, 'day');
                    // setting to the desired week of the month
                    newDay =
                        transactionDate.date() +
                        7 * transaction.frequency_week_of_month;
                }

                // Loop through the months until it's after the current date
                while (dayjs(transactionDate).isBefore()) {
                    transactionDate = transactionDate.add(1, 'month');
                }

                transactionDate.date(newDay);
            }

            nextDate = transactionDate.format();

            break;
        case 3: // Yearly
            const newDate: Dayjs = dayjs(transaction.begin_date).add(
                transaction.frequency_type_variable !== null &&
                    transaction.frequency_type_variable !== undefined
                    ? transaction.frequency_type_variable
                    : 1,
                'year',
            );

            if (
                transaction.frequency_month_of_year !== null &&
                transaction.frequency_month_of_year !== undefined
            ) {
                newDate.month(transaction.frequency_month_of_year);
            }

            if (
                transaction.frequency_day_of_week !== null &&
                transaction.frequency_day_of_week !== undefined
            ) {
                const daysToAdd: number =
                    (7 - newDate.day() + transaction.frequency_day_of_week) % 7;

                newDate.add(daysToAdd, 'day'); // this is the first occurrence of the day_of_week

                if (
                    transaction.frequency_week_of_month !== null &&
                    transaction.frequency_week_of_month !== undefined
                ) {
                    // add the number of weeks, but check if it overflows into the next month
                    const proposedDate: Dayjs = dayjs(newDate).add(
                        transaction.frequency_week_of_month,
                        'week',
                    );

                    if (proposedDate.diff(newDate, 'month') === 0) {
                        // it's in the same month, so it's a valid date
                        newDate.date(proposedDate.date());
                    }
                }
            }

            nextDate = newDate.format();

            break;
        default:
            nextDate = null;
    }

    return nextDate;
};
