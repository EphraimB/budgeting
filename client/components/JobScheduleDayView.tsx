"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { JobSchedule } from "@/app/types/types";
import JobScheduleView from "./JobScheduleView";

function JobScheduleDayView({ job_schedule }: { job_schedule: JobSchedule[] }) {
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
    <Grid container spacing={2}>
      {days.map((day, index) => (
        <Grid key={index} item xs={6} md={1}>
          <Paper sx={{ backgroundColor: "black", color: "white", p: 2, position: "relative" }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ textAlign: "center" }}
            >
              {day}
            </Typography>
            <JobScheduleView
              job_day_of_week={job_schedule.filter(
                (js) => js.day_of_week === index
              )}
            />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default JobScheduleDayView;
