"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { Job } from "@/app/types/types";
import { useTheme } from "@mui/material/styles";
import { editJobs } from "../services/actions/job";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers";

function JobsEdit({
  job,
  setJobModes,
}: {
  job: Job;
  setJobModes: (jobModes: Record<number, string>) => void;
}) {
  const daysOfWeekArray: number[] = [];
  const startTimes: string[] = [];
  const endTimes: string[] = [];

  job.job_schedule.forEach((schedule) => {
    daysOfWeekArray.push(schedule.day_of_week);
    startTimes.push(schedule.start_time);
    endTimes.push(schedule.end_time);
  });

  const [name, setName] = useState(job.name);
  const [hourly_rate, setHourlyRate] = useState(job.hourly_rate);
  const [vacation_days, setVacationDays] = useState(0);
  const [sick_days, setSickDays] = useState(0);
  const [selectedDays, setSelectedDays] = useState<number[]>(daysOfWeekArray);
  const [selectedStartTime, setSelectedStartTime] =
    useState<string[]>(startTimes);
  const [selectedEndTime, setSelectedEndTime] = useState<string[]>(endTimes);
  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleDayChange = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    newDays: React.SetStateAction<number[]>
  ) => {
    setSelectedDays(newDays);
  };

  const data = {
    name,
    hourly_rate,
    vacation_days,
    sick_days,
    job_schedule: job.job_schedule.map((js, index) => ({
      day_of_week: selectedDays[index],
      start_time: selectedStartTime[index],
      end_time: selectedEndTime[index],
    })),
  };

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleSubmit = async () => {
    // Submit data
    try {
      await editJobs(data, job.id);

      // Show success message
      showSnackbar(`Job "${name}" edited successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error editing expense "${name}"`, "error");
    }

    // Close form
    setJobModes({});
  };

  return (
    <Card
      sx={{
        position: "relative",
        maxWidth: "18rem",
      }}
    >
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={() => setJobModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit Expense - Step ${activeStep + 1} of 4`}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        {activeStep === 0 ? (
          <>
            <TextField
              label="Name"
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Hourly Rate"
              variant="standard"
              value={hourly_rate}
              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
              fullWidth
            />
            <br />
            <br />
          </>
        ) : activeStep === 1 ? (
          <>
            <TextField
              label="Vacation Days"
              variant="standard"
              value={vacation_days}
              onChange={(e) => setVacationDays(parseInt(e.target.value))}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Sick Days"
              variant="standard"
              value={sick_days}
              onChange={(e) => setSickDays(parseInt(e.target.value))}
              fullWidth
            />
          </>
        ) : activeStep === 2 ? (
          <>
            <ToggleButtonGroup
              value={selectedDays}
              onChange={handleDayChange}
              aria-label="day of week"
            >
              {daysOfWeek.map((day) => (
                <ToggleButton key={day} value={day} aria-label={day}>
                  {day}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <TimePicker
                label="Select Start Time"
                value={selectedStartTime}
                onChange={(newValue) => setSelectedStartTime(newValue)}
              />
              <TimePicker
                label="Select End Time"
                value={selectedEndTime}
                onChange={(newValue) => setSelectedEndTime(newValue)}
              />
            </LocalizationProvider>
            <br />
            <br />
            <Button variant="contained" onClick={handleSubmit}>
              Submit
            </Button>
          </>
        ) : null}
        <br />
        <br />
        <MobileStepper
          variant="dots"
          steps={2}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === 1}
            >
              Next
              {theme.direction === "rtl" ? (
                <KeyboardArrowLeft />
              ) : (
                <KeyboardArrowRight />
              )}
            </Button>
          }
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={activeStep === 0}
            >
              {theme.direction === "rtl" ? (
                <KeyboardArrowRight />
              ) : (
                <KeyboardArrowLeft />
              )}
              Back
            </Button>
          }
        />
      </CardContent>
    </Card>
  );
}

export default JobsEdit;
