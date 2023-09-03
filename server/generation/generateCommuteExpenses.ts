import {
    type CommuteSchedule,
    type GeneratedTransaction,
} from '../types/types';

type GenerateDateFunction = (
    currentDate: Date,
    expense: CommuteSchedule,
) => Date;

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param commuteExpense - The expense to generate
 * @param toDate - The date to generate expenses to
 * @param fromDate - The date to generate expenses from
 * @param generateDateFn - The function to generate the next date
 * Generate expenses for a given expense
 */
const generation = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    commuteExpense: CommuteSchedule,
    toDate: Date,
    fromDate: Date,
    generateDateFn: GenerateDateFunction,
) => {
    let commuteExpenseDate = new Date();

    while (commuteExpenseDate <= toDate) {
        const newTransaction: GeneratedTransaction = {
            commute_schedule_id: commuteExpense.commute_schedule_id,
            title: commuteExpense.pass,
            description: commuteExpense.pass + ' pass',
            date: new Date(commuteExpenseDate),
            amount: -commuteExpense.fare_amount,
            tax_rate: 0,
            total_amount: -commuteExpense.fare_amount,
        };

        if (commuteExpenseDate > new Date()) {
            if (fromDate > commuteExpenseDate) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }
        }

        commuteExpenseDate = generateDateFn(commuteExpenseDate, commuteExpense);
    }
};

/**
 *
 * @param transactions - The transactions to generate expenses for
 * @param skippedTransactions - The transactions to skip
 * @param commuteExpense - The commute expense to generate
 * @param toDate - The date to generate commute expenses to
 * @param fromDate - The date to generate commute expenses from
 * Generate commute expenses for a given commute expense
 */
export const generateCommuteExpenses = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    commuteExpense: CommuteSchedule,
    toDate: Date,
    fromDate: Date,
): void => {
    const generateDateFn = (
        currentDate: Date,
        commuteExpense: CommuteSchedule,
    ): Date => {
        const newDate = currentDate;
        newDate.setDate(1);
        return newDate;
    };

    generation(
        transactions,
        skippedTransactions,
        commuteExpense,
        toDate,
        fromDate,
        generateDateFn,
    );
};
