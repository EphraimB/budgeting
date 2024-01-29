import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import ExpensesTable from "../../../../components/ExpensesTable";
import { Expense } from "@/app/types/types";
import { getFrequency } from "../../../../utils/helperFunctions";
import dayjs from "dayjs";

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
      {/* <ExpensesTable
        account_id={account_id}
        expenses={expenses}
        taxes={taxes}
      /> */}
      <Typography variant="h4" component="h2">
        Expenses
      </Typography>
      <Stack direction="row" spacing={2}>
        {expenses.map((expense: Expense) => (
          <Card sx={{ maxWidth: "18rem" }}>
            <CardHeader title={expense.title} subheader={expense.description} />
            <CardContent>
              <Typography variant="body2">
                You will be charged ${expense.amount} next on{" "}
                {dayjs(expense.next_date).format("dddd MMMM D, YYYY h:mm A")}
              </Typography>
              <Typography variant="body2">
                You get charged {getFrequency(expense)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export default Expenses;
