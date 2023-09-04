import { logger } from '../config/winston.js';
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
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    commuteExpense: CommuteSchedule,
    toDate: Date,
    fromDate: Date,
    fareCappingInfo: any,
    current_spent: number,
    currentSpentMap: Map<number, number>,
    firstRideMap: Map<number, Date>,
): void => {
    let commuteExpenseDate = getNextDate(
        new Date(),
        commuteExpense.day_of_week,
        commuteExpense.start_time,
    );

    while (commuteExpenseDate <= toDate) {
        // Deduct fare from current_spent
        current_spent += commuteExpense.fare_amount;

        // If current_spent exceeds fare cap, adjust the transaction amount
        let transactionAmount = -commuteExpense.fare_amount;

        // Checking if fare cap logic needs to be applied
        if (
            fareCappingInfo.fare_cap !== null &&
            current_spent + commuteExpense.fare_amount >
                fareCappingInfo.fare_cap
        ) {
            transactionAmount = -(fareCappingInfo.fare_cap - current_spent);
        }

        current_spent += -transactionAmount; // update current_spent with the transactionAmount

        const newTransaction: GeneratedTransaction = {
            commute_schedule_id: commuteExpense.commute_schedule_id,
            title: commuteExpense.pass,
            description: `${commuteExpense.pass} pass`,
            date: new Date(commuteExpenseDate),
            amount: transactionAmount,
            tax_rate: 0,
            total_amount: transactionAmount,
        };

        if (commuteExpenseDate >= fromDate) {
            transactions.push(newTransaction);
        } else {
            skippedTransactions.push(newTransaction);
        }

        // Check if we need to reset current_spent based on fare_capping's duration.
        const nextCommuteExpenseDate = getNextDate(
            new Date(commuteExpenseDate.getTime() + 24 * 60 * 60 * 1000),
            commuteExpense.day_of_week,
            commuteExpense.start_time,
        );

        // Reset logic here based on fareCappingInfo's duration and the dates
        // Check if we need to reset current_spent based on fare_capping's duration.
        switch (fareCappingInfo.duration) {
            case 0: // Daily cap
                if (
                    commuteExpenseDate.getDate() !==
                    nextCommuteExpenseDate.getDate()
                ) {
                    current_spent = 0;
                }
                break;
            case 1: // Weekly cap
                let firstRideDate = firstRideMap.get(
                    commuteExpense.commute_system_id,
                );

                if (!firstRideDate) {
                    // If the first ride hasn't been recorded, save the current ride date as the first ride date
                    firstRideMap.set(
                        commuteExpense.commute_system_id,
                        commuteExpenseDate,
                    );
                } else {
                    const aWeekFromFirstRide = new Date(firstRideDate);
                    aWeekFromFirstRide.setDate(
                        aWeekFromFirstRide.getDate() + 7,
                    );

                    // If we've reached or passed a week from the first ride, reset the cap
                    if (commuteExpenseDate >= aWeekFromFirstRide) {
                        current_spent = 0;
                        // Reset the first ride date for the next cycle
                        firstRideMap.set(
                            commuteExpense.commute_system_id,
                            commuteExpenseDate,
                        );
                    }
                }
                break;
            case 2: // Monthly cap
                if (
                    commuteExpenseDate.getMonth() !==
                    nextCommuteExpenseDate.getMonth()
                ) {
                    current_spent = 0;
                }
                break;
        }

        // Store the updated current_spent value in the map.
        currentSpentMap.set(commuteExpense.commute_system_id, current_spent);

        commuteExpenseDate = nextCommuteExpenseDate;
    }
};
