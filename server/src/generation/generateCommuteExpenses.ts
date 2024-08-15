import { GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { Dayjs } from 'dayjs';

const getNextDate = (
    currentDate: Dayjs,
    dayOfWeek: number,
    startTime: string,
): Dayjs => {
    const [hours, minutes] = startTime.split(':').map(Number);
    let nextDate = dayjs(currentDate).hour(hours).minute(minutes).second(0);

    while (nextDate.day() !== dayOfWeek) {
        nextDate = nextDate.add(1, 'day');
    }

    if (nextDate.isBefore(currentDate, 'minute')) {
        nextDate = nextDate.add(1, 'week');
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
        fromDate,
        commuteExpense.day_of_week,
        commuteExpense.start_time,
    );

    while (
        commuteExpenseDate.isBefore(toDate) ||
        commuteExpenseDate.isSame(toDate, 'day')
    ) {
        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            commuteScheduleId: commuteExpense.commute_schedule_id,
            title: commuteExpense.pass,
            description: `${commuteExpense.pass} pass`,
            date: commuteExpenseDate,
            amount: -commuteExpense.fare_amount,
            taxRate: 0,
            totalAmount: -commuteExpense.fare_amount,
        };

        generatedRides.push(newTransaction);
        commuteExpenseDate = getNextDate(
            commuteExpenseDate.add(1, 'week'),
            commuteExpense.day_of_week,
            commuteExpense.start_time,
        );
    }

    return generatedRides;
};
