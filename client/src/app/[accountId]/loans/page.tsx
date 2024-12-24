import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Loan } from "@/app/types/types";
import LoansCards from "../../../../components/loans/LoansCards";

async function getLoans(accountId: number) {
  try {
    const res = await fetch(
      `http://server:5001/api/loans?accountId=${accountId}`
    );

    if (!res.ok) {
      throw new Error(res.statusText);
    }

    return res.json();
  } catch {
    throw new Error("Failed to fetch loans");
  }
}

async function Loans({ params }: { params: Promise<{ accountId: string }> }) {
  const accountId = parseInt((await params).accountId);

  const loans: Loan[] = await getLoans(accountId);

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
      <LoansCards accountId={accountId} loans={loans} />
    </Stack>
  );
}

export default Loans;
