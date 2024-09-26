"use client";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TransfersActionsMenu({
  anchorEl,
  open,
  handleClose,
  setTransferModes,
  transferId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setTransferModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  transferId: number;
}) {
  const handleDelete = () => {
    setTransferModes(
      (prevModes: React.SetStateAction<Record<number, string>>) => ({
        ...prevModes,
        [transferId]: "delete",
      })
    );

    handleClose();
  };

  const handleEdit = () => {
    setTransferModes(
      (prevModes: React.SetStateAction<Record<number, string>>) => ({
        ...prevModes,
        [transferId]: "edit",
      })
    );

    handleClose();
  };

  return (
    <Menu
      id="transfer-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "transfer-action-buttons",
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

export default TransfersActionsMenu;
