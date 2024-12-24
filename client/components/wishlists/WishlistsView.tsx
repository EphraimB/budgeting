"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Wishlist } from "@/app/types/types";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import WishlistsActionsMenu from "./WishlistsActionsMenu";
import Link from "next/link";

function WishlistsView({
  wishlist,
  setWishlistModes,
}: {
  wishlist: Wishlist;
  setWishlistModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleClick}
        aria-controls={open ? "wishlist-action-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <WishlistsActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setWishlistModes={setWishlistModes}
        wishlistId={wishlist.id}
      />
      <CardHeader title={wishlist.title} subheader={wishlist.description} />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${wishlist.amount.toFixed(2)} for this item{" "}
          {wishlist.dateCanPurchase
            ? "on " +
              dayjs(wishlist.dateCanPurchase).format("dddd MMMM D, YYYY h:mm A")
            : "at a later date"}
          .
        </Typography>
        {wishlist.urlLink && (
          <>
            <br />
            <Link href={wishlist.urlLink} target="_blank">
              <Typography variant="body2">View wishlist item here</Typography>
            </Link>
          </>
        )}
      </CardContent>
    </>
  );
}

export default WishlistsView;
