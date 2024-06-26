"use client";

import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function PayrollTaxesActionsMenu({
  anchorEl,
  open,
  handleClose,
  setPayrollTaxModes,
  payroll_tax_id,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setPayrollTaxModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  payroll_tax_id: number;
}) {
  const handleDelete = () => {
    setPayrollTaxModes((prevModes: any) => ({
      ...prevModes,
      [payroll_tax_id]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setPayrollTaxModes((prevModes: any) => ({
      ...prevModes,
      [payroll_tax_id]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="payroll-tax-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "payroll-tax-action-buttons",
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

export default PayrollTaxesActionsMenu;
