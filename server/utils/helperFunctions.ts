import { type Response } from 'express';
import pool from '../config/db.js';
import dayjs, { type Dayjs } from 'dayjs';

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
 * @param data - Data to send to the cron job
 * @param method - HTTP method
 * @param unique_id - Unique ID of the cron job
 * @returns Array of success and response data
 */
export const manipulateCron = async (
    data: object | null,
    method: string,
    unique_id: string | null,
) => {
    const url: string = `http://cron:8080/api/cron${
        unique_id ? `/${unique_id}` : ''
    }`;

    // Construct headers conditionally
    let headers: HeadersInit = {};
    if (data) {
        headers = {
            'Content-Type': 'application/json',
        };
    }

    // Construct options with conditional body
    const options: RequestInit = {
        method,
        headers,
    };
    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const res = await fetch(url, options);

        // Ensure the response is OK and handle potential errors
        if (!res.ok) {
            return [false, `An error has occurred: ${res.status}`];
        }

        // Parse the JSON from the response
        const responseData = await res.json();
        return [true, responseData];
    } catch (error) {
        return [false, error.message];
    }
};

/**
 *
 * @param employee_id - Employee ID
 * @returns Array of success and response data
 */
export const executePayrollsScript = async (employee_id: number) => {
    const url: string = 'http://cron:8080/api/update-payrolls';

    // Construct headers conditionally
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    const body = JSON.stringify({ employee_id });

    // Construct options with conditional body
    const options: RequestInit = {
        method: 'POST',
        headers,
        body,
    };

    try {
        const res = await fetch(url, options);

        // Ensure the response is OK and handle potential errors
        if (!res.ok) {
            return [false, `An error has occurred: ${res.status}`];
        }

        // Parse the JSON from the response
        const responseData = await res.json();
        return [true, responseData];
    } catch (error) {
        return [false, error.message];
    }
};

/**
 *
 * @param transaction - Transaction object
 * @returns The next transaction frequency date
 */
export const nextTransactionFrequencyDate = (
    transaction: any,
): string | null => {
    const currentDate: Dayjs = dayjs(transaction.begin_date);
    let nextDate: Dayjs | null = null;

    // Find the next expense date based on the frequency values
    switch (transaction.frequency_type) {
        case 0: // Daily
            nextDate = currentDate.add(
                transaction.frequency_type_variable,
                'day',
            );
            break;
        case 1: // Weekly
            nextDate = currentDate.add(
                transaction.frequency_type_variable,
                'week',
            );

            if (transaction.frequency_day_of_week !== null) {
                nextDate = nextDate.day(transaction.frequency_day_of_week);
            }
            break;
        case 2: // Monthly
            if (transaction.frequency_day_of_month) {
                nextDate = currentDate.add(
                    transaction.frequency_type_variable,
                    'month',
                );

                nextDate = nextDate.date(transaction.frequency_day_of_month);
            } else {
                nextDate = currentDate.add(
                    transaction.frequency_type_variable,
                    'month',
                );
            }
            break;
        case 3: // Yearly
            if (transaction.frequency_month_of_year) {
                nextDate = currentDate.add(
                    transaction.frequency_type_variable,
                    'year',
                );
                nextDate = nextDate.month(
                    transaction.frequency_month_of_year - 1,
                ); // Months are 0-indexed in JavaScript
            } else {
                nextDate = currentDate.add(
                    transaction.frequency_type_variable,
                    'year',
                );
            }
            break;
        default:
            nextDate = null;
            break;
    }

    return nextDate?.format() ?? null;
};
