import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Add } from "@mui/icons-material";
import { Divider } from "@mui/material";

function CommuteSystemActionsMenu({
  anchorEl,
  open,
  handleClose,
  setCommuteSystemModes,
  setShowStations,
  commuteSystemId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setCommuteSystemModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  setShowStations: (showStations: boolean) => void;
  commuteSystemId: number;
}) {
  const handleDelete = () => {
    setCommuteSystemModes((prevModes: any) => ({
      ...prevModes,
      [commuteSystemId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setCommuteSystemModes((prevModes: any) => ({
      ...prevModes,
      [commuteSystemId]: "edit",
    }));

    handleClose();
  };

  const handleAddStation = () => {
    setShowStations(true);
  };

  return (
    <Menu
      id="commute-system-menu"
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
      <Divider />
      <MenuItem onClick={handleAddStation}>
        <ListItemIcon>
          <Add fontSize="small" />
        </ListItemIcon>
        <ListItemText>Add station</ListItemText>
      </MenuItem>
    </Menu>
  );
}

export default CommuteSystemActionsMenu;
