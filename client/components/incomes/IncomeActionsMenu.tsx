import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function IncomeActionsMenu({
  anchorEl,
  open,
  handleClose,
  setIncomeModes,
  incomeId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setIncomeModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  incomeId: number;
}) {
  const handleDelete = () => {
    setIncomeModes((prevModes: any) => ({
      ...prevModes,
      [incomeId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setIncomeModes((prevModes: any) => ({
      ...prevModes,
      [incomeId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="income-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "income-action-buttons",
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

export default IncomeActionsMenu;
