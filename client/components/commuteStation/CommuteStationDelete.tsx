"use client";

import { CommuteStation } from "@/app/types/types";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { deleteCommuteStation } from "../../services/actions/commuteStation";

function CommuteStationDelete({
  commuteStation,
  setCommuteStationModes,
}: {
  commuteStation: CommuteStation;
  setCommuteStationModes: React.Dispatch<
    React.SetStateAction<Record<number, string>>
  >;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleDelete = async () => {
    try {
      await deleteCommuteStation(commuteStation.id);

      // Show success message
      showSnackbar(
        `Commute station going from ${commuteStation.fromStation} to ${commuteStation.toStation} deleted successfully`
      );
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(
        `Error deleting commute station going from ${commuteStation.fromStation} to ${commuteStation.toStation}`,
        "error"
      );
    }
    setCommuteStationModes((prev) => ({
      ...prev,
      [commuteStation.id]: "view",
    }));
  };

  const handleCancel = () => {
    setCommuteStationModes((prev) => ({
      ...prev,
      [commuteStation.id]: "view",
    }));
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
        Delete stations traveling from {commuteStation.fromStation} to{" "}
        {commuteStation.toStation}?
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

export default CommuteStationDelete;
