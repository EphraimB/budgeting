import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function FareDetailActionsMenu({
  anchorEl,
  open,
  handleClose,
  setFareDetailModes,
  fareDetailId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
  fareDetailId: number;
}) {
  const handleDelete = () => {
    setFareDetailModes((prevModes: any) => ({
      ...prevModes,
      [fareDetailId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setFareDetailModes((prevModes: any) => ({
      ...prevModes,
      [fareDetailId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="fare-detail-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "fare-detail-action-buttons",
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

export default FareDetailActionsMenu;
