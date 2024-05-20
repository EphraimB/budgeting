import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Tax, Wishlist } from "@/app/types/types";
import WishlistsCards from "../../../../components/WishlistsCards";

async function getWishlists(account_id: number) {
  const res = await fetch(
    `http://server:5001/api/wishlists?account_id=${account_id}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch wishlists");
  }

  return res.json();
}

async function getTaxes() {
  const res = await fetch("http://server:5001/api/taxes");

  if (!res.ok) {
    throw new Error("Failed to fetch taxes");
  }

  return res.json();
}

async function Wishlists({ params }: { params: { account_id: string } }) {
  const account_id = parseInt(params.account_id);

  const wishlists: Wishlist[] = await getWishlists(account_id);
  const taxes: Tax[] = await getTaxes();

  return (
    <Stack>
      <Typography variant="h4" component="h2">
        Wishlists
      </Typography>
      <br />
      {wishlists.length === 0 ? (
        <Typography variant="h6">You have nothing on your wishlist</Typography>
      ) : (
        // Sum of expenses
        <Typography variant="h6">
          You have {wishlists.length} items on your wishlist
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

export default Wishlists;
