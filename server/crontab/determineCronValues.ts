/**
 * 
 * @param frequency_type - Frequency type (0 = daily, 1 = weekly, 2 = monthly)
 * @param frequency_type_variable - Frequency type variable (e.g. 1 = every day, 2 = every other day, etc.)
 * @param frequency_day_of_month - Frequency day of month (e.g. 1 = every 1st of the month, 2 = every 2nd of the month, etc.)
 * @param frequency_day_of_week - Frequency day of week (e.g. 1 = every Monday, 2 = every Tuesday, etc.)
 * @param frequency_week_of_month - Frequency week of month (e.g. 0 = every 1st week of the month, 1 = every 2nd week of the month, etc.)
 * @param frequency_month_of_year - Frequency month of year (e.g. 0 = every January, 1 = every February, etc.)
 * @param transactionDate - Transaction date
 * @returns 
 */
const determineCronValues = (frequency_type: number, frequency_type_variable: number, frequency_day_of_month: number, frequency_day_of_week: number, frequency_week_of_month: number, frequency_month_of_year: number, transactionDate: Date): any => {
    let cronDay = '*';
    let cronMonth = '*';
    let cronDayOfWeek = '*';

    if (frequency_type === 0) {
        cronDay = '*/' + (frequency_type_variable || 1);
    } else if (frequency_type === 1) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_day_of_week.toString();
            cronDay = frequency_day_of_month.toString() || '*';
        } else {
            cronMonth = '*';
            cronDay = '*/' + 7 * (frequency_type_variable || 1);
        }
    } else if (frequency_type === 2) {
        if (frequency_day_of_week) {
            cronMonth = '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week.toString();
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month.toString() || '*');
        } else {
            cronMonth = '*/' + (frequency_type_variable || 1);
            cronDay = transactionDate.getDate().toString();
        }
    } else if (frequency_type === 3) {
        if (frequency_day_of_week) {
            cronMonth = frequency_month_of_year.toString() || '*';
            cronDayOfWeek = frequency_week_of_month ? '*/' + 7 * (frequency_type_variable || 1) : frequency_day_of_week.toString();
            cronDay = frequency_week_of_month ? '?' : (frequency_day_of_month.toString() || '*');
        } else {
            cronMonth = '*/' + 12 * (frequency_type_variable || 1);
            cronDay = transactionDate.getDate().toString();
        }
    }

    return { cronDay, cronMonth, cronDayOfWeek };
};

export default determineCronValues;