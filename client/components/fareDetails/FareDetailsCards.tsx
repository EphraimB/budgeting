"use client";

import { useState } from "react";
import { FareDetail } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import { Box, Card, Fab, Stack } from "@mui/material";
import FareDetailView from "./FareDetailView";

function FareDetailsCards({ fareDetails }: { fareDetails: FareDetail[] }) {
  const [showFareDetailForm, setShowFareDetailForm] = useState(false);
  const [fareDetailModes, setFareDetailModes] = useState<
    Record<number, string>
  >({});

  const colors = [
    { light: "#FFCCCB", dark: "#FF6347" }, // Sunday (Tomato) - Light & Dark
    { light: "#FF7F50", dark: "#FF4500" }, // Monday (OrangeRed) - Light & Dark
    { light: "#FFFACD", dark: "#FFD700" }, // Tuesday (Gold) - Light & Dark
    { light: "#98FB98", dark: "#32CD32" }, // Wednesday (LimeGreen) - Light & Dark
    { light: "#ADD8E6", dark: "#1E90FF" }, // Thursday (DodgerBlue) - Light & Dark
    { light: "#D8BFD8", dark: "#8A2BE2" }, // Friday (BlueViolet) - Light & Dark
    { light: "#FFB6C1", dark: "#FF1493" }, // Saturday (DeepPink) - Light & Dark
  ];

  return (
    <Stack direction="column" spacing={2}>
      <Grid container spacing={2}>
        {showFareDetailForm && (
          <Grid key="new-fare-detail" size={{ xs: 6 }}>
            {/* <NewFareDetailForm showFareDetailForm={showFareDetailForm} /> */}
          </Grid>
        )}

        {fareDetails.map((fareDetail: FareDetail) => (
          <Grid key={fareDetail.id}>
            <Card>
              {fareDetailModes[fareDetail.id] === "delete" ? (
                // <FareDetailDelete
                //   fareDetail={fareDetail}
                //   setFareDetailModes={setFareDetailModes}
                // />
                <></>
              ) : fareDetailModes[fareDetail.id] === "edit" ? (
                // <FareDetailEdit
                //   fareDetail={fareDetail}
                //   setFareDetailModes={setFareDetailModes}
                // />
                <></>
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
