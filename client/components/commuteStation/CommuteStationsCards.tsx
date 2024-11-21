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
import { IconButton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";
import { usePathname } from "next/navigation";

function CommuteStationCards({
  commuteSystemName,
  commuteStations,
}: {
  commuteSystemName: string;
  commuteStations: CommuteStation[];
}) {
  const [showCommuteStationForm, setShowCommuteStationForm] = useState(false);
  const [commuteStationModes, setCommuteStationModes] = useState<
    Record<number, string>
  >({});

  const router = useRouter();
  const pathname = usePathname();

  const parentPath = pathname.split("/").slice(0, -1).join("/"); // Remove the last segment

  const goBack = () => {
    router.push(parentPath);
  };

  return (
    <Stack direction="column" spacing={2}>
      <Stack direction="row" spacing={2} sx={{ backgroundColor: "gray" }}>
        <IconButton onClick={() => goBack()}>
          <ArrowBack />
        </IconButton>
        <Typography
          component="h6"
          variant="h6"
          sx={{
            flexGrow: 1, // Allows this element to take up the remaining space
            textAlign: "center",
          }}
        >
          {commuteSystemName}
        </Typography>
        <IconButton onClick={() => setShowCommuteStationForm(true)}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Grid container spacing={2}>
        {showCommuteStationForm && (
          <Grid key="new-commute-station" size={{ xs: 6 }}>
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
    </Stack>
  );
}

export default CommuteStationCards;
