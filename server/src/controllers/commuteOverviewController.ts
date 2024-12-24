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
            WITH RECURSIVE days AS (
                SELECT date_trunc('month', current_date)::date as day
                UNION ALL
                SELECT day + 1
                FROM days
                WHERE day < date_trunc('month', current_date)::date + interval '1 month' - interval '1 day'
            ),
            count_days AS (
                SELECT
                extract(dow from day)::int AS day_of_week,
                COUNT(*) AS num_days
                FROM days
                GROUP BY day_of_week
            ),
            ticket_fares AS (
                SELECT
                    fd.account_id,
                    csy.name AS system_name,
                    COALESCE(SUM(fd.fare), 0) AS total_cost_per_week,
                    COALESCE(SUM(fd.fare * cd.num_days), 0) AS total_cost_per_month,
                    COUNT(cs.id) AS rides,
                    csy.fare_cap AS fare_cap,
                    csy.fare_cap_duration AS fare_cap_duration,
                    (
                    SELECT COALESCE(SUM(ch.fare), 0)
                    FROM commute_history ch
                    WHERE ch.account_id = fd.account_id
                    AND (
                        (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                        (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                        (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                    )
                ) AS current_spent
                FROM commute_schedule cs
                JOIN fare_details fd ON cs.fare_details_id = fd.id
                JOIN stations s ON fd.station_id = s.id
                JOIN commute_systems csy ON s.commute_system_id = csy.id
                JOIN count_days cd ON cs.day_of_week = cd.day_of_week
                WHERE fd.duration IS NULL
                GROUP BY fd.account_id, csy.name, csy.fare_cap, csy.fare_cap_duration, csy.id
            )
            SELECT
                tf.account_id,
                SUM(tf.total_cost_per_week) AS total_cost_per_week,
                SUM(tf.total_cost_per_month) AS total_cost_per_month,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'systemName', tf.system_name,
                        'totalCostPerWeek', tf.total_cost_per_week,
                        'totalCostPerMonth', tf.total_cost_per_month,
                        'rides', tf.rides,
                        'fareCapProgress', JSON_BUILD_OBJECT(
                            'currentSpent', tf.current_spent,
                            'fareCap', tf.fare_cap,
                            'fareCapDuration', tf.fare_cap_duration
                        )
                    )
                ) AS systems
            FROM ticket_fares tf
            WHERE account_id = $1
            GROUP BY tf.account_id;
        `;

            params = [accountId];
        } else {
            query = `
                WITH RECURSIVE days AS (
                SELECT date_trunc('month', current_date)::date as day
                UNION ALL
                SELECT day + 1
                FROM days
                WHERE day < date_trunc('month', current_date)::date + interval '1 month' - interval '1 day'
            ),
            count_days AS (
                SELECT
                extract(dow from day)::int AS day_of_week,
                COUNT(*) AS num_days
                FROM days
                GROUP BY day_of_week
            ),
            ticket_fares AS (
                SELECT
                    fd.account_id,
                    csy.name AS system_name,
                    COALESCE(SUM(fd.fare), 0) AS total_cost_per_week,
                    COALESCE(SUM(fd.fare * cd.num_days), 0) AS total_cost_per_month,
                    COUNT(cs.id) AS rides,
                    csy.fare_cap AS fare_cap,
                    csy.fare_cap_duration AS fare_cap_duration,
                    (
                    SELECT COALESCE(SUM(ch.fare), 0)
                    FROM commute_history ch
                    WHERE ch.account_id = fd.account_id
                    AND (
                        (csy.fare_cap_duration = 0 AND date(ch.timestamp) = current_date) OR
                        (csy.fare_cap_duration = 1 AND date_trunc('week', ch.timestamp) = date_trunc('week', current_date)) OR
                        (csy.fare_cap_duration = 2 AND date_trunc('month', ch.timestamp) = date_trunc('month', current_date))
                    )
                ) AS current_spent
                FROM commute_schedule cs
                JOIN fare_details fd ON cs.fare_details_id = fd.id
                JOIN stations s ON fd.station_id = s.id
                JOIN commute_systems csy ON s.commute_system_id = csy.id
                JOIN count_days cd ON cs.day_of_week = cd.day_of_week
                WHERE fd.duration IS NULL
                GROUP BY fd.account_id, csy.name, csy.fare_cap, csy.fare_cap_duration, csy.id
            )
            SELECT
                tf.account_id,
                SUM(tf.total_cost_per_week) AS total_cost_per_week,
                SUM(tf.total_cost_per_month) AS total_cost_per_month,
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'systemName', tf.system_name,
                        'totalCostPerWeek', tf.total_cost_per_week,
                        'totalCostPerMonth', tf.total_cost_per_month,
                        'rides', tf.rides,
                        'fareCapProgress', JSON_BUILD_OBJECT(
                            'currentSpent', tf.current_spent,
                            'fareCap', tf.fare_cap,
                            'fareCapDuration', tf.fare_cap_duration
                        )
                    )
                ) AS systems
            FROM ticket_fares tf
            GROUP BY tf.account_id;
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
