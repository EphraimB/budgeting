import { FareDetail, FullCommuteSchedule } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import GeneratedTicketView from "./GeneratedTicketView";

function GeneratedTickets({
  fares,
  commuteSchedule,
}: {
  fares: FareDetail[];
  commuteSchedule: FullCommuteSchedule[];
}) {
  return (
    <Grid container spacing={2}>
      {fares.map((fare: FareDetail) => (
        <Grid key={fare.id}>
          <GeneratedTicketView fare={fare} commuteSchedule={commuteSchedule} />
        </Grid>
      ))}
    </Grid>
  );
}

export default GeneratedTickets;
