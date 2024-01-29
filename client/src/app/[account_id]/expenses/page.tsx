import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Expense, Tax } from "@/app/types/types";
import ExpensesCards from "../../../../components/ExpensesCards";

async function getExpenses(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/expenses?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function getTaxes(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/taxes?account_id=${account_id}`
  );

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
  const add = params.add;

  const expenses = await getExpenses(account_id);
  const taxes = await getTaxes(account_id);

  // Function to find tax rate by tax_id
  const getTaxRate = (tax_id: number | null) => {
    if (!tax_id) return 0;

    const tax = taxes.find((tax: Tax) => tax.id === tax_id);
    return tax ? tax.rate : 0;
  };

  // Calculate total expenses including taxes
  const totalWithTaxes = expenses.reduce((acc: number, expense: Expense) => {
    const taxRate = getTaxRate(expense.tax_id);
    const taxAmount = expense.amount * taxRate;
    return acc + expense.amount + taxAmount;
  }, 0);

  const totalWithSubsidies = expenses.reduce(
    (acc: number, expense: Expense) => {
      const amountAfterSubsidy =
        totalWithTaxes - totalWithTaxes * expense.subsidized;
      return acc + amountAfterSubsidy;
    },
    0
  );

  return (
    <Stack>
      <Card
        sx={{
          p: 2,
          margin: "auto",
          maxWidth: 250,
          background:
            "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/img/back-to-transactions.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          color: "white",
        }}
      >
        <Link
          href={`/${account_id}`}
          as={`/${account_id}`}
          style={{ color: "inherit", textDecoration: "inherit" }}
        >
          <CardHeader title="< Transactions" />
          <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="body2" color="white">
              Go back to transactions.
            </Typography>
          </CardContent>
        </Link>
      </Card>
      <Typography variant="h4" component="h2">
        Expenses
      </Typography>
      <br />
      {expenses.length === 0 ? (
        <Typography variant="h6">You have no expenses!</Typography>
      ) : (
        // Sum of expenses
        <Typography variant="h6">
          All of your expenses are ${totalWithSubsidies.toFixed(2)} including
          taxes and subsidies.
        </Typography>
      )}
      <ExpensesCards expenses={expenses} taxes={taxes} />
    </Stack>
  );
}

export default Expenses;
