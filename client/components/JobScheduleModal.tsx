"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { JobSchedule } from "@/app/types/types";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Import plugin for custom parsing
import JobScheduleBar from "./JobScheduleBar";
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
              top: "-15px",
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              fontSize: "0.7rem",
            }}
          >
            {timeString}
          </Typography>
        )}
        <Box
          sx={{
            height: "75%",
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
  day_of_week: number;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const [jobSchedules, setJobSchedules] = React.useState(job_day_of_week);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const options = {
    scrollAngleRanges: [{ start: 300 }, { end: 60 }, { start: 120, end: 240 }],
  };

  const updateJobSchedule = (
    start_time: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    const updatedJobs = jobSchedules.map((job) => {
      if (job.start_time === start_time) {
        return { ...job, start_time: newStartTime, end_time: newEndTime };
      }
      return job;
    });

    console.log(updatedJobs);

    setJobSchedules(updatedJobs); // Update the state
  };

  return (
    <DndProvider backend={HTML5Backend} options={options}>
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
            {days[day_of_week]}
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
            {job_day_of_week.map((job, index) => (
              <JobScheduleBar
                key={index}
                job={job}
                index={index}
                updateJobSchedule={updateJobSchedule}
              />
            ))}
          </Box>
        </Stack>
      </Modal>
    </DndProvider>
  );
}

export default JobScheduleModal;
