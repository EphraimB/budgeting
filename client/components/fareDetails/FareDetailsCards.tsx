"use client";

import { useState } from "react";
import { FareDetail } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import { Box, Card, Fab, Stack } from "@mui/material";
import FareDetailView from "./FareDetailView";
import NewFareDetailForm from "./NewFareDetailForm";
import FareDetailDelete from "./FareDetailDelete";
import FareDetailEdit from "./FareDetailEdit";

function FareDetailsCards({
  commuteSystemId,
  commuteStationId,
  fareDetails,
}: {
  commuteSystemId: number;
  commuteStationId: number;
  fareDetails: FareDetail[];
}) {
  const [showFareDetailForm, setShowFareDetailForm] = useState(false);
  const [fareDetailModes, setFareDetailModes] = useState<
    Record<number, string>
  >({});

  return (
    <Stack direction="column" spacing={2}>
      <Grid container spacing={2}>
        {showFareDetailForm && (
          <Grid key="new-fare-detail">
            <NewFareDetailForm
              setShowFareDetailForm={setShowFareDetailForm}
              commuteSystemId={commuteSystemId}
              commuteStationId={commuteStationId}
              fareDetails={fareDetails}
            />
          </Grid>
        )}

        {fareDetails.map((fareDetail: FareDetail) => (
          <Grid key={fareDetail.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {fareDetailModes[fareDetail.id] === "delete" ? (
                <FareDetailDelete
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              ) : fareDetailModes[fareDetail.id] === "edit" ? (
                <FareDetailEdit
                  commuteSystemId={commuteSystemId}
                  commuteStationId={commuteStationId}
                  fareDetails={fareDetails}
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              ) : (
                <FareDetailView
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowFareDetailForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </Stack>
  );
}

export default FareDetailsCards;
