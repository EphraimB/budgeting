"use client";

import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import { FareDetail } from "@/app/types/types";
import Grid from "@mui/material/Grid2";
import TimeslotBar from "./TimeslotBar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers";
import dayjs from "dayjs";

function FareTimeslotsDayView({
  accountId,
  stationId,
  fareDetail,
}: {
  accountId: number;
  stationId: number;
  fareDetail: FareDetail;
}) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const [timeslots, setTimeslots] = useState(fareDetail.timeslots);

  const handleTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    newValue: string
  ) => {
    const updatedTimeslots = timeslots.map((slot, i) =>
      i === index ? { ...slot, [field]: newValue } : slot
    );
    setTimeslots(updatedTimeslots);
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
            <TimeslotBar
              timeslots={timeslots.filter((slot) => slot.dayOfWeek === index)}
            />
            {timeslots
              .filter((slot) => slot.dayOfWeek === index)
              .map((timeslot, timeslotIndex) => (
                <LocalizationProvider
                  key={timeslotIndex}
                  dateAdapter={AdapterDayjs}
                >
                  <TimePicker
                    label="Start Time"
                    value={dayjs(timeslot.startTime, "HH:mm:ss")}
                    onChange={(newValue) =>
                      handleTimeChange(
                        timeslotIndex,
                        "startTime",
                        newValue ? newValue.format("HH:mm:ss") : ""
                      )
                    }
                  />
                  <TimePicker
                    label="End Time"
                    value={dayjs(timeslot.endTime, "HH:mm:ss")}
                    onChange={(newValue) =>
                      handleTimeChange(
                        timeslotIndex,
                        "endTime",
                        newValue ? newValue.format("HH:mm:ss") : ""
                      )
                    }
                  />
                </LocalizationProvider>
              ))}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default FareTimeslotsDayView;
