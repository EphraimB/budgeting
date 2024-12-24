"use client";

import { CommuteSystem } from "@/app/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { deleteCommuteSystem } from "../../services/actions/commuteSystem";

function CommuteSystemDelete({
  commuteSystem,
  setCommuteSystemModes,
}: {
  commuteSystem: CommuteSystem;
  setCommuteSystemModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteCommuteSystem(commuteSystem.id);

      // Show success message
      showSnackbar(
        `Commute system "${commuteSystem.name}" deleted successfully`
      );
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(
        `Error deleting commute system "${commuteSystem.name}"`,
        "error"
      );
    }
    setCommuteSystemModes((prev) => ({ ...prev, [commuteSystem.id]: "view" }));
  };

  const handleCancel = () => {
    setCommuteSystemModes((prev) => ({ ...prev, [commuteSystem.id]: "view" }));
  };

  return (
    <Box sx={{ p: 2 }}>
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleCancel}
      >
        <CloseIcon />
      </IconButton>
      <br />
      <br />
      <Typography variant="subtitle1" component="h3">
        Delete &quot;{commuteSystem.name}&quot;?
      </Typography>
      <Button color="error" variant="contained" onClick={handleDelete}>
        Delete
      </Button>
      <Button color="primary" variant="contained" onClick={handleCancel}>
        Cancel
      </Button>
    </Box>
  );
}

export default CommuteSystemDelete;
