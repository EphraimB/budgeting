import { type NextFunction, type Request, type Response } from 'express';
import { cronJobQueries, incomeQueries } from '../models/queryData.js';
import scheduleCronJob from '../crontab/scheduleCronJob.js';
import deleteCronJob from '../crontab/deleteCronJob.js';
import {
    handleError,
    executeQuery,
    parseIntOrFallback,
} from '../utils/helperFunctions.js';
import { type Income } from '../types/types.js';
import { logger } from '../config/winston.js';

interface IncomeInput {
    income_id: string;
    account_id: string;
    cron_job_id: string;
    tax_id: string;
    income_amount: string;
    income_title: string;
    income_description: string;
    frequency_type: string;
    frequency_type_variable: string;
    frequency_day_of_month: string;
    frequency_day_of_week: string;
    frequency_week_of_month: string;
    frequency_month_of_year: string;
    income_begin_date: string;
    income_end_date: string;
    date_created: string;
    date_modified: string;
}

/**
 *
 * @param income - Income object
 * @returns Income object with the correct types
 * Converts the income object to the correct types
 **/
const parseIncome = (income: IncomeInput): Income => ({
    income_id: parseInt(income.income_id),
    account_id: parseInt(income.account_id),
    tax_id: parseIntOrFallback(income.tax_id),
    income_amount: parseFloat(income.income_amount),
    income_title: income.income_title,
    income_description: income.income_description,
    frequency_type: parseInt(income.frequency_type),
    frequency_type_variable: parseIntOrFallback(income.frequency_type_variable),
    frequency_day_of_month: parseIntOrFallback(income.frequency_day_of_month),
    frequency_day_of_week: parseIntOrFallback(income.frequency_day_of_week),
    frequency_week_of_month: parseIntOrFallback(income.frequency_week_of_month),
    frequency_month_of_year: parseIntOrFallback(income.frequency_month_of_year),
    income_begin_date: income.income_begin_date,
    income_end_date: income.income_end_date,
    date_created: income.date_created,
    date_modified: income.date_modified,
});

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the income object
 */
export const getIncome = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { id, account_id } = request.query;

    try {
        let query: string;
        let params: any[];

        if (
            id !== null &&
            id !== undefined &&
            account_id !== null &&
            account_id !== undefined
        ) {
            query = incomeQueries.getIncomeByIdAndAccountId;
            params = [id, account_id];
        } else if (id !== null && id !== undefined) {
            query = incomeQueries.getIncomeById;
            params = [id];
        } else if (account_id !== null && account_id !== undefined) {
            query = incomeQueries.getIncomeByAccountId;
            params = [account_id];
        } else {
            query = incomeQueries.getIncome;
            params = [];
        }

        const income = await executeQuery<IncomeInput>(query, params);

        if (
            ((id !== null && id !== undefined) ||
                (account_id !== null && account_id !== undefined)) &&
            income.length === 0
        ) {
            response.status(404).send('Income not found');
            return;
        }

        response.status(200).json(income.map(parseIncome));
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(
            response,
            `Error getting ${
                id !== null && id !== undefined
                    ? 'income'
                    : account_id !== null && account_id !== undefined
                    ? 'income for given account_id'
                    : 'income'
            }`,
        );
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the created income and creates a cron job for the income and inserts it into the database
 */
export const createIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date,
    } = request.body;

    try {
        const income = await executeQuery<IncomeInput>(
            incomeQueries.createIncome,
            [
                account_id,
                tax_id,
                amount,
                title,
                description,
                frequency_type,
                frequency_type_variable,
                frequency_day_of_month,
                frequency_day_of_week,
                frequency_week_of_month,
                frequency_month_of_year,
                begin_date,
                end_date,
            ],
        );

        const modifiedIncome = income.map(parseIncome);

        const cronParams = {
            date: begin_date,
            account_id,
            id: modifiedIncome[0].income_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/dist/scripts/createTransaction.sh',
            type: 'income',
        };

        const { cronDate, uniqueId } = await scheduleCronJob(cronParams);
        const cronId: number = (
            await executeQuery(cronJobQueries.createCronJob, [
                uniqueId,
                cronDate,
            ])
        )[0].cron_job_id;

        logger.info('Cron job created ' + cronId.toString());

        await executeQuery(incomeQueries.updateIncomeWithCronJobId, [
            cronId,
            modifiedIncome[0].income_id,
        ]);

        request.income_id = modifiedIncome[0].income_id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating income');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the created income
 */
export const createIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { income_id } = request;

    try {
        const income = await executeQuery<IncomeInput>(
            incomeQueries.getIncomeById,
            [income_id],
        );

        const modifiedIncome = income.map(parseIncome);

        response.status(201).json(modifiedIncome);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error creating income');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the updated income and updates the cron job for the income and updates it in the database
 */
export const updateIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const id: number = parseInt(request.params.id);
    const {
        account_id,
        tax_id,
        amount,
        title,
        description,
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        begin_date,
        end_date,
    } = request.body;

    try {
        const cronParams = {
            date: begin_date,
            account_id,
            id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            scriptPath: '/app/dist/scripts/createTransaction.sh',
            type: 'income',
        };

        const incomeResult = await executeQuery<IncomeInput>(
            incomeQueries.getIncomeById,
            [id],
        );

        if (incomeResult.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = parseInt(incomeResult[0].cron_job_id);
        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

        const { uniqueId, cronDate } = await scheduleCronJob(cronParams);

        await executeQuery(cronJobQueries.updateCronJob, [
            uniqueId,
            cronDate,
            cronId,
        ]);

        await executeQuery<IncomeInput>(incomeQueries.updateIncome, [
            account_id,
            tax_id,
            amount,
            title,
            description,
            frequency_type,
            frequency_type_variable,
            frequency_day_of_month,
            frequency_day_of_week,
            frequency_week_of_month,
            frequency_month_of_year,
            begin_date,
            end_date,
            id,
        ]);

        request.income_id = id;

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating income');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * Sends a response with the updated income
 */
export const updateIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    const { income_id } = request;

    try {
        const income = await executeQuery<IncomeInput>(
            incomeQueries.getIncomeById,
            [income_id],
        );

        const modifiedIncome = income.map(parseIncome);

        response.status(200).json(modifiedIncome);
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error updating income');
    }
};

/**
 *
 * @param request - Request object
 * @param response - Response object
 * @param next - Next function
 * Sends a response with the deleted income and deletes the cron job for the income and deletes it from the database
 */
export const deleteIncome = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const { id } = request.params;

    try {
        const incomeResult = await executeQuery(incomeQueries.getIncomeById, [
            id,
        ]);
        if (incomeResult.length === 0) {
            response.status(404).send('Income not found');
            return;
        }

        const cronId: number = incomeResult[0].cron_job_id;

        await executeQuery(incomeQueries.deleteIncome, [id]);

        const results = await executeQuery(cronJobQueries.getCronJob, [cronId]);

        if (results.length > 0) {
            await deleteCronJob(results[0].unique_id);
        } else {
            logger.error('Cron job not found');
            response.status(404).send('Cron job not found');
            return;
        }

        await executeQuery(cronJobQueries.deleteCronJob, [cronId]);

        next();
    } catch (error) {
        logger.error(error); // Log the error on the server side
        handleError(response, 'Error deleting income');
    }
};

export const deleteIncomeReturnObject = async (
    request: Request,
    response: Response,
): Promise<void> => {
    response.status(200).send('Income deleted successfully');
};
