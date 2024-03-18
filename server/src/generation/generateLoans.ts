import { type Loan, type GeneratedTransaction } from '../types/types';
import { v4 as uuidv4 } from 'uuid';
import dayjs, { type Dayjs } from 'dayjs';

type GenerateDateFunction = (currentDate: Dayjs, loan: Loan) => Dayjs;

/**
 *
 * @param principal - The principal amount
 * @param annualInterestRate - The annual interest rate
 * @param frequencyType - The frequency type
 * @returns - The interest amount
 */
export const calculateInterest = (
    principal: number,
    annualInterestRate: number,
    frequencyType: number,
): number => {
    let periodsPerYear;

    switch (frequencyType) {
        case 0: // daily
            periodsPerYear = 365;
            break;
        case 1: // weekly
            periodsPerYear = 52;
            break;
        case 2: // monthly
            periodsPerYear = 12;
            break;
        case 3: // yearly
            periodsPerYear = 1;
            break;
        default:
            periodsPerYear = 1;
    }

    const ratePerPeriod = annualInterestRate / periodsPerYear;
    return principal * ratePerPeriod;
};

/**
 *
 * @param transactions - The transactions to generate loans for
 * @param skippedTransactions - The transactions to skip
 * @param loan - The loan to generate
 * @param toDate - The date to generate loans to
 * @param fromDate - The date to generate loans from
 * @param generateDateFn - The function to generate the next date
 * Generate loans for a given loan
 */
const generateLoans = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    loan: any,
    toDate: Dayjs,
    fromDate: Dayjs,
    generateDateFn: GenerateDateFunction,
): { fullyPaidBackDate?: string | null } => {
    let loanDate: Dayjs = dayjs(loan.loan_begin_date);
    let loan_amount: number = loan.loan_amount ?? 0;

    if (loan.frequency_month_of_year)
        loanDate = loanDate.month(loan.frequency_month_of_year);

    // Adjust for the day of the week
    if (loan.frequency_day_of_week) {
        loanDate = loanDate.startOf('month');
        let firstOccurrence = loanDate.day(loan.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(loanDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        // Adjust for the specific week of the month
        if (loan.frequency_week_of_month) {
            loanDate = firstOccurrence.add(
                loan.frequency_week_of_month,
                'week',
            );
        } else {
            loanDate = firstOccurrence;
        }
    }

    while (loanDate.diff(toDate) <= 0 && loan_amount > 0) {
        const interest = calculateInterest(
            loan_amount,
            loan.loan_interest_rate ?? 0,
            loan.loan_interest_frequency_type ?? 2,
        );
        const adjustedLoanAmount = loan_amount + interest;
        const amount = Math.min(loan.loan_plan_amount, adjustedLoanAmount);
        const subsidizedAmount = amount - amount * (loan.loan_subsidized ?? 0);

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            loan_id: loan.loan_id,
            title: loan.loan_title + ' loan to ' + loan.loan_recipient,
            description: loan.loan_description,
            date: dayjs(loanDate),
            amount: -subsidizedAmount,
            tax_rate: 0,
            total_amount: -subsidizedAmount,
        };

        if (loanDate.diff() > 0) {
            if (loanDate.diff(fromDate) < 0) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }

            loan_amount = adjustedLoanAmount - amount;
        }

        loanDate = generateDateFn(loanDate, loan);
    }

    if (loan_amount <= 0) {
        // Return the loan date when the loan amount reaches zero or goes below
        return { fullyPaidBackDate: loanDate.toISOString() };
    } else {
        // If the loop finishes without finding a fully paid back date, return an empty object.
        return { fullyPaidBackDate: null };
    }
};

/**
 *
 * @param transactions - The transactions to generate loans for
 * @param skippedTransactions - The transactions to skip
 * @param loan - The loan to generate
 * @param toDate - The date to generate loans to
 * @param fromDate - The date to generate loans from
 * Generates loans for a loan with a daily frequency
 */
