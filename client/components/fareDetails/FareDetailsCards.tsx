"use client";

import { useState } from "react";
import { CommuteStation, FareDetail } from "@/app/types/types";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid2";
import { Card, IconButton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { ArrowBack, ArrowDownward } from "@mui/icons-material";
import { usePathname } from "next/navigation";
import AnalogClock from "./AnalogClock";
import FareDetailView from "./FareDetailView";

function FareDetailsCards({
  commuteSystemName,
  commuteStation,
  fareDetails,
}: {
  commuteSystemName: string;
  commuteStation: CommuteStation;
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

  function getColorForDay(dayOfWeek: number) {
    const colors = [
      "#f00",
      "#ff7f00",
      "#ffff00",
      "#00ff00",
      "#0000ff",
      "#4b0082",
      "#ee82ee",
    ];
    return colors[dayOfWeek];
  }

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

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
          {commuteSystemName}-
          <Stack direction="column" sx={{ border: "1 px solid black" }}>
            {commuteStation.fromStation}
            <ArrowDownward />
            {commuteStation.toStation}
          </Stack>
        </Typography>
        <IconButton onClick={() => setShowFareDetailForm(true)}>
          <AddIcon />
        </IconButton>
      </Stack>
      <Grid container spacing={2}>
        {showFareDetailForm && (
          <Grid key="new-fare-detail" size={{ xs: 6 }}>
            {/* <NewFareDetailForm showFareDetailForm={showFareDetailForm} /> */}
          </Grid>
        )}

        {fareDetails.map((fareDetail: FareDetail) => (
          <Grid key={fareDetail.id}>
            <Card
              sx={{
                position: "relative",
                borderRadius: "50%",
                width: "300px",
                height: "300px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* Render the 7 rings for each day of the week */}
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <AnalogClock
                  key={dayIndex}
                  timeslots={fareDetail.timeslots}
                  dayOfWeek={dayIndex}
                  color={getColorForDay(dayIndex)}
                  size={`calc(100% - ${dayIndex * 10}px)`} // Rings get smaller as we go out
                  tooltipLabel={
                    fareDetail.timeslots
                      .filter((slot) => slot.dayOfWeek === dayIndex)
                      .map((slot) => `${slot.startTime} - ${slot.endTime}`)
                      .join(", ") ||
                    `No timeslots for ${
                      [
                        "Sunday",
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                      ][dayIndex]
                    }`
                  }
                />
              ))}
              {fareDetailModes[fareDetail.id] === "delete" ? (
                // <fareDetailDelete
                //   fareDetail={fareDetail}
                //   setFareDetailModes={setFareDetailModes}
                // />
                <></>
              ) : fareDetailModes[fareDetail.id] === "edit" ? (
                // <fareDetailEdit
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
    </Stack>
  );
}

export default FareDetailsCards;
