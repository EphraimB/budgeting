import Stack from "@mui/material/Stack";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Link from "next/link";
import Typography from "@mui/material/Typography";
import { Loan } from "@/app/types/types";
import LoansCards from "../../../../components/LoansCards";

async function getLoans(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/loans?account_id=${account_id}`
  );

  if (!res.ok) {
    // open alert
  }

  return res.json();
}

async function Loans({ params }: { params: { account_id: string } }) {
  const account_id = parseInt(params.account_id);

  const loans = await getLoans(account_id);

  const totalLoansAmount = loans.reduce((acc: number, loan: Loan): number => {
    return acc + loan.amount;
  }, 0);

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
        Loans
      </Typography>
      <br />
      {loans.length === 0 ? (
        <Typography variant="h6">You have no loans!</Typography>
      ) : (
        // Sum of expenses
        <Typography variant="h6">
          All {loans.length} of your loans are ${totalLoansAmount.toFixed(2)}
        </Typography>
      )}
      <LoansCards account_id={account_id} loans={loans} />
    </Stack>
  );
}

export default Loans;
