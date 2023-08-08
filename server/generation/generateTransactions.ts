import { type Request, type Response, type NextFunction } from 'express';
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
import generateWishlists from './generateWishlists.js';
import calculateBalances from './calculateBalances.js';
import {
    type Account,
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

const fullyPaidBackDates: Record<number, string | null> = {}; // map of loan_id to fullyPaidBackDate

const generate = async (
    request: Request,
    response: Response,
    next: NextFunction,
    account_id: number,
    employee_id: number,
    transactions: GeneratedTransaction[],
    skippedTransactions: GeneratedTransaction[],
    currentBalance: any,
): Promise<void> => {
    const fromDate: Date = new Date(request.query.from_date as string);
    const toDate: Date = new Date(request.query.to_date as string);

    request.transaction
        .filter((tran) => tran.account_id === account_id)
        .forEach((account) =>
            account.transactions.forEach((transaction: Transaction) =>
                transactions.push({
                    transaction_id: transaction.transaction_id,
                    title: transaction.transaction_title,
                    description: transaction.transaction_description,
                    date: new Date(transaction.date_created),
                    date_modified: new Date(transaction.date_modified),
                    amount: -transaction.transaction_amount,
                    tax_rate: transaction.transaction_tax_rate ?? 0,
                    total_amount: -(
                        transaction.transaction_amount +
                        transaction.transaction_amount *
                            (transaction.transaction_tax_rate ?? 0)
                    ),
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
        .filter((pyrl) => pyrl.employee_id === employee_id)
        .forEach((employee) => {
            employee.payroll.forEach((payroll: Payroll) => {
                generatePayrollTransactions(
                    transactions,
                    skippedTransactions,
                    payroll,
                    fromDate,
                );
            });
        });

    request.loans
        .filter((lns) => lns.account_id === account_id)
        .forEach((account) => {
            let loanResult: { fullyPaidBackDate?: string | null };

            account.loan.forEach((loan: Loan) => {
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

                if (loan.loan_id !== undefined) {
                    fullyPaidBackDates[loan.loan_id] =
                        loanResult.fullyPaidBackDate !== null &&
                        loanResult.fullyPaidBackDate !== undefined
                            ? loanResult.fullyPaidBackDate
                            : null;
                }
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

    transactions.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

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

                transactions.sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime(),
                );

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

    if (account_id === undefined || account_id === null) {
        const accountResults = await executeQuery(
            accountQueries.getAccounts,
            [],
        );

        accountResults.forEach(async (account: Account) => {
            const currentBalanceValue: number = currentBalance.find(
                (balance: CurrentBalance) =>
                    balance.account_id === account.account_id,
            ).account_balance;

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
        });
    } else {
        const currentBalanceValue: number = currentBalance.find(
            (balance: CurrentBalance) =>
                balance.account_id === parseInt(account_id),
        ).account_balance;

        // Fetch employee_id from account_id
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
