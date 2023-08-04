import { JobDetails } from "../types/types";

/**
 *
 * @param jobDetails - Job details
 * @returns - Cron date
 */
const determineCronValues = (jobDetails: JobDetails): string => {
    const {
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        date,
    } = jobDetails;

    const cronMinute = new Date(date).getMinutes().toString();
    let cronHour = new Date(date).getHours().toString();
    let cronDay = "*";
    let cronMonth = "*";
    let cronDayOfWeek = "*";
    let cronWeekOfMonthExpression = "";

    if (frequency_type === null || frequency_type === undefined) {
        const month = new Date(date).getMonth() + 1;

        cronDay = new Date(date).getDate().toString();
        cronMonth = month.toString();
    } else {
        if (frequency_type === 0) {
            cronDay = "*/" + (frequency_type_variable || 1);
        } else if (frequency_type === 1) {
            if (frequency_day_of_week) {
                cronMonth = "*";
                cronDayOfWeek = frequency_day_of_week.toString();
                cronDay = frequency_day_of_month
                    ? frequency_day_of_month.toString()
                    : "*";
            } else {
                cronMonth = "*";
                cronDay = "*/" + 7 * (frequency_type_variable || 1);
            }
        } else if (frequency_type === 2) {
            if (frequency_day_of_week) {
                cronMonth = "*";
                cronDayOfWeek = frequency_day_of_week.toString();
                cronDay = frequency_day_of_month ? frequency_day_of_month.toString() : "*";
                cronWeekOfMonthExpression = frequency_week_of_month ? `[ "$(date +\%m)" != "$(date +\%m -d '${frequency_week_of_month} week')" ]` : "";
            } else {
                cronMonth = "*/" + (frequency_type_variable || 1);
                cronDay = frequency_day_of_month ? frequency_day_of_month.toString() : new Date(date).getDate().toString();
            }
        } else if (frequency_type === 3) {
            if (frequency_day_of_week) {
                cronMonth = frequency_month_of_year.toString() || "*";
                cronDayOfWeek = frequency_day_of_week.toString();
                cronDay = frequency_day_of_month ? frequency_day_of_month.toString() : "*";
                cronWeekOfMonthExpression = frequency_week_of_month ? `[ "$(date +\%m)" != "$(date +\%m -d '${frequency_week_of_month} week')" ]` : "";
            } else {
                cronMonth = "*/" + 12 * (frequency_type_variable || 1);
                cronDay = frequency_day_of_month ? frequency_day_of_month.toString() : new Date(date).getDate().toString();
            }
        }
    }

    // concat the cronDay, cronMonth, and cronDayOfWeek values into a single string
    const cronDate = `${cronMinute} ${cronHour} ${cronDay} ${cronMonth} ${cronDayOfWeek} ${cronWeekOfMonthExpression}`;

    return cronDate;
};

export default determineCronValues;
