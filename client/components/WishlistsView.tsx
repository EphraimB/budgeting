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
        wishlist_id={wishlist.id}
      />
      <Link
        href={wishlist.wishlist_url_link}
        target="_blank"
        style={{ color: "inherit", textDecoration: "none" }}
      >
        <CardHeader
          title={wishlist.wishlist_title}
          subheader={wishlist.wishlist_description}
        />
        <CardContent>
          <Typography variant="body2">
            You will be charged ${wishlist.wishlist_amount} for this item{" "}
            {wishlist.wishlist_date_can_purchase
              ? "on " +
                dayjs(wishlist.wishlist_date_can_purchase).format(
                  "dddd MMMM D, YYYY h:mm A"
                )
              : "in more than a year"}
            .
          </Typography>
        </CardContent>
      </Link>
    </>
  );
}

export default WishlistsView;
