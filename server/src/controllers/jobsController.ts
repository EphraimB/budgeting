import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { JobSchedule } from '../types/types.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve all jobs
 */
export const getJobs = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT
                    j.id,
                    j.account_id,
                    j.name,
                    j.hourly_rate,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'dayOfWeek', js.day_of_week,
                            'startTime', js.start_time,
                            'endTime', js.end_time
                        ) ORDER BY js.day_of_week
                    ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
                FROM
                    jobs j
                LEFT JOIN
                    job_schedule js ON j.id = js.job_id
                WHERE
                    j.account_id = $1
                GROUP BY
                    j.id;
            `;
            params = [accountId];
        } else {
            query = `
                SELECT
                    j.id,
                    j.account_id,
                    j.name,
                    j.hourly_rate,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'dayOfWeek', js.day_of_week,
                            'startTime', js.start_time,
                            'endTime', js.end_time
                        ) ORDER BY js.day_of_week
                    ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
                FROM
                    jobs j
                LEFT JOIN
                    job_schedule js ON j.id = js.job_id
                GROUP BY
                    j.id;
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error getting jobs');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a GET request to the database to retrieve a single job
 */
export const getJobsById = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id } = request.params;
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        let query: string;
        let params: any[];

        if (accountId) {
            query = `
                SELECT
                    j.id,
                    j.account_id,
                    j.name,
                    j.hourly_rate,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'dayOfWeek', js.day_of_week,
                            'startTime', js.start_time,
                            'endTime', js.end_time
                        ) ORDER BY js.day_of_week
                    ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
                FROM
                    jobs j
                LEFT JOIN
                    job_schedule js ON j.id = js.job_id
                WHERE
                    j.id = $1
                    AND j.account_id = $2
                GROUP BY
                    j.id;
            `;
            params = [id, accountId];
        } else {
            query = `
                SELECT
                    j.id,
                    j.account_id,
                    j.name,
                    j.hourly_rate,
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'dayOfWeek', js.day_of_week,
                            'startTime', js.start_time,
                            'endTime', js.end_time
                        ) ORDER BY js.day_of_week
                    ) FILTER (WHERE js.job_id IS NOT NULL), '[]') AS job_schedule
                FROM
                    jobs j
                LEFT JOIN
                    job_schedule js ON j.id = js.job_id
                WHERE
                    j.id = $1
                GROUP BY
                    j.id;
            `;
            params = [id];
        }

        const { rows } = await client.query(query, params);

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        const retreivedRow = toCamelCase(rows[0]); // Convert to camelCase

        response.status(200).json(retreivedRow);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, `Error getting jobs for id of ${id}`);
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a POST request to the database to create a new job
 */
export const createJob = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { accountId, name, hourlyRate, jobSchedule } = request.body;

        await client.query('BEGIN;');

        // First, create the job and get its ID
        const { rows } = await client.query(
            `
                INSERT INTO jobs
                (account_id, name, hourly_rate)
                VALUES ($1, $2, $3)
                RETURNING *
            `,
            [accountId, name, hourlyRate],
        );
        const jobId = rows[0].id;

        // Then, create schedules for this job
        const schedulePromises = jobSchedule.map(
            async (js: JobSchedule) =>
                await client.query(
                    `
                        INSERT INTO job_schedule
                        (job_id, day_of_week, start_time, end_time)
                        VALUES ($1, $2, $3, $4)
                        RETURNING *
                    `,
                    [jobId, js.dayOfWeek, js.startTime, js.endTime],
                ),
        );

        // Wait for all schedule creation promises to resolve
        await Promise.all(schedulePromises);

        // Create the response object
        const responseObject = {
            id: jobId,
            accountId,
            name,
            hourlyRate,
            jobSchedule: jobSchedule.map((schedule: JobSchedule) => ({
                ...schedule,
            })),
        };

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        const insertedRow = toCamelCase(responseObject); // Convert to camelCase

        response.status(201).json(insertedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a PUT request to the database to update an job
 */
export const updateJob = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { id } = request.params;
        const { accountId, name, hourlyRate, jobSchedule } = request.body;

        const { rows } = await client.query(
            `
            SELECT id
                FROM jobs
                WHERE id = $1;
        `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        const { rows: updateJobsResult } = await client.query(
            `
            UPDATE jobs
                SET account_id = $1,
                name = $2,
                hourly_rate = $3
                WHERE id = $4
                RETURNING *
        `,
            [accountId, name, hourlyRate, id],
        );

        // Fetch existing schedules for the job
        const { rows: existingSchedules } = await client.query(
            `
            SELECT *
                FROM job_schedule
                WHERE job_id = $1
        `,
            [id],
        );

        // Create a Map to store existing schedules
        const existingSchedulesMap = new Map();
        existingSchedules.forEach((s) => {
            const key = `${s.day_of_week}_${s.start_time}_${s.end_time}`;
            existingSchedulesMap.set(key, s);
        });

        // Set to track IDs of schedules that are still present
        const updatedOrAddedScheduleIds = new Set();

        for (const js of jobSchedule) {
            const key = `${js.dayOfWeek}_${js.startTime}_${js.endTime}`;
            const existingSchedule = existingSchedulesMap.get(key);

            if (existingSchedule) {
                // Update the existing schedule
                await client.query(
                    `
                UPDATE job_schedule
                    SET day_of_week = $1,
                    start_time = $2,
                    end_time = $3
                    WHERE id = $4
                    RETURNING *
            `,
                    [
                        js.dayOfWeek,
                        js.startTime,
                        js.endTime,
                        existingSchedule.id,
                    ],
                );
                updatedOrAddedScheduleIds.add(existingSchedule.id);
                existingSchedulesMap.delete(key); // Remove from the Map
            } else {
                // Insert a new schedule
                const { rows: result } = await client.query(
                    `
                INSERT INTO job_schedule
                    (job_id, day_of_week, start_time, end_time)
                    VALUES ($1, $2, $3, $4)
                    RETURNING *
            `,
                    [id, js.dayOfWeek, js.startTime, js.endTime],
                );

                // Assuming the result includes the ID of the inserted schedule
                updatedOrAddedScheduleIds.add(result[0].id);
            }
        }

        // Delete schedules that were not in the updatedOrAddedScheduleIds set
        for (const schedule of existingSchedulesMap.values()) {
            await client.query(
                `
              DELETE FROM job_schedule
                  WHERE id = $1
          `,
                [schedule.id],
            );
        }

        await client.query('SELECT process_payroll_for_job($1)', [id]);

        await client.query('COMMIT;');

        const updatedRow = toCamelCase(updateJobsResult[0]); // Convert to camelCase

        response.status(200).json(updatedRow);
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a DELETE request to the database to delete an job
 */
export const deleteJob = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { id } = request.params;

        const { rows } = await client.query(
            `
                SELECT id
                    FROM jobs
                    WHERE id = $1;
            `,
            [id],
        );

        if (rows.length === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                DELETE FROM jobs
                    WHERE id = $1
            `,
            [id],
        );

        await client.query('SELECT process_payroll_for_job($1)', [id]);

        await client.query('COMMIT;');

        response.status(200).send(`Successfully deleted job for id of ${id}`);
    } catch (error) {
        await client.query('ROLLBACK');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting job');
    }
};
