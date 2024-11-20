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
import { IconButton, Stack, Typography } from "@mui/material";

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
      <Stack direction="row" spacing={2} sx={{ backgroundColor: "gray" }}>
        <Typography component="h4" variant="h6">
          Tickets
        </Typography>
        <Typography component="p" variant="body2">
          Setup systems, stations, fares, and times and drag and drop them onto
          the schedule on the center panel
        </Typography>
        <IconButton onClick={() => setShowCommuteSystemForm(true)}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Grid container spacing={2}>
        {showCommuteSystemForm && (
          <Grid key="new-commute-system" size={{ sm: 6 }}>
            <NewCommuteSystemForm
              setShowCommuteSystemForm={setShowCommuteSystemForm}
            />
          </Grid>
        )}

        {commuteSystems.map((commuteSystem: CommuteSystem) => (
          <Grid key={commuteSystem.id} size={{ sm: 6 }}>
            <Card sx={{ position: "relative" }}>
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
    </Stack>
  );
}

export default CommuteSystemCards;
