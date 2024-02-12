import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Expense, Tax } from "@/app/types/types";
import ExpensesCards from "../../../../components/ExpensesCards";
import DataManagementWidgets from "../../../../components/DataManagementWidgets";

async function getExpenses(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getTaxes() {
  const res = await fetch("http://server:5001/api/taxes");

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function Expenses({
  params,
}: {
  params: { account_id: string; add: boolean };
}) {
  const account_id = parseInt(params.account_id);

  const expenses: Expense[] = await getExpenses(account_id);
  const taxes: Tax[] = await getTaxes();

  // Function to find tax rate by tax_id
  const getTaxRate = (tax_id: number | null) => {
    if (!tax_id) return 0;

    const tax = taxes.find((tax: Tax) => tax.id === tax_id);
    return tax ? tax.rate : 0;
  };

  // Calculate total after applying subsidies to each expense individually
  const totalWithSubsidies = expenses.reduce(
    (acc: number, expense: Expense) => {
      const taxRate = getTaxRate(expense.tax_id);
      const taxAmount = expense.amount * taxRate;
      const totalExpenseWithTax = expense.amount + taxAmount;
      const amountAfterSubsidy =
        totalExpenseWithTax - totalExpenseWithTax * expense.subsidized; // Apply subsidy to each expense
      return acc + amountAfterSubsidy; // Sum the amounts after subsidy
    },
    0
  );

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Expenses
      </Typography>
      <br />
      {expenses.length === 0 ? (
        <Typography variant="h6">You have no expenses!</Typography>
      ) : (
        // Sum of expenses
        <Typography variant="h6">
          All {expenses.length} of your expenses are $
          {totalWithSubsidies.toFixed(2)} including taxes and subsidies.
        </Typography>
      )}
      <ExpensesCards
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
      />
    </Stack>
  );
}

export default Expenses;
