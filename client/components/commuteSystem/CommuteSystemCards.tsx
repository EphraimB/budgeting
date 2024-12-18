"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { CommuteSystem } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import CommuteSystemView from "./CommuteSystemView";
import CommuteSystemDelete from "./CommuteSystemDelete";
import NewCommuteSystemForm from "./NewCommuteSystemForm";
import CommuteSystemEdit from "./CommuteSystemEdit";
import { Box, Fab, Stack } from "@mui/material";

function CommuteSystemCards({
  commuteSystems,
}: {
  commuteSystems: CommuteSystem[];
}) {
  const [showCommuteSystemForm, setShowCommuteSystemForm] = useState(false);
  const [commuteSystemModes, setCommuteSystemModes] = useState<
    Record<number, string>
  >({});

  return (
    <Stack direction="column" spacing={2}>
      <Grid container spacing={2}>
        {showCommuteSystemForm && (
          <Grid key="new-commute-system">
            <NewCommuteSystemForm
              setShowCommuteSystemForm={setShowCommuteSystemForm}
            />
          </Grid>
        )}

        {/* Main grid with 2x2 layout */}
        {commuteSystems.map((commuteSystem) => (
          <Grid key={commuteSystem.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
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
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <br />
      <Box sx={{ position: "fixed", bottom: 16, right: 16 }}>
        <Fab
          color="primary"
          onClick={() => setShowCommuteSystemForm(true)}
          data-testid="add-fab"
        >
          <AddIcon />
        </Fab>
      </Box>
    </Stack>
  );
}

export default CommuteSystemCards;
