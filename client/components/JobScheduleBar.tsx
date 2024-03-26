"use client";

import { JobSchedule } from "@/app/types/types";
import React from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { useDrag } from "react-dnd";

type UpdateJobSchedule = (
  start_time: string,
  newStartTime: string,
  newEndTime: string
) => void;

interface DropResult {
  position: { start: string; end: string };
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

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "job",
    item: { id: job.start_time, index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult: DropResult | null = monitor.getDropResult();
      if (item && dropResult) {
        // You need to convert dropResult.position to time and update the job schedule
        updateJobSchedule(
          item.id,
          dropResult.position.start,
          dropResult.position.end
        );
      }
    },
  }));

  // Style adjustments while dragging
  const opacity = isDragging ? 0.5 : 1;

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
        ref={drag}
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
}

export default JobScheduleBar;
