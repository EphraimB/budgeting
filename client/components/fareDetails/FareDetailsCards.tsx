"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import { FareDetail } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import { IconButton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";
import { usePathname } from "next/navigation";

function FareDetailsCards({
  stationName,
  fareDetails,
}: {
  stationName: string;
  fareDetails: FareDetail[];
}) {
  const [showFareDetailForm, setShowFareDetailForm] = useState(false);
  const [fareDetailModes, setFareDetailModes] = useState<
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
          {stationName}
        </Typography>
        <IconButton onClick={() => setShowFareDetailForm(true)}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Grid container spacing={2}>
        {showFareDetailForm && (
          <Grid key="new-fare-detail" size={{ xs: 6 }}>
            <NewFareDetailForm showFareDetailForm={showFareDetailForm} />
          </Grid>
        )}

        {fareDetails.map((fareDetail: FareDetail) => (
          <Grid key={fareDetail.id}>
            <Card sx={{ maxWidth: "18rem", position: "relative" }}>
              {fareDetailModes[fareDetail.id] === "delete" ? (
                <fareDetailDelete
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              ) : fareDetailModes[fareDetail.id] === "edit" ? (
                <fareDetailEdit
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              ) : (
                <fareDetailView
                  fareDetail={fareDetail}
                  setFareDetailModes={setFareDetailModes}
                />
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

export default FareDetailsCards;
