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
        wishlist_id={wishlist.id}
      />
      <CardHeader
        title={wishlist.wishlist_title}
        subheader={wishlist.wishlist_description}
      />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${wishlist.wishlist_amount} for this item on{" "}
          {dayjs(wishlist.wishlist_date_can_purchase).format(
            "dddd MMMM D, YYYY h:mm A"
          )}
          .
        </Typography>
      </CardContent>
    </>
  );
}

export default WishlistsView;
