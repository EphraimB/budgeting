"use client";

import { Wishlist } from "@/app/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { deleteWishlist } from "../services/actions/wishlist";

function WishlistDelete({
  wishlist,
  setWishlistModes,
}: {
  wishlist: Wishlist;
  setWishlistModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteWishlist(wishlist.id);

      // Show success message
      showSnackbar(
        `Wishlist "${wishlist.wishlist_title}" deleted successfully`
      );
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(
        `Error deleting wishlist "${wishlist.wishlist_title}"`,
        "error"
      );
    }
    setWishlistModes((prev) => ({ ...prev, [wishlist.id]: "view" }));
  };

  const handleCancel = () => {
    setWishlistModes((prev) => ({ ...prev, [wishlist.id]: "view" }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleCancel}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <br />
      <Typography variant="subtitle1" component="h3">
        Delete "{wishlist.wishlist_title}"?
      </Typography>
      <Button color="error" variant="contained" onClick={handleDelete}>
        Delete
      </Button>
      <Button color="primary" variant="contained" onClick={handleCancel}>
        Cancel
      </Button>
    </Box>
  );
}

export default WishlistDelete;
