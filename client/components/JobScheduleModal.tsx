"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { JobSchedule } from "@/app/types/types";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Import plugin for custom parsing
dayjs.extend(customParseFormat);

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

const isMobileView = () => {
  return window.innerWidth <= 768; // Adjust threshold as needed for mobile view
};

const is12HourClock = () => {
  const dateTimeFormat = new Intl.DateTimeFormat([], {
    hour: "numeric",
    hour12: true,
  });
  // Format a date at 23:00 to see if 'AM'/'PM' is used in the formatted string
  const formattedTime = dateTimeFormat.format(new Date(0, 0, 0, 23, 0, 0));
  return formattedTime.includes("AM") || formattedTime.includes("PM");
};

const generateHourTicks = () => {
  const ticks = [];
  const use12HourClock = is12HourClock(); // Determine if we should use 12-hour clock
  const mobileView = isMobileView(); // Check if we are in mobile view

  for (let i = 0; i < 24; i++) {
    const showHourLabel = mobileView
      ? i === 0 || i === 12 || i === 23
      : i % 4 === 0;
    let timeString = use12HourClock
      ? dayjs().hour(i).minute(0).format("hA")
      : dayjs().hour(i).minute(0).format("HH");

    // For mobile view, adjust the format to be shorter and adjust font size
    if (mobileView && showHourLabel) {
      timeString = dayjs().hour(i).minute(0).format("hA"); // e.g., '12A', '12P'
    }

    ticks.push(
      <Box
        key={i}
        sx={{
          position: "absolute",
          left: `${(100 / 24) * i}%`,
          top: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {showHourLabel && (
          <Typography
            variant="caption"
            sx={{
              color: "black",
              position: "absolute",
              top: mobileView ? "-15px" : "-20px", // Closer to the tick in mobile view
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: mobileView ? "0.7rem" : "inherit", // Smaller font size for mobile view
            }}
          >
            {timeString}
          </Typography>
        )}
        <Box
          sx={{
            height: mobileView ? "75%" : "100%", // Shorter ticks for mobile view
            width: "1px",
            backgroundColor: showHourLabel ? "black" : "rgba(0,0,0,0.5)",
            position: "absolute",
            top: showHourLabel
              ? mobileView
                ? "3px"
                : "5px"
              : mobileView
              ? "8px"
              : "10px",
          }}
        />
      </Box>
    );
  }
  return ticks;
};

function JobScheduleModal({
  job_day_of_week,
  day_of_week,
  open,
  setOpen,
}: {
  job_day_of_week: JobSchedule[];
  day_of_week: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack
        direction="column"
        spacing={2}
        sx={{ width: "50%", bgcolor: "background.paper", p: 4 }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          {day_of_week}
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "20px",
            backgroundColor: theme.palette.background.default,
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {generateHourTicks()}
          {job_day_of_week.map((job) => {
            const startPercent = timeToPercent(job.start_time);
            const endPercent = timeToPercent(job.end_time);
            const widthPercent = endPercent - startPercent;

            return (
              <Box
                key={job.start_time}
                sx={{
                  height: "100%",
                  backgroundColor: theme.palette.primary.main,
                  position: "absolute",
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                }}
              />
            );
          })}
        </Box>
      </Stack>
    </Modal>
  );
}

export default JobScheduleModal;
