"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { Tax, Wishlist } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import WishlistDelete from "./WishlistDelete";
import WishlistEdit from "./WishlistEdit";
import NewWishlistForm from "./NewWishlistForm";
import WishlistsView from "./WishlistsView";

function WishlistsCards({
  accountId,
  wishlists,
  taxes,
}: {
  accountId: number;
  wishlists: Wishlist[];
  taxes: Tax[];
}) {
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [wishlistModes, setWishlistModes] = useState<Record<number, string>>(
    {}
  );

  return (
    <>
      <Grid container spacing={2}>
        {showWishlistForm && (
          <Grid key="new-wishlist" item>
            <NewWishlistForm
              accountId={accountId}
              taxes={taxes}
              setShowWishlistForm={setShowWishlistForm}
              totalItems={wishlists.length}
            />
          </Grid>
        )}

        {wishlists.map((wishlist: Wishlist) => (
          <Grid key={wishlist.id} item>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {wishlistModes[wishlist.id] === "delete" ? (
                <WishlistDelete
                  wishlist={wishlist}
                  setWishlistModes={setWishlistModes}
                />
              ) : wishlistModes[wishlist.id] === "edit" ? (
                <WishlistEdit
                  accountId={accountId}
                  wishlist={wishlist}
                  taxes={taxes}
                  setWishlistModes={setWishlistModes}
                  totalItems={wishlists.length}
                />
              ) : (
                <WishlistsView
                  wishlist={wishlist}
                  setWishlistModes={setWishlistModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowWishlistForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default WishlistsCards;
