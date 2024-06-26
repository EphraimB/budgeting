import { Expense, Loan, Tax } from "@/app/types/types";
import dayjs, { Dayjs } from "dayjs";

export const getOrdinalSuffix = (day: number) => {
  switch (day) {
    case 1:
    case 21:
    case 31:
      return "st";
    case 2:
    case 22:
      return "nd";
    case 3:
    case 23:
      return "rd";
    default:
      return "th";
  }
};

export const getFrequency = (row: any): string => {
  let expenseFrequency;

  switch (row.frequency_type) {
    case 0: // Daily
      if (row.frequency_type_variable === 1) expenseFrequency = "daily";
      else expenseFrequency = "every " + row.frequency_type_variable + " days";

      break;
    case 1: // Weekly
      if (row.frequency_type_variable === 1)
        expenseFrequency = `weekly ${
          row.frequency_day_of_week !== null
            ? `on ${dayjs(row.begin_date)
                .day(row.frequency_day_of_week)
                .format("dddd")}`
            : ""
        }`;
      else {
        expenseFrequency = `every ${row.frequency_type_variable}
          weeks ${
            row.frequency_day_of_week !== null
              ? `on ${dayjs(
                  dayjs(row.begin_date).day(row.frequency_day_of_week)
                ).format("dddd")}`
              : ""
          }`;
      }

      break;
    case 2: // Monthly
      if (row.frequency_type_variable === 1) {
        const dayOfMonth = dayjs(row.begin_date).format("D");
        expenseFrequency = `monthly on the ${dayOfMonth}${
          dayOfMonth.endsWith("1")
            ? "st"
            : dayOfMonth.endsWith("2")
            ? "nd"
            : dayOfMonth.endsWith("3")
            ? "rd"
            : "th"
        }`;
      } else {
        const dayOfMonth = dayjs(row.begin_date).format("D");
        expenseFrequency = `every ${
          row.frequency_type_variable
        } months on the ${dayOfMonth}${
          dayOfMonth.endsWith("1")
            ? "st"
            : dayOfMonth.endsWith("2")
            ? "nd"
            : dayOfMonth.endsWith("3")
            ? "rd"
            : "th"
        }`;
      }

      if (row.frequency_day_of_month) {
        expenseFrequency = `monthly on the ${row.frequency_day_of_month}`;
      } else if (row.frequency_day_of_week) {
        expenseFrequency = `monthly on the ${
          row.frequency_week_of_month === 0
            ? "first"
            : row.frequency_week_of_month === 1
            ? "second"
            : row.frequency_week_of_month === 2
            ? "third"
            : row.frequency_week_of_month === 3
            ? "fourth"
            : "last"
        } ${dayjs(row.frequency_day_of_week).format("dddd")}`;
      }

      break;
    case 3: // Yearly
      if (row.frequency_type_variable === 1)
        expenseFrequency = `yearly on ${dayjs(row.begin_date).format(
          "MMMM D"
        )}`;
      else
        expenseFrequency = `every ${
          row.frequency_type_variable
        } years on ${dayjs(row.begin_date).format("MMMM D")}`;

      break;
    default:
      expenseFrequency = "Unknown";
  }

  return expenseFrequency;
};

export const findLatestFullyPaidBackDate = (
  loans: Loan[]
): Dayjs | string | null => {
  if (loans.length === 0) return null; // Return null if no loans
  // Check if any loan has not been fully paid back
  if (loans.some((loan: Loan) => loan.fully_paid_back === null)) {
    return "not in the near future";
  }

  // Convert all fully_paid_back dates to Day.js objects and find the max
  let latest = dayjs(loans[0].fully_paid_back);
  loans.forEach((loan: Loan) => {
    const fullyPaidBackDate = dayjs(loan.fully_paid_back);
    if (fullyPaidBackDate.isAfter(latest)) {
      latest = fullyPaidBackDate;
    }
  });

  latest ? latest.format("dddd, MMMM D, YYYY h:mm A") : null;

  return latest;
};

export const getTaxRate = (taxes: Tax[], tax_id: number | null) => {
  if (!tax_id) return 0;

  const tax = taxes.find((tax) => tax.id === tax_id);
  return tax ? tax.rate : 0;
};

// Calculate total expenses including taxes
export const calculateTotalWithTaxes = (
  transaction: any,
  taxes: Tax[]
): number => {
  const totalWithTaxes = transaction.reduce((acc: number, transaction: any) => {
    const taxRate = getTaxRate(taxes, transaction.tax_id);
    const taxAmount = transaction.amount * taxRate;
    return acc + transaction.amount + taxAmount;
  }, 0);

  return totalWithTaxes;
};

// Calculate total expenses including subsidies
export const calculateTotalWithSubsidies = (
  expenses: Expense[],
  taxes: Tax[]
): number => {
  const totalWithTaxesAndSubsidies = expenses.reduce(
    (acc: number, expense: Expense) => {
      const taxRate = getTaxRate(taxes, expense.tax_id);
      const taxAmount = expense.amount * taxRate;
      const subsidyAmount = expense.subsidized || 0; // Add subsidy amount

      return acc + expense.amount + taxAmount - subsidyAmount; // Subtract subsidy from total
    },
    0
  );

  return totalWithTaxesAndSubsidies;
};
