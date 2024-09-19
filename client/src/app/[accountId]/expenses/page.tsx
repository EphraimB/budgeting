import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Expense, Tax } from "@/app/types/types";
import ExpensesCards from "../../../../components/expenses/ExpensesCards";

async function getExpenses(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch expenses");
  }

  return res.json();
}

async function getTaxes() {
  const res = await fetch("http://server:5001/api/taxes");

  if (!res.ok) {
    throw new Error("Failed to fetch taxes");
  }

  return res.json();
}

async function Expenses({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const expenses: Expense[] = await getExpenses(accountId);
  const taxes: Tax[] = await getTaxes();

  // Function to find tax rate by tax_id
  const getTaxRate = (taxId: number | null) => {
    if (!taxId) return 0;

    const tax = taxes.find((tax: Tax) => tax.id === taxId);
    return tax ? tax.rate : 0;
  };

  // Calculate total after applying subsidies to each expense individually
  const totalWithSubsidies = expenses.reduce(
    (acc: number, expense: Expense) => {
      const taxRate = getTaxRate(expense.taxId);
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
      <ExpensesCards accountId={accountId} expenses={expenses} taxes={taxes} />
    </Stack>
  );
}

export default Expenses;
