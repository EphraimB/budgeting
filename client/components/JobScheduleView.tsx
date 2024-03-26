"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { JobSchedule } from "@/app/types/types";
import Tooltip from "@mui/material/Tooltip";

// Define your custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#76ff03", // A shade of green for job schedules
    },
    background: {
      default: "#9e9e9e", // A grey color for the background bar
    },
  },
});

// Convert time to a percentage of the day
const timeToPercent = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  return (totalMinutes / 1440) * 100; // 1440 minutes in a day
};

function JobScheduleView({
  job_day_of_week,
  day_of_week,
  handleOpenModal,
}: {
  job_day_of_week: JobSchedule[];
  day_of_week: number;
  handleOpenModal: (day: number) => void;
}) {
  return (
    <Box
      sx={{
        width: "100%",
        height: "20px",
        backgroundColor: theme.palette.background.default,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        left: 0,
        bottom: 0,
      }}
      onClick={() => handleOpenModal(day_of_week)}
    >
      {job_day_of_week.map((job, index) => {
        const startPercent = timeToPercent(job.start_time);
        const endPercent = timeToPercent(job.end_time);
        const widthPercent = endPercent - startPercent;

        return (
          <Tooltip
            key={index}
            title={job.start_time + "-" + job.end_time}
            placement="top"
          >
            <Box
              sx={{
                height: "100%",
                backgroundColor: theme.palette.primary.main,
                position: "absolute",
                left: `${startPercent}%`,
                width: `${widthPercent}%`,
              }}
            />
          </Tooltip>
        );
      })}
    </Box>
  );
}

export default JobScheduleView;
