import { FullCommuteSchedule } from "@/app/types/types";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

function CommuteScheduleView({ schedule }: { schedule: FullCommuteSchedule }) {
  return (
    <Grid key={schedule.dayOfWeek} size={{ xs: 12 }}>
      {schedule.commuteSchedules.map((commute) => (
        <Grid key={commute.id} size={{ xs: 12 }}>
          <Box sx={{ backgroundColor: "lightgray", p: 1 }}>
            <Typography variant="body1">
              {commute.pass} - {commute.startTime} to {commute.endTime} ($
              {commute.fare.toFixed(2)})
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

export default CommuteScheduleView;
