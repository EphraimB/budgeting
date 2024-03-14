"use client";

import { Job } from "@/app/types/types";
import Box from "@mui/material/Box";
import { deleteJob } from "../services/actions/job";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../context/FeedbackContext";

function JobDelete({
  job,
  setJobModes,
}: {
  job: Job;
  setJobModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteJob(job.id);

      // Show success message
      showSnackbar(`Job "${job.name}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting job "${job.name}"`, "error");
    }
    setJobModes((prev) => ({ ...prev, [job.id]: "view" }));
  };

  const handleCancel = () => {
    setJobModes((prev) => ({ ...prev, [job.id]: "view" }));
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
        Delete "{job.name}"?
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

export default ExpenseDelete;
