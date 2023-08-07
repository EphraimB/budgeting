import { type Loan, type GeneratedTransaction } from '../types/types';

type GenerateDateFunction = (currentDate: Date, loan: Loan) => Date;

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
            console.error('Invalid frequency type');
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
    loan: Loan,
    toDate: Date,
    fromDate: Date,
    generateDateFn: GenerateDateFunction,
): { fullyPaidBackDate?: string } => {
    let loanDate: Date = new Date(loan.loan_begin_date);
    let loan_amount: number = loan.loan_amount;

    if (
        loan.frequency_month_of_year !== null &&
        loan.frequency_month_of_year !== undefined
    ) {
        loanDate.setMonth(loan.frequency_month_of_year);
    }

    if (
        loan.frequency_day_of_week !== null &&
        loan.frequency_day_of_week !== undefined
    ) {
        let newDay;

        if (
            loan.frequency_day_of_week !== null &&
            loan.frequency_day_of_week !== undefined
        ) {
            let daysUntilNextFrequency: number =
                (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
            daysUntilNextFrequency =
                daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
            newDay = loanDate.getDate() + daysUntilNextFrequency;
        }

        if (
            loan.frequency_week_of_month !== null &&
            loan.frequency_week_of_month !== undefined
        ) {
            // first day of the month
            loanDate.setDate(1);
            const daysToAdd =
                (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
            // setting to the first occurrence of the desired day of week
            loanDate.setDate(loanDate.getDate() + daysToAdd);
            // setting to the desired week of the month
            newDay = loanDate.getDate() + 7 * loan.frequency_week_of_month;
        }

        loanDate.setDate(newDay);
    }

    while (loanDate <= toDate && loan_amount > 0) {
        const interest = calculateInterest(
            loan_amount,
            loan.loan_interest_rate,
            loan.loan_interest_frequency_type,
        );
        const adjustedLoanAmount = loan_amount + interest;
        const amount = Math.min(loan.loan_plan_amount, adjustedLoanAmount);
        const subsidizedAmount = amount - amount * loan.loan_subsidized;

        const newTransaction: GeneratedTransaction = {
            loan_id: loan.loan_id,
            title: loan.loan_title + ' loan to ' + loan.loan_recipient,
            description: loan.loan_description,
            date: new Date(loanDate),
            amount: -parseFloat(subsidizedAmount.toFixed(2)),
            tax_rate: 0,
            total_amount: -parseFloat(subsidizedAmount.toFixed(2)),
        };

        if (loanDate > new Date()) {
            if (fromDate > loanDate) {
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
    toDate: Date,
    fromDate: Date,
): { fullyPaidBackDate?: string } => {
    const generateDateFn = (currentDate: Date, loan: Loan): Date => {
        const newDate: Date = currentDate;
        newDate.setDate(
            newDate.getDate() + (loan.frequency_type_variable || 1),
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
    toDate: Date,
    fromDate: Date,
): { fullyPaidBackDate?: string } => {
    let monthsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, loan: Loan): Date => {
        const loanDate: Date = new Date(loan.loan_begin_date);

        // advance by number of months specified in frequency_type_variable or by 1 month if not set
        loanDate.setMonth(
            loanDate.getMonth() +
                monthsIncremented +
                (loan.frequency_type_variable || 1),
        );

        if (
            loan.frequency_day_of_week !== null &&
            loan.frequency_day_of_week !== undefined
        ) {
            let newDay: number;

            if (
                loan.frequency_day_of_week !== null &&
                loan.frequency_day_of_week !== undefined
            ) {
                let daysUntilNextFrequency: number =
                    (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
                daysUntilNextFrequency =
                    daysUntilNextFrequency === 0 ? 7 : daysUntilNextFrequency;
                newDay = loanDate.getDate() + daysUntilNextFrequency;
            }

            if (
                loan.frequency_week_of_month !== null &&
                loan.frequency_week_of_month !== undefined
            ) {
                // first day of the month
                loanDate.setDate(1);
                const daysToAdd =
                    (7 + loan.frequency_day_of_week - loanDate.getDay()) % 7;
                // setting to the first occurrence of the desired day of week
                loanDate.setDate(loanDate.getDate() + daysToAdd);
                // setting to the desired week of the month
                newDay = loanDate.getDate() + 7 * loan.frequency_week_of_month;
            }

            loanDate.setDate(newDay);
        }

        monthsIncremented += loan.frequency_type_variable || 1;

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
    loan: Loan,
    toDate: Date,
    fromDate: Date,
): { fullyPaidBackDate?: string } => {
    const loanDate: Date = new Date(loan.loan_begin_date);

    if (loan.frequency_day_of_week) {
        const startDay: number = loanDate.getDay();
        const frequency_day_of_week: number = loan.frequency_day_of_week;

        loanDate.setDate(
            loanDate.getDate() + ((frequency_day_of_week + 7 - startDay) % 7),
        );
    }

    const generateDateFn = (currentDate: Date, loan: Loan): Date => {
        const newDate: Date = currentDate;
        newDate.setDate(
            newDate.getDate() + 7 * (loan.frequency_type_variable || 1),
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
    toDate: Date,
    fromDate: Date,
): { fullyPaidBackDate?: string } => {
    let yearsIncremented: number = 0;
    const generateDateFn = (currentDate: Date, loan: Loan): Date => {
        const loanDate: Date = new Date(loan.loan_begin_date);
        loanDate.setFullYear(
            loanDate.getFullYear() +
                yearsIncremented +
                (loan.frequency_type_variable || 1),
        );

        if (
            loan.frequency_month_of_year !== null &&
            loan.frequency_month_of_year !== undefined
        ) {
            loanDate.setMonth(loan.frequency_month_of_year);
        }

        if (
            loan.frequency_day_of_week !== null &&
            loan.frequency_day_of_week !== undefined
        ) {
            const daysToAdd: number =
                (7 - loanDate.getDay() + loan.frequency_day_of_week) % 7;
            loanDate.setDate(loanDate.getDate() + daysToAdd); // this is the first occurrence of the day_of_week

            if (
                loan.frequency_week_of_month !== null &&
                loan.frequency_week_of_month !== undefined
            ) {
                // add the number of weeks, but check if it overflows into the next month
                const proposedDate = new Date(loanDate.getTime());
                proposedDate.setDate(
                    proposedDate.getDate() + 7 * loan.frequency_week_of_month,
                );

                if (proposedDate.getMonth() === loanDate.getMonth()) {
                    // it's in the same month, so it's a valid date
                    loanDate.setDate(proposedDate.getDate());
                } else {
                    // it's not in the same month, so don't change newDate
                }
            }
        }
        yearsIncremented += loan.frequency_type_variable || 1;

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
