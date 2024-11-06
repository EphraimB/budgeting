"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { CommuteSystem } from "@/app/types/types";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import CommuteSystemView from "./CommuteSystemView";
import CommuteSystemDelete from "./CommuteSystemDelete";
import NewCommuteSystemForm from "./NewCommuteSystemForm";
import CommuteSystemEdit from "./CommuteSystemEdit";

function CommuteSystemCards({
  commuteSystems,
  showStations,
  setShowStations,
}: {
  commuteSystems: CommuteSystem[];
  showStations: number | null;
  setShowStations: (showStations: number) => void;
}) {
  const [showCommuteSystemForm, setShowCommuteSystemForm] = useState(false);
  const [commuteSystemModes, setCommuteSystemModes] = useState<
    Record<number, string>
  >({});

  return (
    <>
      <Grid container spacing={2}>
        {showCommuteSystemForm && (
          <Grid key="new-commute-system">
            <NewCommuteSystemForm
              setShowCommuteSystemForm={setShowCommuteSystemForm}
            />
          </Grid>
        )}

        {commuteSystems.map((commuteSystem: CommuteSystem) => (
          <Grid key={commuteSystem.id}>
            <Card
              sx={{ maxWidth: "18rem", position: "relative" }}
              elevation={showStations ? 1 : 4}
            >
              {commuteSystemModes[commuteSystem.id] === "delete" ? (
                <CommuteSystemDelete
                  commuteSystem={commuteSystem}
                  setCommuteSystemModes={setCommuteSystemModes}
                />
              ) : commuteSystemModes[commuteSystem.id] === "edit" ? (
                <CommuteSystemEdit
                  commuteSystem={commuteSystem}
                  setCommuteSystemModes={setCommuteSystemModes}
                />
              ) : (
                <CommuteSystemView
                  commuteSystem={commuteSystem}
                  setCommuteSystemModes={setCommuteSystemModes}
                  setShowStations={setShowStations}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab color="primary" onClick={() => setShowCommuteSystemForm(true)}>
          <AddIcon />
        </Fab>
      </Box>
    </>
  );
}

export default CommuteSystemCards;