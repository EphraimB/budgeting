import { type NextFunction, type Request, type Response } from 'express';
import { handleError } from '../utils/helperFunctions.js';
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
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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

        response.status(200).json(rows);
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
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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

        response.status(200).json(rows);
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
        const {
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            jobSchedule,
        } = request.body;

        await client.query('BEGIN;');

        // First, create the job and get its ID
        const { rows } = await client.query(
            `
                INSERT INTO jobs
                (account_id, name, hourly_rate, vacation_days, sick_days)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `,
            [accountId, name, hourlyRate, vacationDays, sickDays],
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
            vacationDays,
            sickDays,
            job_schedule: jobSchedule.map((schedule: JobSchedule) => ({
                ...schedule,
            })),
        };

        await client.query('SELECT process_payroll_for_job($1)', [jobId]);

        await client.query('COMMIT;');

        response.status(201).json(responseObject);
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
 * @param next - Next function
 * Sends a PUT request to the database to update an job
 */
export const updateJob = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const client = await pool.connect(); // Get a client from the pool

    try {
        const { id } = request.params;
        const {
            accountId,
            name,
            hourlyRate,
            vacationDays,
            sickDays,
            jobSchedule,
        } = request.body;

        const { rows } = await client.query(
            `
                SELECT COUNT(id)
                    FROM jobs
                    WHERE id = $1;
            `,
            [id],
        );

        if (rows[0].id === 0) {
            response.status(404).send('Job not found');
            return;
        }

        await client.query('BEGIN;');

        await client.query(
            `
                UPDATE jobs
                    SET account_id = $1,
                    name = $2,
                    hourly_rate = $3,
                    vacation_days = $4,
                    sick_days = $5
                    WHERE id = $6
                    RETURNING *
            `,
            [accountId, name, hourlyRate, vacationDays, sickDays, id],
        );

        // Fetch existing schedules for the job
        const { rows: existingSchedules } = await client.query(
            `
                SELECT
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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
            `,
            [id],
        );

        // Set to track IDs of schedules that are still present
        const updatedOrAddedScheduleIds = new Set();

        for (const js of jobSchedule) {
            const existingSchedule = existingSchedules.find(
                (s) =>
                    s.day_of_week === js.dayOfWeek &&
                    s.start_time === js.startTime &&
                    s.end_time === js.endTime,
            );

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
        const schedulesToDelete = existingSchedules.filter(
            (s) => !updatedOrAddedScheduleIds.has(s.id),
        );

        for (const schedule of schedulesToDelete) {
            await client.query(
                `
                    DELETE FROM job_schedule
                        WHERE id = $1
                `,
                [schedule.job_schedule_id],
            );
        }

        await client.query('SELECT process_payroll_for_job($1)', [id]);

        await client.query('COMMIT;');

        request.jobId = +id;

        next();
    } catch (error) {
        await client.query('ROLLBACK;');

        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating job');
    } finally {
        client.release(); // Release the client back to the pool
    }
};

export const updateJobReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { jobId } = request;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const { rows } = await client.query(
            `
                SELECT
                    j.id AS "job_id",
                    j.account_id AS "account_id",
                    j.name AS "job_name",
                    j.hourly_rate AS "hourly_rate",
                    j.vacation_days AS "vacation_days",
                    j.sick_days AS "sick_days",
                    COALESCE(SUM(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600), 0) AS total_hours_per_week,
                    COALESCE(json_agg(
                        json_build_object(
                            'day_of_week', js.day_of_week,
                            'start_time', js.start_time,
                            'end_time', js.end_time
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
            `,
            [jobId],
        );

        await client.query('COMMIT;');

        response.status(200).json(rows);
    } catch (error) {
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
                SELECT COUNT(id)
                    FROM jobs
                    WHERE id = $1;
            `,
            [id],
        );

        if (rows[0].id === 0) {
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
