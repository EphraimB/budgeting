"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Typography } from "@mui/material";
import { JobSchedule } from "@/app/types/types";
import JobScheduleView from "./JobScheduleView";
import JobScheduleModal from "./JobScheduleModal";

function JobScheduleDayView({ job_schedule }: { job_schedule: JobSchedule[] }) {
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
            job_day_of_week={job_schedule.filter(
              (js) => js.day_of_week === index
            )}
            day_of_week={index}
            handleOpenModal={handleOpenModal}
          />
        </Paper>
      ))}
      {modalState.dayOfWeek && (
        <JobScheduleModal
          job_day_of_week={job_schedule.filter(
            (js) => js.day_of_week === modalState.dayOfWeek
          )}
          day_of_week={modalState.dayOfWeek}
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
