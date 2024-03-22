"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { JobSchedule } from "@/app/types/types";

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
      {days.map((day) => (
        <Grid item xs={6} md={1}>
          <Paper sx={{ backgroundColor: "black", color: "white" }}>
            <Typography variant="body2" component="span">
              {day}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default JobScheduleDayView;
