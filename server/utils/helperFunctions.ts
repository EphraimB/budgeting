import { type Response } from 'express';
import pool from '../config/db.js';

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
