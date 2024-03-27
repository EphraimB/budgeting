"use client";

import React, { useState, useRef, useEffect } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { useDrag } from "react-dnd";
import dayjs from "dayjs";
import { JobSchedule } from "@/app/types/types";
import { createTheme } from "@mui/material/styles";

function JobScheduleBar({
  job,
  index,
  updateJobSchedule,
}: {
  job: JobSchedule;
  index: number;
  updateJobSchedule: (
    index: number,
    startTime: string,
    endTime: string
  ) => void;
}) {
  const [localJob, setLocalJob] = useState(job);
  const containerRef = useRef<HTMLElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  // Effect to measure and set the container's width
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener("resize", updateContainerWidth);

    return () => window.removeEventListener("resize", updateContainerWidth);
  }, []);

  const timeToPercent = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return ((hours * 60 + minutes) / 1440) * 100;
  };

  const updateTime = (time: string, dx: number, limit: string) => {
    const percentChange = (dx / containerWidth) * 100;
    const timeChange = (1440 * percentChange) / 100;
    let [hours, minutes] = time.split(":").map(Number);
    minutes += timeChange;
    hours += Math.floor(minutes / 60);
    minutes %= 60;
    if (hours < 0 || hours >= 24) return limit; // Limit the change within 0-24 hours
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:00`;
  };

  const handleDrag = (type: string, dx: number) => {
    const newStartTime =
      type === "start"
        ? updateTime(localJob.start_time, dx, localJob.end_time)
        : localJob.start_time;
    const newEndTime =
      type === "end"
        ? updateTime(localJob.end_time, dx, localJob.start_time)
        : localJob.end_time;
    setLocalJob({
      ...localJob,
      start_time: newStartTime,
      end_time: newEndTime,
    });
  };

  // Dragging logic for the start handle
  const [, dragStart] = useDrag(() => ({
    type: "job-handle",
    item: { id: index, type: "start" },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        handleDrag("start", delta.x);
        updateJobSchedule(index, localJob.start_time, localJob.end_time);
      }
    },
  }));

  // Dragging logic for the end handle
  const [, dragEnd] = useDrag(() => ({
    type: "job-handle",
    item: { id: index, type: "end" },
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta) {
        handleDrag("end", delta.x);
        updateJobSchedule(index, localJob.start_time, localJob.end_time);
      }
    },
  }));

  const startPercent = timeToPercent(localJob.start_time);
  const endPercent = timeToPercent(localJob.end_time);
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
    <Box
      ref={containerRef}
      sx={{ position: "relative", width: "100%", height: "20px" }}
    >
      <Box
        ref={dragStart}
        sx={{
          height: "100%",
          backgroundColor: "black",
          left: `${startPercent}%`,
          width: "10px",
          position: "absolute",
          cursor: "ew-resize",
          zIndex: 1,
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
          backgroundColor: "black",
          left: `${endPercent}%`,
          width: "10px",
          position: "absolute",
          cursor: "ew-resize",
          zIndex: 1,
        }}
      />
    </Box>
  );
}

export default JobScheduleBar;
