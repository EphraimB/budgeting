"use client";

import { JobSchedule } from "@/app/types/types";
import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useDrag } from "react-dnd";

type UpdateJobSchedule = (
  id: number,
  newStartTime: string,
  newEndTime: string
) => void;

interface DropResult {
  position: { start_time: string; end_time: string };
}

function JobScheduleBar({
  job,
  index,
  updateJobSchedule,
}: {
  job: JobSchedule;
  index: number;
  updateJobSchedule: UpdateJobSchedule;
}) {
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

  // Dragging logic for the start handle
  const [, dragStart] = useDrag(() => ({
    type: "job-start",
    item: { id: index },
    end: (item, monitor) => {
      const dropResult: DropResult | null = monitor.getDropResult();
      if (item && dropResult) {
        // Logic to update job's start time using dropResult
        updateJobSchedule(index, dropResult.position.start_time, job.end_time);
      }
    },
  }));

  // Dragging logic for the end handle
  const [, dragEnd] = useDrag(() => ({
    type: "job-end",
    item: { id: index },
    end: (item, monitor) => {
      const dropResult: DropResult | null = monitor.getDropResult();
      if (item && dropResult) {
        // Logic to update job's end time using dropResult
        updateJobSchedule(
          item.id,
          job.start_time,
          dropResult.position.end_time
        );
      }
    },
  }));

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

  const startPercent = timeToPercent(job.start_time);
  const endPercent = timeToPercent(job.end_time);
  const widthPercent = endPercent - startPercent;

  return (
    <Box sx={{ position: "relative", width: "100%", height: "20px" }}>
      <Box
        ref={dragStart}
        sx={{
          height: "100%",
          backgroundColor: theme.palette.primary.main,
          left: `${startPercent}%`,
          width: "10px",
          position: "absolute",
          cursor: "ew-resize",
        }}
      />
      <Tooltip
        key={index}
        title={
          use12HourClock
            ? dayjs(job.start_time, "HH:mm:ss").format("h:mm:ss A") +
              "-" +
              dayjs(job.end_time, "HH:mm:ss").format("h:mm:ss A")
            : job.start_time + "-" + job.end_time
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
      <Box
        ref={dragEnd}
        sx={{
          height: "100%",
          backgroundColor: theme.palette.primary.main,
          left: `${endPercent}%`,
          width: "10px",
          position: "absolute",
          cursor: "ew-resize",
        }}
      />
    </Box>
  );
}

export default JobScheduleBar;
