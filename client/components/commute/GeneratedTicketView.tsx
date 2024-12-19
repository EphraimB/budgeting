import { FareDetail, FullCommuteSchedule } from "@/app/types/types";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { useState } from "react";
import GeneratedTicketModal from "./GeneratedTicketModal";
import { ArrowDownward } from "@mui/icons-material";

function GeneratedTicketView({
  fare,
  commuteSchedule,
}: {
  fare: FareDetail;
  commuteSchedule: FullCommuteSchedule[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  return (
    <Paper sx={{ cursor: "pointer" }}>
      <Stack direction="column" spacing={2}>
        <Typography component="h6" variant="body1">
          {fare.commuteSystemName}
        </Typography>
        <Stack
          direction="column"
          sx={{
            p: 2,
            border: "1px solid black",
            justifyContent: "center",
          }}
        >
          <Typography component="p" variant="body2">
            {fare.fromStation}
          </Typography>
          <ArrowDownward />
          <Typography component="p" variant="body2">
            {fare.toStation}
          </Typography>
        </Stack>
      </Stack>
      <Typography component="p" variant="body2">
        ${fare.fare.toFixed(2)} fare
      </Typography>
      <Button onClick={openModal}>Add to schedule</Button>
      <GeneratedTicketModal
        fare={fare}
        commuteSchedule={commuteSchedule}
        open={modalOpen}
        setOpen={setModalOpen}
      />
    </Paper>
  );
}

export default GeneratedTicketView;
