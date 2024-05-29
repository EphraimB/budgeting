import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Transfer } from "@/app/types/types";
import WishlistsCards from "../../../../components/WishlistsCards";

async function getTransfers(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/transfers?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch transfers");
  }

  return res.json();
}

async function Transfers({ params }: { params: { account_id: string } }) {
  const account_id = parseInt(params.account_id);

  const transfers: Transfer[] = await getTransfers(account_id);

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
      <WishlistsCards
        account_id={account_id}
        wishlists={wishlists}
        taxes={taxes}
      />
    </Stack>
  );
}

export default Transfers;
