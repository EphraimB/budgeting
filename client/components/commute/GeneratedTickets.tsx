import { FareDetail } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import GeneratedTicketView from "./GeneratedTicketView";

function GeneratedTickets({ fares }: { fares: FareDetail[] }) {
  return (
    <Grid container spacing={2}>
      {fares.map((fare: FareDetail) => (
        <Grid key={fare.id}>
          <GeneratedTicketView fare={fare} />
        </Grid>
      ))}
    </Grid>
  );
}

export default GeneratedTickets;
