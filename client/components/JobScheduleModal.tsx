"use client";

import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
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
      </Stack>
    </Modal>
  );
}

export default JobScheduleModal;
