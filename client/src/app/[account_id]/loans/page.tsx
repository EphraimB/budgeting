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
