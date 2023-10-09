import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function AccountActionsMenu({
  anchorEl,
  open,
  handleClick,
  handleClose,
  setAccountModes,
  accountId,
}: {
  anchorEl: any;
  open: any;
  handleClick: any;
  handleClose: any;
  setAccountModes: any;
  accountId: number;
}) {
  const handleDelete = () => {
    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [accountId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setAccountModes((prevModes: any) => ({
      ...prevModes,
      [accountId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="account-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "account-action-buttons",
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

export default AccountActionsMenu;
