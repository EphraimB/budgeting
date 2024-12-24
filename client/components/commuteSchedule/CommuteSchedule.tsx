import { FullCommuteSchedule } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import CommuteScheduleView from "./CommuteScheduleView";
import CommuteScheduleDelete from "./CommuteScheduleDelete";

function CommuteSchedule({
  schedule,
  commuteModes,
  setCommuteModes,
}: {
  schedule: FullCommuteSchedule;
  commuteModes: Record<number, string>;
  setCommuteModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  return (
    <Grid size={{ xs: 12 }}>
      {schedule.commuteSchedules.map((commute) => (
        <Grid key={commute.id} size={{ xs: 12 }}>
          {commuteModes[commute.id] === "delete" ? (
            <CommuteScheduleDelete
              commute={commute}
              setCommuteModes={setCommuteModes}
            />
          ) : (
            <CommuteScheduleView
              commute={commute}
              setCommuteModes={setCommuteModes}
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}

export default CommuteSchedule;
