import { type Request, type Response } from 'express';
import { handleError, toCamelCase } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

export const getCommuteOverview = async (
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
            WITH timed_passes AS (
                SELECT 
                    fd.account_id,
                    csy.name AS system_name,
                    fd.fare,
                    fd.duration::INTEGER,
                    NULL::JSON AS fare_cap_progress
                FROM commute_schedule cs
                JOIN fare_details fd ON cs.fare_detail_id = fd.id
                JOIN commute_systems csy ON fd.commute_system_id = csy.id
                WHERE fd.duration IS NOT NULL
                ),
                regular_passes AS (
                SELECT 
                    fd.account_id,
                    csy.name AS system_name,
                    fd.fare,
                    NULL::INTEGER AS duration,
                    JSON_BUILD_OBJECT(
                    'currentSpent', (
                        SELECT COALESCE(SUM(ch.fare), 0)
                        FROM commute_history ch
                        WHERE ch.account_id = fd.account_id
                        AND (
                        (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                        (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                        (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                        )
                    ),
                    'fareCap', csy.fare_cap,
                    'fareCapDuration', csy.fare_cap_duration
                    ) AS fare_cap_progress
                FROM commute_schedule cs
                JOIN fare_details fd ON cs.fare_detail_id = fd.id
                JOIN commute_systems csy ON fd.commute_system_id = csy.id
                WHERE fd.duration IS NULL
                )
                SELECT 
                account_id,
                JSON_AGG(json_data::json) AS systems
                FROM (
                SELECT DISTINCT 
                    account_id,
                    JSON_BUILD_OBJECT(
                    'systemName', system_name,
                    'fare', fare,
                    'duration', duration,
                    'fareCapProgress', fare_cap_progress
                    )::text AS json_data
                FROM (
                    SELECT * FROM timed_passes
                    UNION ALL
                    SELECT rp.*
                    FROM regular_passes rp
                    WHERE NOT EXISTS (
                    SELECT 1
                    FROM timed_passes tp
                    WHERE tp.system_name = rp.system_name AND tp.account_id = rp.account_id
                    )
                ) AS combined_passes
                ) AS distinct_json
                WHERE account_id = $1
                GROUP BY account_id;
        `;

            params = [accountId];
        } else {
            query = `
                WITH timed_passes AS (
                    SELECT 
                        fd.account_id,
                        csy.name AS system_name,
                        fd.fare,
                        fd.duration::INTEGER,
                        NULL::JSON AS fare_cap_progress
                    FROM commute_schedule cs
                    JOIN fare_details fd ON cs.fare_detail_id = fd.id
                    JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    WHERE fd.duration IS NOT NULL
                    ),
                    regular_passes AS (
                    SELECT 
                        fd.account_id,
                        csy.name AS system_name,
                        fd.fare,
                        NULL::INTEGER AS duration,
                        JSON_BUILD_OBJECT(
                        'currentSpent', (
                            SELECT COALESCE(SUM(ch.fare), 0)
                            FROM commute_history ch
                            WHERE ch.account_id = fd.account_id
                            AND (
                            (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                            (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                            (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                            )
                        ),
                        'fareCap', csy.fare_cap,
                        'fareCapDuration', csy.fare_cap_duration
                        ) AS fare_cap_progress
                    FROM commute_schedule cs
                    JOIN fare_details fd ON cs.fare_detail_id = fd.id
                    JOIN commute_systems csy ON fd.commute_system_id = csy.id
                    WHERE fd.duration IS NULL
                    )
                    SELECT 
                    account_id,
                    JSON_AGG(json_data::json) AS systems
                    FROM (
                    SELECT DISTINCT 
                        account_id,
                        JSON_BUILD_OBJECT(
                        'systemName', system_name,
                        'fare', fare,
                        'duration', duration,
                        'fareCapProgress', fare_cap_progress
                        )::text AS json_data
                    FROM (
                        SELECT * FROM timed_passes
                        UNION ALL
                        SELECT rp.*
                        FROM regular_passes rp
                        WHERE NOT EXISTS (
                        SELECT 1
                        FROM timed_passes tp
                        WHERE tp.system_name = rp.system_name AND tp.account_id = rp.account_id
                        )
                    ) AS combined_passes
                    ) AS distinct_json
                    GROUP BY account_id;
            `;
            params = [];
        }

        const { rows } = await client.query(query, params);

        const retreivedRows = toCamelCase(rows); // Convert to camelCase

        response.status(200).json(retreivedRows);
    } catch (error) {
        logger.error(error);
        handleError(
            response,
            accountId
                ? `Error getting commute overview for account ${accountId}`
                : `Error getting commute overview for all accounts`,
        );
    } finally {
        client.release(); // Release the client back to the pool
    }
};
