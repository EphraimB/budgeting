"use client";

import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import { JobSchedule } from "@/app/types/types";
import { createTheme } from "@mui/material/styles";

function JobScheduleBar({ job, index }: { job: JobSchedule; index: number }) {
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

  const timeToPercent = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return ((hours * 60 + minutes) / 1440) * 100;
  };

  const startPercent = timeToPercent(job.startTime);
  const endPercent = timeToPercent(job.endTime);
  const widthPercent = endPercent - startPercent;

  const is12HourClock = () => {
    const dateTimeFormat = new Intl.DateTimeFormat([], {
      hour: "numeric",
      hour12: true,
    });
    // Format a date at 23:00 to see if 'AM'/'PM' is used in the formatted string
    const formattedTime = dateTimeFormat.format(new Date(0, 0, 0, 23, 0, 0));
    return formattedTime.includes("AM") || formattedTime.includes("PM");
  };

  const use12HourClock = is12HourClock();

  return (
    <Tooltip
      key={index}
      title={
        use12HourClock
          ? dayjs(job.startTime, "HH:mm:ss").format("h:mm:ss A") +
            "-" +
            dayjs(job.endTime, "HH:mm:ss").format("h:mm:ss A")
          : job.startTime + "-" + job.endTime
      }
      placement="top"
    >
      <Box
        sx={{
          position: "absolute",
          height: "100%",
          backgroundColor: theme.palette.primary.main,
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
        }}
      />
    </Tooltip>
  );
}

export default JobScheduleBar;
