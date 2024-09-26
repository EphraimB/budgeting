import { type Response } from 'express';
import { Timeslots } from '../../src/types/types.js';
import dayjs from 'dayjs';

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
 * @param data - Database array or object to convert to camel case (the JavaScript convention)
 * Returns the converted camel case (the JavaScript convention)
 */
export const toCamelCase = (
    data: { [key: string]: any } | { [key: string]: any }[],
): { [key: string]: any } | { [key: string]: any }[] => {
    if (Array.isArray(data)) {
        // If the input is an array, map through each element and convert to camelCase
        return data.map((row) => toCamelCase(row));
    }

    // If the input is an object, apply the camelCase conversion
    const newRow: { [key: string]: any } = {};
    for (const key in data) {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) =>
            g[1].toUpperCase(),
        );
        newRow[camelCaseKey] = data[key];
    }
    return newRow;
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
 * @param current - Current timeslots
 * @param incoming - Incoming timeslots
 * @returns Object containing timeslots to insert, delete, and update
 */
export const compareTimeslots = (
    current: Timeslots[],
    incoming: Timeslots[],
) => {
    let toInsert = [];
    let toDelete = [];
    let toUpdate = [];

    const currentMap = new Map();
    const incomingMap = new Map();

    // Create a map from the current timeslots
    for (let slot of current) {
        const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
        currentMap.set(key, slot);
    }

    // Create a map from the incoming timeslots
    for (let slot of incoming) {
        const key = `${slot.dayOfWeek}-${slot.startTime}-${slot.endTime}`;
        incomingMap.set(key, slot);
    }

    // Identify new and modified timeslots
    for (let [key, slot] of incomingMap) {
        if (!currentMap.has(key)) {
            toInsert.push(slot);
        } else {
            const currentSlot = currentMap.get(key);
            if (JSON.stringify(currentSlot) !== JSON.stringify(slot)) {
                toUpdate.push(slot);
            }
        }
    }

    // Identify deleted timeslots
    for (let key of currentMap.keys()) {
        if (!incomingMap.has(key)) {
            toDelete.push(currentMap.get(key));
        }
    }

    return {
        toInsert,
        toDelete,
        toUpdate,
    };
};

/**
 *
 * @param startTime - Start time of the schedule
 * @param rangeStart - Start time of the range
 * @param rangeEnd  - End time of the range
 * @returns - True if the start time is within the range, false otherwise
 */
export const isTimeWithinRange = (
    startTime: string,
    rangeStart: string,
    rangeEnd: string,
): boolean => {
    const baseDate = '1970-01-01 '; // Using a base date since we're only comparing times
    const startDateTime = dayjs(baseDate + startTime);
    const rangeStartDateTime = dayjs(baseDate + rangeStart);
    const rangeEndDateTime = dayjs(baseDate + rangeEnd);

    return (
        startDateTime >= rangeStartDateTime && startDateTime < rangeEndDateTime
    );
};
