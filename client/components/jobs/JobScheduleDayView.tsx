"use client";

import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import { Job } from "@/app/types/types";
import JobScheduleView from "./JobScheduleView";
import JobScheduleModal from "./JobScheduleModal";

function JobScheduleDayView({ job }: { job: Job }) {
  const [modalState, setModalState] = useState<{
    open: boolean;
    dayOfWeek: number | null;
  }>({ open: false, dayOfWeek: null });

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleOpenModal = (day: number) => {
    setModalState({
      open: true,
      dayOfWeek: day,
    });
  };

  return (
    <Stack
      position="relative"
      direction="row"
      spacing={2}
      useFlexGap
      flexWrap="wrap"
      justifyContent="center"
    >
      {days.map((day, index) => (
        <Paper
          key={index}
          sx={{
            backgroundColor: "black",
            color: "white",
            p: 2,
            position: "relative",
          }}
        >
          <Typography
            variant="body2"
            component="p"
            sx={{ textAlign: "center" }}
            gutterBottom
          >
            {day}
          </Typography>
          <JobScheduleView
            jobDayOfWeek={job.jobSchedule.filter(
              (js) => js.dayOfWeek === index
            )}
            dayOfWeek={index}
            handleOpenModal={handleOpenModal}
          />
        </Paper>
      ))}
      {modalState.dayOfWeek !== null && (
        <JobScheduleModal
          job={job}
          jobDayOfWeek={job.jobSchedule.filter(
            (js) => js.dayOfWeek === modalState.dayOfWeek
          )}
          dayOfWeek={modalState.dayOfWeek}
          open={modalState.open}
          setOpen={(isOpen) =>
            setModalState((prevState) => ({ ...prevState, open: isOpen }))
          }
        />
      )}
    </Stack>
  );
}

export default JobScheduleDayView;
