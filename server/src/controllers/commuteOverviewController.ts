import { type Request, type Response } from 'express';
import { accountQueries, commuteOverviewQueries } from '../models/queryData.js';
import { handleError, executeQuery } from '../utils/helperFunctions.js';
import { logger } from '../config/winston.js';
import { Account } from '../../src/types/types.js';

type ReturnObject = {
    account_id: number;
    total_cost_per_week: number;
    total_cost_per_month: number;
    systems: {
        [key: string]: {
            total_cost_per_week: number;
            total_cost_per_month: number;
            rides: number;
            fare_cap_progress?: {
                current_spent: number;
                fare_cap: number;
                fare_cap_duration: number;
            };
        };
    };
};

type SystemDetails = {
    total_cost_per_week: number;
    total_cost_per_month: number;
    rides: number;
    fare_cap_progress?: {
        current_spent: number;
        fare_cap: number;
        fare_cap_duration: number;
    };
};

export const getCommuteOverview = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { account_id } = request.query;

    try {
        const accounts: number[] = [];

        if (account_id) {
            const results: Account[] = await executeQuery(
                accountQueries.getAccount,
                [account_id],
            );

            if (results.length === 0) {
                response.status(404).send('Account does not exist');
                return;
            }

            accounts.push(results[0].account_id);
        } else {
            const results: Account[] = await executeQuery(
                accountQueries.getAccounts,
                [],
            );
            accounts.push(...results.map((account) => account.account_id));
        }

        const overviews = await Promise.all(
            accounts.map(async (account_id) => {
                return await executeQuery(
                    commuteOverviewQueries.getCommuteOverviewByAccountId,
                    [account_id],
                );
            }),
        );

        const returnObjects = accounts.map((account_id) => {
            const returnObject: ReturnObject = {
                account_id,
                total_cost_per_week: 0,
                total_cost_per_month: 0,
                systems: {},
            };

            const overview = overviews.find(
                (overview) => overview[0]?.account_id === account_id,
            );

            if (overview) {
                overview.forEach((row) => {
                    returnObject.total_cost_per_week += parseFloat(
                        row.total_cost_per_week,
                    );
                    returnObject.total_cost_per_month += parseFloat(
                        row.total_cost_per_month,
                    );

                    const systemDetails: SystemDetails = {
                        total_cost_per_week: parseFloat(
                            row.total_cost_per_week,
                        ),
                        total_cost_per_month: parseFloat(
                            row.total_cost_per_month,
                        ),
                        rides: parseInt(row.rides),
                    };

                    if (row.fare_cap !== null) {
                        systemDetails.fare_cap_progress = {
                            current_spent: parseFloat(row.current_spent),
                            fare_cap: parseFloat(row.fare_cap),
                            fare_cap_duration: parseInt(row.fare_cap_duration),
                        };
                    }

                    returnObject.systems[row.system_name] = systemDetails;
                });
            }

            return returnObject;
        });

        response.status(200).json(returnObjects);
    } catch (error) {
        logger.error(error);
        handleError(
            response,
            account_id
                ? `Error getting commute overview for account ${account_id}`
                : `Error getting commute overview for all accounts`,
        );
    }
};
