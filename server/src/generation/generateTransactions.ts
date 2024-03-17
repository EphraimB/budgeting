import { type Request, type Response, type NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
    generateDailyIncome,
    generateWeeklyIncome,
    generateMonthlyIncome,
    generateYearlyIncome,
} from './generateIncome.js';
import {
    generateDailyExpenses,
    generateWeeklyExpenses,
    generateMonthlyExpenses,
    generateYearlyExpenses,
} from './generateExpenses.js';
import {
    generateDailyLoans,
    generateWeeklyLoans,
    generateMonthlyLoans,
    generateYearlyLoans,
} from './generateLoans.js';
import generatePayrollTransactions from './generatePayrolls.js';
import {
    generateDailyTransfers,
    generateWeeklyTransfers,
    generateMonthlyTransfers,
    generateYearlyTransfers,
} from './generateTransfers.js';
import { generateCommuteExpenses } from './generateCommuteExpenses.js';
import generateWishlists from './generateWishlists.js';
import calculateBalances from './calculateBalances.js';
import {
    type CurrentBalance,
    type Expense,
    type GeneratedTransaction,
    type Income,
    type Loan,
    type Payroll,
    type Transaction,
    type Transfer,
    type Wishlist,
} from '../types/types.js';
import { executeQuery } from '../utils/helperFunctions.js';
import { accountQueries } from '../models/queryData.js';
import dayjs, { type Dayjs } from 'dayjs';

const fullyPaidBackDates: Record<number, string | null> = {}; // map of loan_id to fullyPaidBackDate

