import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function LoanActionsMenu({
  anchorEl,
  open,
  handleClose,
  setLoanModes,
  loanId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setLoanModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  loanId: number;
}) {
  const handleDelete = () => {
    setLoanModes((prevModes: React.SetStateAction<Record<number, string>>) => ({
      ...prevModes,
      [loanId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setLoanModes((prevModes: React.SetStateAction<Record<number, string>>) => ({
      ...prevModes,
      [loanId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="loan-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "loan-action-buttons",
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

export default LoanActionsMenu;
