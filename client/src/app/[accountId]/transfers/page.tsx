import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Account, Transfer } from "@/app/types/types";
import TransferCards from "../../../../components/transfers/TransfersCards";

async function getTransfers(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/transfers?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transfers");
  }

  return res.json();
}

async function getAccounts(account_id: number) {
  const res = await fetch("http://server:5001/api/accounts");

  if (!res.ok) {
    throw new Error("Failed to fetch accounts");
  }

  const data = await res.json();
  return data.filter((account: Account) => account.account_id !== account_id);
}

async function Transfers({ params }: { params: { account_id: string } }) {
  const account_id = parseInt(params.account_id);

  const transfers: Transfer[] = await getTransfers(account_id);
  const accounts: Account[] = await getAccounts(account_id);

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
        account_id={account_id}
        transfers={transfers}
        accounts={accounts}
      />
    </Stack>
  );
}

export default Transfers;
