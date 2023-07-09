/**
 * 
 * @param jobDetails - Job details
 * @param transactionDate - Transaction date
 * @returns 
 */
const determineCronValues = (jobDetails: any): any => {
    const {
        frequency_type,
        frequency_type_variable,
        frequency_day_of_month,
        frequency_day_of_week,
        frequency_week_of_month,
        frequency_month_of_year,
        transactionDate,
    } = jobDetails;

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