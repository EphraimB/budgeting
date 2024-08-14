import { type Request, type Response } from 'express';
import { accountQueries, commuteOverviewQueries } from '../models/queryData.js';
import { handleError } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import pool from '../config/db.js';

type ReturnObject = {
    accountId: number;
    totalCostPerWeek: number;
    totalCostPerMonth: number;
    systems: SystemDetails[];
};

type SystemDetails = {
    systemName: string;
    totalCostPerWeek: number;
    totalCostPerMonth: number;
    rides: number;
    fareCapProgress?: {
        currentSpent: number;
        fareCap: number;
        fareCapDuration: number;
    };
};

export const getCommuteOverview = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { accountId } = request.query;

    const client = await pool.connect(); // Get a client from the pool

    try {
        const accounts: number[] = [];

        if (accountId) {
            const { rows } = await client.query(accountQueries.getAccount, [
                accountId,
            ]);

            if (rows.length === 0) {
                response.status(404).send('Account does not exist');
                return;
            }

            accounts.push(rows[0].account_id);
        } else {
            const { rows } = await client.query(accountQueries.getAccounts, []);
            accounts.push(...rows.map((account) => account.account_id));
        }

        const overviews = await Promise.all(
            accounts.map(async (account_id) => {
                return await client.query(
                    commuteOverviewQueries.getCommuteOverviewByAccountId,
                    [account_id],
                );
            }),
        );

        const returnObjects = accounts.map((accountId) => {
            const returnObject: ReturnObject = {
                accountId,
                totalCostPerWeek: 0,
                totalCostPerMonth: 0,
                systems: [],
            };

            const overview = overviews.find(
                (overview) => overview.rows[0]?.account_id === accountId,
            );

            if (overview) {
                overview.rows.forEach((row) => {
                    returnObject.totalCostPerWeek += parseFloat(
                        row.total_cost_per_week,
                    );
                    returnObject.totalCostPerMonth += parseFloat(
                        row.total_cost_per_month,
                    );

                    const systemDetails: SystemDetails = {
                        systemName: row.system_name,
                        totalCostPerWeek: parseFloat(row.total_cost_per_week),
                        totalCostPerMonth: parseFloat(row.total_cost_per_month),
                        rides: parseInt(row.rides),
                    };

                    if (row.fare_cap !== null) {
                        systemDetails.fareCapProgress = {
                            currentSpent: parseFloat(row.current_spent),
                            fareCap: parseFloat(row.fare_cap),
                            fareCapDuration: parseInt(row.fare_cap_duration),
                        };
                    }

                    returnObject.systems.push(systemDetails);
                });
            }

            return returnObject;
        });

        response.status(200).json(returnObjects);
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
