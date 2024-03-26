"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import { JobSchedule } from "@/app/types/types";
import JobScheduleView from "./JobScheduleView";

function JobScheduleDayView({ job_schedule }: { job_schedule: JobSchedule[] }) {
  const [open, setOpen] = useState(false);

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
    <Stack
      position="relative"
      direction="row"
      spacing={2}
      useFlexGap
      flexWrap="wrap"
      justifyContent="center"
    >
      {days.map((day, index) => (
        <Paper
          key={index}
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
          <JobScheduleView
            job_day_of_week={job_schedule.filter(
              (js) => js.day_of_week === index
            )}
            open={open}
            setOpen={setOpen}
            day_of_week={day}
          />
        </Paper>
      ))}
    </Stack>
  );
}

export default JobScheduleDayView;
