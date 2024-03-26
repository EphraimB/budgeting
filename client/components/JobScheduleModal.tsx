"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import { createTheme } from "@mui/material/styles";
import { JobSchedule } from "@/app/types/types";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

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

const generateHourTicks = () => {
  const ticks = [];
  for (let i = 0; i < 24; i++) {
    const showHourText = i % 4 === 0; // Show hour text only every 4 hours

    ticks.push(
      <Box
        key={i}
        sx={{
          position: "absolute",
          left: `${(100 / 24) * i}%`,
          top: "-20px", // Adjust this value as needed to position the time text
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // Center the tick and text above it
        }}
      >
        {showHourText && ( // Conditionally render the Typography component
          <Typography
            variant="caption"
            sx={{
              color: "black",
              mb: 0.5, // Margin bottom to create some space between the text and the tick
            }}
          >
            {`${i}:00`} // Displaying the hour
          </Typography>
        )}
        <Box
          sx={{
            height: "5px",
            width: "2px",
            backgroundColor: "black",
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
        <Typography variant="h6" component="h2">
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
