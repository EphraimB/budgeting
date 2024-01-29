import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Expense } from "@/app/types/types";
import ExpensesView from "../../../../components/ExpensesView";

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

async function Expenses({ params }: { params: { account_id: string } }) {
  const account_id = parseInt(params.account_id);

  const expenses = await getExpenses(account_id);
  const taxes = await getTaxes(account_id);

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
      <Stack direction="row" spacing={2}>
        {expenses.map((expense: Expense) => (
          <Card sx={{ maxWidth: "18rem" }}>
            <ExpensesView expense={expense} taxes={taxes} />
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default Expenses;
