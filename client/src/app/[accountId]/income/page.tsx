import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Income } from "@/app/types/types";
import IncomeCards from "../../../../components/incomes/IncomeCards";

async function getIncome(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/income?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch income");
  }

  return res.json();
}

async function IncomePage({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const incomes: Income[] = await getIncome(accountId);

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Income
      </Typography>
      <br />
      {incomes.length === 0 ? (
        <Typography variant="h6">You have no income!</Typography>
      ) : (
        // Sum of incomes
        <Typography variant="h6">
          All {incomes.length} of your incomes are $
          {incomes
            .reduce((acc: number, income: Income) => acc + income.amount, 0)
            .toFixed(2)}
          .
        </Typography>
      )}
      <IncomeCards accountId={accountId} incomes={incomes} />
    </Stack>
  );
}

export default IncomePage;
