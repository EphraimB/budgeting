import { GeneratedTransaction } from '../types/types';
import { CommuteSchedule } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { Dayjs } from 'dayjs';

const getNextDate = (
    currentDate: Dayjs,
    dayOfWeek: number,
    startTime: string,
): Dayjs => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let nextDate = dayjs(currentDate).hour(hours).minute(minutes).second(0);

    while (nextDate.day() !== dayOfWeek || nextDate.diff(currentDate) < 0) {
        nextDate.date(nextDate.date() + 1);
    }

    return nextDate;
};

export const generateCommuteExpenses = (
    commuteExpense: any,
    toDate: Dayjs,
    fromDate: Dayjs,
): GeneratedTransaction[] => {
    let generatedRides: GeneratedTransaction[] = [];

    let commuteExpenseDate = getNextDate(
        dayjs(),
        commuteExpense.day_of_week,
        commuteExpense.start_time,
    );

    while (commuteExpenseDate.diff(toDate) <= 0) {
        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            commute_schedule_id: commuteExpense.commute_schedule_id,
            title: commuteExpense.pass,
            description: `${commuteExpense.pass} pass`,
            date: commuteExpenseDate,
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
            dayjs(commuteExpenseDate.millisecond() + 24 * 60 * 60 * 1000),
            commuteExpense.day_of_week,
            commuteExpense.start_time,
        );
    }

    // Return the generated rides
    return generatedRides;
};
