import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function CommuteStationActionsMenu({
  anchorEl,
  open,
  handleClose,
  setCommuteStationModes,
  commuteStationId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setCommuteStationModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  commuteStationId: number;
}) {
  const handleDelete = () => {
    setCommuteStationModes((prevModes: any) => ({
      ...prevModes,
      [commuteStationId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setCommuteStationModes((prevModes: any) => ({
      ...prevModes,
      [commuteStationId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="commute-station-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "commute-station-buttons",
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

export default CommuteStationActionsMenu;
