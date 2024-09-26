import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

function JobActionsMenu({
  anchorEl,
  open,
  handleClose,
  setJobModes,
  jobId,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  handleClose: () => void;
  setJobModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
  jobId: number;
}) {
  const handleDelete = () => {
    setJobModes((prevModes: any) => ({
      ...prevModes,
      [jobId]: "delete",
    }));

    handleClose();
  };

  const handleEdit = () => {
    setJobModes((prevModes: any) => ({
      ...prevModes,
      [jobId]: "edit",
    }));

    handleClose();
  };

  return (
    <Menu
      id="job-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClose}
      MenuListProps={{
        "aria-labelledby": "job-action-buttons",
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

export default JobActionsMenu;
