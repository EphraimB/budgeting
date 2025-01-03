"use client";

import { FareDetail } from "@/app/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { deleteFareDetail } from "../../services/actions/fareDetail";

function FareDetailDelete({
  fareDetail,
  setFareDetailModes,
}: {
  fareDetail: FareDetail;
  setFareDetailModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteFareDetail(fareDetail.id);

      // Show success message
      showSnackbar(`Fare detail "${fareDetail.name}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting fare detail "${fareDetail.name}"`, "error");
    }
    setFareDetailModes((prev) => ({ ...prev, [fareDetail.id]: "view" }));
  };

  const handleCancel = () => {
    setFareDetailModes((prev) => ({ ...prev, [fareDetail.id]: "view" }));
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
        Delete &quot;{fareDetail.name}&quot;?
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

export default FareDetailDelete;
