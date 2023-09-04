import { GeneratedTransaction } from '../types/types';
import { CommuteSchedule } from '../types/types';

const getNextDate = (
    currentDate: Date,
    dayOfWeek: number,
    startTime: string,
): Date => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let nextDate = new Date(currentDate);
    nextDate.setHours(hours, minutes, 0, 0);

    while (nextDate.getDay() !== dayOfWeek || nextDate <= currentDate) {
        nextDate.setDate(nextDate.getDate() + 1);
    }

    return nextDate;
};

export const generateCommuteExpenses = (
    commuteExpense: CommuteSchedule,
    toDate: Date,
    fromDate: Date,
): GeneratedTransaction[] => {
    let generatedRides: GeneratedTransaction[] = [];

    let commuteExpenseDate = getNextDate(
        new Date(),
        commuteExpense.day_of_week,
        commuteExpense.start_time,
    );

    while (commuteExpenseDate <= toDate) {
        const newTransaction: GeneratedTransaction = {
            commute_schedule_id: commuteExpense.commute_schedule_id,
            title: commuteExpense.pass,
            description: `${commuteExpense.pass} pass`,
            date: new Date(commuteExpenseDate),
            amount: -commuteExpense.fare_amount,
            tax_rate: 0,
            total_amount: -commuteExpense.fare_amount,
        };

        // Instead of pushing to transactions or skippedTransactions:
        if (commuteExpenseDate >= fromDate) {
            generatedRides.push(newTransaction);
        } else {
            generatedRides.push(newTransaction); // We'll filter them out later
        }

        commuteExpenseDate = getNextDate(
            new Date(commuteExpenseDate.getTime() + 24 * 60 * 60 * 1000),
            commuteExpense.day_of_week,
            commuteExpense.start_time,
        );
    }
    
    // Return the generated rides
    return generatedRides;
};
