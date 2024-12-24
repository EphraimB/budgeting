import { CommuteSchedule } from "@/app/types/types";
import { Close } from "@mui/icons-material";
import { Box, Button, IconButton, Stack, Typography } from "@mui/material";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { deleteCommuteSchedule } from "../../services/actions/commuteSchedule";

function CommuteScheduleDelete({
  commute,
  setCommuteModes,
}: {
  commute: CommuteSchedule;
  setCommuteModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleCancel = () => {
    setCommuteModes(() => ({}));
  };

  const handleDelete = async () => {
    try {
      await deleteCommuteSchedule(commute.id);

      // Show success message
      showSnackbar(`Commute "${commute.pass}" deleted successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error deleting commute "${commute.pass}"`, "error");
    }
    setCommuteModes(() => ({}));
  };

  return (
    <Box sx={{ backgroundColor: "red", p: 1 }}>
      <Box sx={{ justifyContent: "right" }}>
        <IconButton onClick={handleCancel}>
          <Close />
        </IconButton>
      </Box>
      <Typography variant="body1">
        Are you sure you want to delete this commute?
      </Typography>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <Button color="secondary" onClick={handleCancel}>
          No
        </Button>
        <Button color="primary" onClick={handleDelete}>
          Yes
        </Button>
      </Stack>
    </Box>
  );
}

export default CommuteScheduleDelete;