const generate = async (
    request: Request,
    response: Response,
    next: NextFunction,
    account_id: number,
    job_id: number,
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    currentBalance: any,
): Promise<void> => {
    const fromDate: Dayjs = dayjs(request.query.from_date as string);
    const toDate: Dayjs = dayjs(request.query.to_date as string);

    request.transaction
        .filter((tran) => tran.account_id === account_id)
        .forEach((account) =>
            account.transactions.forEach((transaction: Transaction) =>
                transactions.push({
                    id: uuidv4(),
                    transaction_id: transaction.transaction_id,
                    title: transaction.transaction_title,
                    description: transaction.transaction_description,
                    date: dayjs(transaction.date_created),
                    date_modified: dayjs(transaction.date_modified),
                    amount: transaction.transaction_amount,
                    tax_rate: transaction.transaction_tax_rate ?? 0,
                    total_amount:
                        transaction.transaction_amount -
                        transaction.transaction_amount *
                            (transaction.transaction_tax_rate ?? 0),
                }),
            ),
        );

    request.income
        .filter((inc) => inc.account_id === account_id)
        .forEach((account) => {
            account.income.forEach((income: Income) => {
                if (income.frequency_type === 0) {
                    generateDailyIncome(
                        transactions,
                        skippedTransactions,
                        income,
                        toDate,
                        fromDate,
                    );
                } else if (income.frequency_type === 1) {
                    generateWeeklyIncome(
                        transactions,
                        skippedTransactions,
                        income,
                        toDate,
                        fromDate,
                    );
                } else if (income.frequency_type === 2) {
                    generateMonthlyIncome(
                        transactions,
                        skippedTransactions,
                        income,
                        toDate,
                        fromDate,
                    );
                } else if (income.frequency_type === 3) {
                    generateYearlyIncome(
                        transactions,
                        skippedTransactions,
                        income,
                        toDate,
                        fromDate,
                    );
                }
            });
        });

    request.expenses
        .filter((exp) => exp.account_id === account_id)
        .forEach((account) => {
            account.expenses.forEach((expense: Expense) => {
                if (expense.frequency_type === 0) {
                    generateDailyExpenses(
                        transactions,
                        skippedTransactions,
                        expense,
                        toDate,
                        fromDate,
                    );
                } else if (expense.frequency_type === 1) {
                    generateWeeklyExpenses(
                        transactions,
                        skippedTransactions,
                        expense,
                        toDate,
                        fromDate,
                    );
                } else if (expense.frequency_type === 2) {
                    generateMonthlyExpenses(
                        transactions,
                        skippedTransactions,
                        expense,
                        toDate,
                        fromDate,
                    );
                } else if (expense.frequency_type === 3) {
                    generateYearlyExpenses(
                        transactions,
                        skippedTransactions,
                        expense,
                        toDate,
                        fromDate,
                    );
                }
            });
        });

    request.payrolls
        .filter((pyrl) => pyrl.account_id === account_id)
        .forEach((account) => {
            account.jobs.forEach((job: any) => {
                job.payrolls.forEach((payroll: Payroll) => {
                    generatePayrollTransactions(
                        transactions,
                        skippedTransactions,
                        job.job_name,
                        payroll,
                        fromDate,
                    );
                });
            });
        });

    request.loans
        .filter((lns) => lns.account_id === account_id)
        .forEach((account) => {
            let loanResult: { fullyPaidBackDate?: string | null };

            account.loan.forEach((loan: any) => {
                if (loan.frequency_type === 0) {
                    loanResult = generateDailyLoans(
                        transactions,
                        skippedTransactions,
                        loan,
                        toDate,
                        fromDate,
                    );
                } else if (loan.frequency_type === 1) {
                    loanResult = generateWeeklyLoans(
                        transactions,
                        skippedTransactions,
                        loan,
                        toDate,
                        fromDate,
                    );
                } else if (loan.frequency_type === 2) {
                    loanResult = generateMonthlyLoans(
                        transactions,
                        skippedTransactions,
                        loan,
                        toDate,
                        fromDate,
                    );
                } else if (loan.frequency_type === 3) {
                    loanResult = generateYearlyLoans(
                        transactions,
                        skippedTransactions,
                        loan,
                        toDate,
                        fromDate,
                    );
                }

                fullyPaidBackDates[loan.loan_id] = loanResult.fullyPaidBackDate
                    ? loanResult.fullyPaidBackDate
                    : null;
            });
        });

    request.transfers
        .filter((trnfrs) => trnfrs.account_id === account_id)
        .forEach((account) => {
            account.transfer.forEach((transfer: Transfer) => {
                if (transfer.frequency_type === 0) {
                    generateDailyTransfers(
                        transactions,
                        skippedTransactions,
                        transfer,
                        toDate,
                        fromDate,
                        account_id,
                    );
                } else if (transfer.frequency_type === 1) {
                    generateWeeklyTransfers(
                        transactions,
                        skippedTransactions,
                        transfer,
                        toDate,
                        fromDate,
                        account_id,
                    );
                } else if (transfer.frequency_type === 2) {
                    generateMonthlyTransfers(
                        transactions,
                        skippedTransactions,
                        transfer,
                        toDate,
                        fromDate,
                        account_id,
                    );
                } else if (transfer.frequency_type === 3) {
                    generateYearlyTransfers(
                        transactions,
                        skippedTransactions,
                        transfer,
                        toDate,
                        fromDate,
                        account_id,
                    );
                }
            });
        });

    request.commuteExpenses
        .filter((cmte) => cmte.account_id === account_id)
        .forEach((account) => {
            account.commute_expenses.forEach((commuteExpense: any) => {
                const fareCappingInfo: any = account.fare_capping.find(
                    (fareCapping: any) =>
                        fareCapping.commute_system_id ===
                        commuteExpense.commute_system_id,
                );

                let allRidesForSystem = generateCommuteExpenses(
                    commuteExpense,
                    toDate,
                    fromDate,
                );

                // Helper function to reset daily cap
                const isNextDay = (
                    currentDate: Dayjs,
                    nextDate: Dayjs,
                ): boolean => {
                    return currentDate.diff(nextDate, 'day') !== 0;
                };

                // Helper function to reset monthly cap
                const isNextMonth = (
                    currentDate: Dayjs,
                    nextDate: Dayjs,
                ): boolean => {
                    return currentDate.diff(nextDate, 'month') !== 0;
                };

                // Apply fare capping logic
                const applyFareCapping = (
                    rides: GeneratedTransaction[],
                    fareCappingInfo: any,
                ): GeneratedTransaction[] => {
                    // Clone the rides array to avoid mutating the original
                    const processedRides = [...rides];

                    // Sort rides by date
                    processedRides.sort((a, b) => a.date.diff(b.date));

                    let current_spent = 0;
                    let firstRideDate: Dayjs | null = null;

                    for (let i = 0; i < processedRides.length; i++) {
                        let ride = processedRides[i];

                        current_spent += Math.abs(ride.amount);

                        switch (fareCappingInfo.fare_cap_duration) {
                            case 0: // Daily cap
                                if (current_spent > fareCappingInfo.fare_cap) {
                                    const excess =
                                        current_spent -
                                        fareCappingInfo.fare_cap;
                                    ride.amount += excess;
                                    current_spent = fareCappingInfo.fare_cap;
                                }
                                if (
                                    i < processedRides.length - 1 &&
                                    isNextDay(
                                        ride.date,
                                        processedRides[i + 1].date,
                                    )
                                ) {
                                    current_spent = 0;
                                }
                                break;

                            case 1: // Weekly cap
                                if (!firstRideDate) {
                                    firstRideDate = ride.date;
                                }
                                if (current_spent > fareCappingInfo.fare_cap) {
                                    const excess =
                                        current_spent -
                                        fareCappingInfo.fare_cap;
                                    ride.amount += excess;
                                    current_spent = fareCappingInfo.fare_cap;
                                }
                                if (
                                    ride.date.diff(firstRideDate) >=
                                    7 * 24 * 60 * 60 * 1000
                                ) {
                                    current_spent = 0;
                                    firstRideDate = ride.date;
                                }

                                break;

                            case 2: // Monthly cap
                                if (current_spent > fareCappingInfo.fare_cap) {
                                    const excess =
                                        current_spent -
                                        fareCappingInfo.fare_cap;
                                    ride.amount += excess;
                                    current_spent = fareCappingInfo.fare_cap;
                                }
                                if (
                                    i < processedRides.length - 1 &&
                                    isNextMonth(
                                        ride.date,
                                        processedRides[i + 1].date,
                                    )
                                ) {
                                    current_spent = 0;
                                }
                                break;
                        }
                    }
                    return processedRides;
                };

                allRidesForSystem = applyFareCapping(
                    allRidesForSystem,
                    fareCappingInfo,
                );

                // Add capped rides to transactions or skippedTransactions
                allRidesForSystem.forEach((ride: GeneratedTransaction) => {
                    if (ride.date >= fromDate) {
                        transactions.push(ride);
                    } else {
                        skippedTransactions.push(ride);
                    }
                });
            });
        });

    transactions.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

    calculateBalances(transactions.concat(skippedTransactions), currentBalance);

    request.wishlists
        .filter((wslsts) => wslsts.account_id === account_id)
        .forEach((account) => {
            account.wishlist.forEach((wishlist: Wishlist) => {
                generateWishlists(
                    transactions,
                    skippedTransactions,
                    wishlist,
                    fromDate,
                );

                transactions.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

                calculateBalances(
                    transactions.concat(skippedTransactions),
                    currentBalance,
                );
            });
        });
};

