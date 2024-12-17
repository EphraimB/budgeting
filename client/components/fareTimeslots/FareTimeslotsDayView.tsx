"use client";

import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import { FareDetail } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import TimeslotView from "./TimeslotView";
import DayOfWeekModal from "./DayOfWeekModal";

function FareTimeslotsDayView({
  accountId,
  commuteSystemId,
  stationId,
  fareDetail,
}: {
  accountId: number;
  commuteSystemId: number;
  stationId: number;
  fareDetail: FareDetail;
}) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    dayOfWeek: number | null;
  }>({ open: false, dayOfWeek: null });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleOpenModal = (day: number) => {
    setModalState({
      open: true,
      dayOfWeek: day,
    });
  };

  return (
    <Grid container spacing={2}>
      {days.map((day, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <Paper
            sx={{
              backgroundColor: "black",
              color: "white",
              p: 2,
              position: "relative",
            }}
          >
            <Typography
              variant="body2"
              component="p"
              sx={{ textAlign: "center" }}
              gutterBottom
            >
              {day}
            </Typography>
            <TimeslotView
              scheduleDayOfWeek={fareDetail.timeslots.filter(
                (js) => js.dayOfWeek === index
              )}
              dayOfWeek={index}
              handleOpenModal={handleOpenModal}
            />
          </Paper>
          {modalState.dayOfWeek !== null && (
            <DayOfWeekModal
              accountId={accountId}
              stationId={stationId}
              fareDetail={fareDetail}
              scheduleDayOfWeek={fareDetail.timeslots.filter(
                (js) => js.dayOfWeek === modalState.dayOfWeek
              )}
              dayOfWeek={modalState.dayOfWeek}
              open={modalState.open}
              setOpen={(isOpen) =>
                setModalState((prevState) => ({ ...prevState, open: isOpen }))
              }
            />
          )}
        </Grid>
      ))}
    </Grid>
  );
}

export default FareTimeslotsDayView;
