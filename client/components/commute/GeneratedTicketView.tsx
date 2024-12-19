import { FareDetail } from "@/app/types/types";
import { Button, Paper, Typography } from "@mui/material";
import { useState } from "react";
import GeneratedTicketModal from "./GeneratedTicketModal";

function GeneratedTicketView({ fare }: { fare: FareDetail }) {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };

  return (
    <Paper sx={{ cursor: "pointer" }}>
      <Typography component="h6" variant="body1">
        {fare.commuteSystemName} {fare.name}
      </Typography>
      <Typography component="p" variant="body2">
        ${fare.fare} fare
      </Typography>
      <Button onClick={openModal}>Add to schedule</Button>
      <GeneratedTicketModal
        fare={fare}
        open={modalOpen}
        setOpen={setModalOpen}
      />
    </Paper>
  );
}

export default GeneratedTicketView;