export const generateDailyLoans = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    loan: Loan,
    toDate: Dayjs,
    fromDate: Dayjs,
): { fullyPaidBackDate?: string | null } => {
    const generateDateFn = (currentDate: Dayjs, loan: Loan): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            loan.frequency_type_variable,
            'day',
        );

        return newDate;
    };

    return generateLoans(
        transactions,
        skippedTransactions,
        loan,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate loans for
 * @param skippedTransactions - The transactions to skip
 * @param loan - The loan to generate
 * @param toDate - The date to generate loans to
 * @param fromDate - The date to generate loans from
 * Generates loans for a loan with a monthly frequency
 */
export const generateMonthlyLoans = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    loan: Loan,
    toDate: Dayjs,
    fromDate: Dayjs,
): { fullyPaidBackDate?: string | null } => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, loan: any): Dayjs => {
        let loanDate: Dayjs = dayjs(loan.loan_begin_date).add(
            monthsIncremented + loan.frequency_type_variable,
            'month',
        );

        // Adjust for the day of the week
        if (loan.frequency_day_of_week) {
            loanDate = loanDate.startOf('month');
            let firstOccurrence = loanDate.day(loan.frequency_day_of_week);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(loanDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (loan.frequency_week_of_month) {
                loanDate = firstOccurrence.add(
                    loan.frequency_week_of_month,
                    'week',
                );
            } else {
                loanDate = firstOccurrence;
            }
        }

        monthsIncremented += loan.frequency_type_variable;

        return loanDate;
    };

    return generateLoans(
        transactions,
        skippedTransactions,
        loan,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate loans for
 * @param skippedTransactions - The transactions to skip
 * @param loan - The loan to generate
 * @param toDate - The date to generate loans to
 * @param fromDate - The date to generate loans from
 * Generates loans for a loan with a weekly frequency
 */
export const generateWeeklyLoans = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    loan: any,
    toDate: Dayjs,
    fromDate: Dayjs,
): { fullyPaidBackDate?: string | null } => {
    let loanDate: Dayjs = dayjs(loan.loan_begin_date);

    // Adjust for the day of the week
    if (loan.frequency_day_of_week) {
        loanDate = loanDate.startOf('month');
        let firstOccurrence = loanDate.day(loan.frequency_day_of_week);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(loanDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        loanDate = firstOccurrence;
    }

    const generateDateFn = (currentDate: Dayjs, loan: Loan): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            loan.frequency_type_variable,
            'week',
        );

        return newDate;
    };

    return generateLoans(
        transactions,
        skippedTransactions,
        loan,
        toDate,
        fromDate,
        generateDateFn,
    );
};

/**
 *
 * @param transactions - The transactions to generate loans for
 * @param skippedTransactions - The transactions to skip
 * @param loan - The loan to generate
 * @param toDate - The date to generate loans to
 * @param fromDate - The date to generate loans from
 * Generates loans for a loan with a yearly frequency
 */
export const generateYearlyLoans = (
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    loan: Loan,
    toDate: Dayjs,
    fromDate: Dayjs,
): { fullyPaidBackDate?: string | null } => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Dayjs, loan: any): Dayjs => {
        let loanDate: Dayjs = dayjs(loan.loan_begin_date).add(
            yearsIncremented + loan.frequency_type_variable,
            'year',
        );

        if (loan.frequency_month_of_year)
            loanDate = loanDate.month(loan.frequency_month_of_year);

        // Adjust for the day of the week
        if (loan.frequency_day_of_week) {
            loanDate = loanDate.startOf('month');
            let firstOccurrence = loanDate.day(loan.frequency_day_of_week);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(loanDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (loan.frequency_week_of_month) {
                loanDate = firstOccurrence.add(
                    loan.frequency_week_of_month,
                    'week',
                );
            } else {
                loanDate = firstOccurrence;
            }
        }
        yearsIncremented += loan.frequency_type_variable;

        return loanDate;
    };

    return generateLoans(
        transactions,
        skippedTransactions,
        loan,
        toDate,
        fromDate,
        generateDateFn,
    );
};