/**
 *
 * @param request - The request object
 * @param response - The response object
 * @param next - The next function
 * Generates transactions for the given account and date range
 */
const generateTransactions = async (
    request: Request,
    response: Response,
    next: NextFunction,
): Promise<void> => {
    const account_id: string = request.query.account_id as string;
    const currentBalance: any = request.currentBalance;
    const allTransactions: any[] = [];
    const transactions: GeneratedTransaction[] = [];
    const skippedTransactions: GeneratedTransaction[] = [];

    if (!account_id) {
        const accountResults = await executeQuery(
            accountQueries.getAccounts,
            [],
        );

        for (const account of accountResults) {
            const currentBalanceValue: number = parseFloat(
                currentBalance.find(
                    (balance: CurrentBalance) =>
                        balance.account_id === account.account_id,
                ).account_balance,
            );

            const employee_id = account.employee_id ?? 0;

            await generate(
                request,
                response,
                next,
                account.account_id,
                employee_id,
                transactions,
                skippedTransactions,
                currentBalanceValue,
            );

            allTransactions.push({
                account_id: account.account_id,
                current_balance: currentBalanceValue,
                transactions,
            });
        }
    } else {
        const currentBalanceValue: number = parseFloat(
            currentBalance.find(
                (balance: CurrentBalance) =>
                    balance.account_id === parseInt(account_id),
            ).account_balance,
        );

        const employeeResults = await executeQuery(accountQueries.getAccount, [
            account_id,
        ]);

        const employee_id: number = employeeResults[0].employee_id;

        await generate(
            request,
            response,
            next,
            parseInt(account_id),
            employee_id,
            transactions,
            skippedTransactions,
            currentBalanceValue,
        );

        allTransactions.push({
            account_id: parseInt(account_id),
            current_balance: currentBalanceValue,
            transactions,
        });
    }

    request.transactions = allTransactions;
    request.fullyPaidBackDates = fullyPaidBackDates;

    next();
};

export default generateTransactions;
