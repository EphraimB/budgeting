"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { CommuteStation } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import CommuteStationDelete from "./CommuteStationDelete";
import CommuteStationView from "./CommuteStationView";
import NewCommuteStationForm from "./NewCommuteStationForm";

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
    <>
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
    </>
  );
}

export default CommuteStationCards;
