"use client";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function TaxActionsMenu({
  anchorEl,
  open,
  handleClose,
  setTaxModes,
  tax_id,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setTaxModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  tax_id: number;
}) {
  const handleDelete = () => {
    setTaxModes((prevModes: any) => ({
      ...prevModes,
      [tax_id]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setTaxModes((prevModes: any) => ({
      ...prevModes,
      [tax_id]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="tax-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "tax-action-buttons",
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

export default TaxActionsMenu;
