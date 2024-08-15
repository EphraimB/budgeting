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
    let loanDate: Dayjs = dayjs(loan.loanBeginDate);
    let loanAmount: number = loan.loanAmount ?? 0;

    if (loan.frequencyMonthOfYear)
        loanDate = loanDate.month(loan.frequencyMonthOfYear);

    // Adjust for the day of the week
    if (loan.frequencyDayOfWeek) {
        loanDate = loanDate.startOf('month');
        let firstOccurrence = loanDate.day(loan.frequencyDayOfWeek);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(loanDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        // Adjust for the specific week of the month
        if (loan.frequencyWeekOfMonth) {
            loanDate = firstOccurrence.add(loan.frequencyWeekOfMonth, 'week');
        } else {
            loanDate = firstOccurrence;
        }
    }

    while (loanDate.diff(toDate) <= 0 && loanAmount > 0) {
        const interest = calculateInterest(
            loanAmount,
            loan.loanInterestRate ?? 0,
            loan.loanInterestFrequencyType ?? 2,
        );
        const adjustedLoanAmount = loanAmount + interest;
        const amount = Math.min(loan.loanPlanAmount, adjustedLoanAmount);
        const subsidizedAmount = amount - amount * (loan.loanSubsidized ?? 0);

        const newTransaction: GeneratedTransaction = {
            id: uuidv4(),
            loanId: loan.loanId,
            title: loan.loanTitle + ' loan to ' + loan.loanRecipient,
            description: loan.loanDescription,
            date: dayjs(loanDate),
            amount: -subsidizedAmount,
            taxRate: 0,
            totalAmount: -subsidizedAmount,
        };

        if (loanDate.diff() > 0) {
            if (loanDate.diff(fromDate) < 0) {
                skippedTransactions.push(newTransaction);
            } else {
                transactions.push(newTransaction);
            }

            loanAmount = adjustedLoanAmount - amount;
        }

        loanDate = generateDateFn(loanDate, loan);
    }

    if (loanAmount <= 0) {
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
            loan.frequencyTypeVariable,
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
        let loanDate: Dayjs = dayjs(loan.loanBeginDate).add(
            monthsIncremented + loan.frequencyTypeVariable,
            'month',
        );

        // Adjust for the day of the week
        if (loan.frequencyDayOfWeek) {
            loanDate = loanDate.startOf('month');
            let firstOccurrence = loanDate.day(loan.frequencyDayOfWeek);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(loanDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (loan.frequencyWeekOfMonth) {
                loanDate = firstOccurrence.add(
                    loan.frequencyWeekOfMonth,
                    'week',
                );
            } else {
                loanDate = firstOccurrence;
            }
        }

        monthsIncremented += loan.frequencyTypeVariable;

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
    if (loan.frequencyDayOfWeek) {
        loanDate = loanDate.startOf('month');
        let firstOccurrence = loanDate.day(loan.frequencyDayOfWeek);

        // If the first occurrence is before the start of the month, move to the next week
        if (firstOccurrence.isBefore(loanDate)) {
            firstOccurrence = firstOccurrence.add(1, 'week');
        }

        loanDate = firstOccurrence;
    }

    const generateDateFn = (currentDate: Dayjs, loan: Loan): Dayjs => {
        const newDate: Dayjs = currentDate.add(
            loan.frequencyTypeVariable,
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
        let loanDate: Dayjs = dayjs(loan.loanBeginDate).add(
            yearsIncremented + loan.frequencyTypeVariable,
            'year',
        );

        if (loan.frequencyMonthOfYear)
            loanDate = loanDate.month(loan.frequencyMonthOfYear);

        // Adjust for the day of the week
        if (loan.frequencyDayOfWeek) {
            loanDate = loanDate.startOf('month');
            let firstOccurrence = loanDate.day(loan.frequencyDayOfWeek);

            // If the first occurrence is before the start of the month, move to the next week
            if (firstOccurrence.isBefore(loanDate)) {
                firstOccurrence = firstOccurrence.add(1, 'week');
            }

            // Adjust for the specific week of the month
            if (loan.frequencyWeekOfMonth) {
                loanDate = firstOccurrence.add(
                    loan.frequencyWeekOfMonth,
                    'week',
                );
            } else {
                loanDate = firstOccurrence;
            }
        }
        yearsIncremented += loan.frequencyTypeVariable;

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
