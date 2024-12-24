import { CommuteSchedule } from "@/app/types/types";
import { Delete } from "@mui/icons-material";
import { Box, IconButton, Typography } from "@mui/material";

function CommuteScheduleView({
  commute,
  setCommuteModes,
}: {
  commute: CommuteSchedule;
  setCommuteModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const handleDelete = () => {
    setCommuteModes((prevModes: any) => ({
      ...prevModes,
      [commute.id]: "delete",
    }));
  };

  return (
    <Box sx={{ backgroundColor: "lightgray", p: 1 }}>
      <Box sx={{ justifyContent: "right" }}>
        <IconButton onClick={handleDelete}>
          <Delete />
        </IconButton>
      </Box>
      <Typography variant="body1">
        {commute.pass} - {commute.startTime} to {commute.endTime} ($
        {commute.fare.toFixed(2)})
      </Typography>
    </Box>
  );
}

export default CommuteScheduleView;
