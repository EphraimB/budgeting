import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function ExpenseActionsMenu({
  anchorEl,
  open,
  handleClose,
  setExpenseModes,
  expenseId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setExpenseModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  expenseId: number;
}) {
  const handleDelete = () => {
    setExpenseModes((prevModes: any) => ({
      ...prevModes,
      [expenseId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setExpenseModes((prevModes: any) => ({
      ...prevModes,
      [expenseId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="expense-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "expense-action-buttons",
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

export default ExpenseActionsMenu;
