import { type JobDetails } from '../types/types';

/**
 *
 * @param jobDetails - Job details
 * @returns - Cron date
 */
const determineCronValues = (jobDetails: JobDetails): string => {
    const {
        frequencyType,
        frequencyTypeVariable,
        frequencyDayOfMonth,
        frequencyDayOfWeek,
        frequencyWeekOfMonth,
        frequencyMonthOfYear,
        date,
    } = jobDetails;

    const cronMinute = new Date(date).getMinutes().toString();
    const cronHour = new Date(date).getHours().toString();
    let cronDay = '*';
    let cronMonth = '*';
    let cronDayOfWeek = '*';
    let cronWeekOfMonthExpression = '';

    if (frequencyType === null || frequencyType === undefined) {
        const month = new Date(date).getMonth() + 1;

        cronDay = new Date(date).getDate().toString();
        cronMonth = month.toString();
    } else {
        if (frequencyType === 0) {
            cronDay =
                '*/' +
                (frequencyTypeVariable !== null &&
                frequencyTypeVariable !== undefined
                    ? frequencyTypeVariable
                    : 1
                ).toString();
        } else if (frequencyType === 1) {
            if (
                frequencyDayOfWeek !== null &&
                frequencyDayOfWeek !== undefined
            ) {
                cronMonth = '*';
                cronDayOfWeek = frequencyDayOfWeek.toString();
                cronDay =
                    frequencyDayOfMonth !== null &&
                    frequencyDayOfMonth !== undefined
                        ? frequencyDayOfMonth.toString()
                        : '*';
            } else {
                cronMonth = '*';
                cronDay =
                    '*/' +
                    (
                        7 *
                        (frequencyTypeVariable !== null &&
                        frequencyTypeVariable !== undefined
                            ? frequencyTypeVariable
                            : 1)
                    ).toString();
            }
        } else if (frequencyType === 2) {
            if (
                frequencyDayOfWeek !== null &&
                frequencyDayOfWeek !== undefined
            ) {
                cronMonth = '*';
                cronDayOfWeek = frequencyDayOfWeek.toString();
                cronDay =
                    frequencyDayOfMonth !== null &&
                    frequencyDayOfMonth !== undefined
                        ? frequencyDayOfMonth.toString()
                        : '*';
                cronWeekOfMonthExpression =
                    frequencyWeekOfMonth !== null &&
                    frequencyWeekOfMonth !== undefined
                        ? `[ "$(date +%m)" != "$(date +%m -d '${frequencyWeekOfMonth} week')" ] &&`
                        : '';
            } else {
                cronMonth =
                    '*/' +
                    (frequencyTypeVariable !== null &&
                    frequencyTypeVariable !== undefined
                        ? frequencyTypeVariable
                        : 1
                    ).toString();
                cronDay =
                    frequencyDayOfMonth !== null &&
                    frequencyDayOfMonth !== undefined
                        ? frequencyDayOfMonth.toString()
                        : new Date(date).getDate().toString();
            }
        } else if (frequencyType === 3) {
            if (
                frequencyDayOfWeek !== null &&
                frequencyDayOfWeek !== undefined
            ) {
                cronMonth =
                    frequencyMonthOfYear !== null &&
                    frequencyMonthOfYear !== undefined
                        ? frequencyMonthOfYear.toString()
                        : '*';
                cronDayOfWeek = frequencyDayOfWeek.toString();
                cronDay =
                    frequencyDayOfMonth !== null &&
                    frequencyDayOfMonth !== undefined
                        ? frequencyDayOfMonth.toString()
                        : '*';
                cronWeekOfMonthExpression =
                    frequencyWeekOfMonth !== null &&
                    frequencyWeekOfMonth !== undefined
                        ? `[ "$(date +%m)" != "$(date +%m -d '${frequencyWeekOfMonth} week')" ] &&`
                        : '';
            } else {
                cronMonth =
                    '*/' +
                    (
                        12 *
                        (frequencyTypeVariable !== null &&
                        frequencyTypeVariable !== undefined
                            ? frequencyTypeVariable
                            : 1)
                    ).toString();
                cronDay =
                    frequencyDayOfMonth !== null &&
                    frequencyDayOfMonth !== undefined
                        ? frequencyDayOfMonth.toString()
                        : new Date(date).getDate().toString();
            }
        }
    }

    // concat the cronDay, cronMonth, and cronDayOfWeek values into a single string
    const cronDate = `${cronMinute} ${cronHour} ${cronDay} ${cronMonth} ${cronDayOfWeek} ${cronWeekOfMonthExpression}`;

    return cronDate;
};

export default determineCronValues;
