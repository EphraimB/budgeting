"use client";

import React, { useState } from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { Job, JobSchedule } from "@/app/types/types";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat"; // Import plugin for custom parsing
import JobScheduleBar from "./JobScheduleBar";
import { editJob } from "../services/actions/job";
import JobDayTimeslots from "./JobDayTimeslots";
dayjs.extend(customParseFormat);

interface Timeslot {
  startTime: string;
  endTime: string;
}

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
  job,
  job_day_of_week,
  day_of_week,
  open,
  setOpen,
}: {
  job: Job;
  job_day_of_week: JobSchedule[];
  day_of_week: number;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
}) {
  const [jobSchedules, setJobSchedules] = useState(job_day_of_week);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const updateJobSchedule = (
    id: number,
    newStartTime: string,
    newEndTime: string
  ) => {
    const updatedJobs = jobSchedules.map((job, index) => {
      if (index === id) {
        return { ...job, start_time: newStartTime, end_time: newEndTime };
      }
      return job;
    });

    console.log(updatedJobs);

    try {
      editJob(
        {
          account_id: job.account_id,
          name: job.name,
          hourly_rate: job.hourly_rate,
          vacation_days: job.vacation_days,
          sick_days: job.sick_days,
          job_schedule: updatedJobs,
        },
        1
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onSave = (timeslots: Timeslot[]) => {
    timeslots.forEach((timeslot, index) => {
      updateJobSchedule(index, timeslot.startTime, timeslot.endTime);
    });
  };

  const onclose = () => {
    setOpen(false);
  };

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
          {days[day_of_week]}
        </Typography>

        <JobDayTimeslots
          job_schedule={job.job_schedule}
          onSave={onSave}
          onClose={onclose}
        />
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
            <JobScheduleBar key={index} job={job} index={index} />
          ))}
        </Box>
      </Stack>
    </Modal>
  );
}

export default JobScheduleModal;
