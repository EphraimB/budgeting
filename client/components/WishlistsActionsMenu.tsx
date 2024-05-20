import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function WishlistsActionsMenu({
  anchorEl,
  open,
  handleClose,
  setWishlistModes,
  wishlist_id,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setWishlistModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  wishlist_id: number;
}) {
  const handleDelete = () => {
    setWishlistModes(
      (prevModes: React.SetStateAction<Record<number, string>>) => ({
        ...prevModes,
        [wishlist_id]: "delete",
      })
    );

    handleClose();
  };

  const handleEdit = () => {
    setWishlistModes(
      (prevModes: React.SetStateAction<Record<number, string>>) => ({
        ...prevModes,
        [wishlist_id]: "edit",
      })
    );

    handleClose();
  };

  return (
    <Menu
      id="wishlist-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "wishlist-action-buttons",
      }}
    >
      <MenuItem onClick={handleEdit}>
        <ListItemIcon>
          <EditIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Edit</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDelete}>
        <ListItemIcon>
          <DeleteIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default WishlistsActionsMenu;
