import { executeQuery } from '../utils/helperFunctions.js';
import { expenseQueries } from '../models/queryData.js';

export const getExpenses = async (id) => {
    const query = id ? expenseQueries.getExpense : expenseQueries.getExpenses;
    const params = id ? [id] : [];

    return await executeQuery(query, params);
};

export const createExpense = async (body) => {
    const { name, amount, category, account_id } = body;
    const params = [name, amount, category, account_id];

    return await executeQuery(expenseQueries.createExpense, params);
};