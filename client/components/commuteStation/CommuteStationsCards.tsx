"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { CommuteStation } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import CommuteStationDelete from "./CommuteStationDelete";
import CommuteStationView from "./CommuteStationView";
import NewCommuteStationForm from "./NewCommuteStationForm";
import CommuteStationEdit from "./CommuteStationEdit";
import { Box, Fab, Stack } from "@mui/material";

function CommuteStationCards({
  commuteStations,
}: {
  commuteStations: CommuteStation[];
}) {
  const [showCommuteStationForm, setShowCommuteStationForm] = useState(false);
  const [commuteStationModes, setCommuteStationModes] = useState<
    Record<number, string>
  >({});

  return (
    <Stack direction="column" spacing={2}>
      <Grid container spacing={2}>
        {showCommuteStationForm && (
          <Grid key="new-commute-station">
            <NewCommuteStationForm
              setShowCommuteStationForm={setShowCommuteStationForm}
            />
          </Grid>
        )}

        {commuteStations.map((commuteStation: CommuteStation) => (
          <Grid key={commuteStation.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {commuteStationModes[commuteStation.id] === "delete" ? (
                <CommuteStationDelete
                  commuteStation={commuteStation}
                  setCommuteStationModes={setCommuteStationModes}
                />
              ) : commuteStationModes[commuteStation.id] === "edit" ? (
                <CommuteStationEdit
                  commuteStation={commuteStation}
                  setCommuteStationModes={setCommuteStationModes}
                />
              ) : (
                <CommuteStationView
                  commuteStation={commuteStation}
                  setCommuteStationModes={setCommuteStationModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowCommuteStationForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </Stack>
  );
}

export default CommuteStationCards;
