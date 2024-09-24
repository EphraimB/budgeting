import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Account, Transfer } from "@/app/types/types";
import TransferCards from "../../../../components/transfers/TransfersCards";

async function getTransfers(accountId: number) {
  const res = await fetch(
    `http://server:5001/api/transfers?accountId=${accountId}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transfers");
  }

  return res.json();
}

async function getAccounts(accountId: number) {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    throw new Error("Failed to fetch accounts");
  }

  const data = await res.json();
  return data.filter((account: Account) => account.id !== accountId);
}

async function Transfers({ params }: { params: { accountId: string } }) {
  const accountId = parseInt(params.accountId);

  const transfers: Transfer[] = await getTransfers(accountId);
  const accounts: Account[] = await getAccounts(accountId);

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Transfers
      </Typography>
      <br />
      {transfers.length === 0 ? (
        <Typography variant="h6">You have no transfers</Typography>
      ) : (
        // Sum of expenses
        <Typography variant="h6">
          You have {transfers.length} transfers
        </Typography>
      )}
      <TransferCards
        accountId={accountId}
        transfers={transfers}
        accounts={accounts}
      />
    </Stack>
  );
}

export default Transfers;