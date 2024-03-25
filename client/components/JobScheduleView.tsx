"use client";

import React from "react";
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
}: {
  job_day_of_week: JobSchedule[];
}) {
  return (
    <Box sx={{ position: "absolute", width: "100%", left: 0, bottom: 0 }}>
      <Box
        sx={{
          width: "100%",
          height: "20px",
          backgroundColor: theme.palette.background.default,
          position: "relative",
          display: "flex",
          alignItems: "center",
        }}
      >
        {job_day_of_week.map((job, index) => {
          const startPercent = timeToPercent(job.start_time);
          const endPercent = timeToPercent(job.end_time);
          const widthPercent = endPercent - startPercent;

          return (
            <Tooltip
              title={job.start_time + "-" + job.end_time}
              placement="top"
            >
              <Box
                key={index}
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
    </Box>
  );
}

export default JobScheduleView;
