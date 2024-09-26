"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import { Job } from "@/app/types/types";
import { useTheme } from "@mui/material/styles";
import { editJob } from "../../services/actions/job";
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
import InputAdornment from "@mui/material/InputAdornment";

function JobEdit({
  job,
  setJobModes,
  accountId,
}: {
  job: Job;
  setJobModes: (jobModes: Record<number, string>) => void;
  accountId: number;
}) {
  const [name, setName] = useState(job.name);
  const [hourlyRate, setHourlyRate] = useState(job.hourlyRate);

  const [nameError, setNameError] = useState("");
  const [hourlyRateError, setHourlyRateError] = useState("");

  const [activeStep, setActiveStep] = useState(0);

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const data = {
    accountId,
    name,
    hourlyRate,
    jobSchedule: job.jobSchedule,
  };

  const validateName = () => {
    if (!name) {
      setNameError("Name is required");

      return false;
    }

    return true;
  };

  const validateHourlyRate = () => {
    if (!hourlyRate) {
      setHourlyRateError("Hourly rate is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();
    const isHourlyRateValid = validateHourlyRate();

    if (isNameValid && isHourlyRateValid) {
      // Submit data
      try {
        await editJob(data, job.id);

        // Show success message
        showSnackbar(`Job "${name}" edited successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error editing job "${name}"`, "error");
      }

      // Close form
      setJobModes({});
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before editing this job",
        "error"
      );
    }
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
        title={`Edit Job - Step ${activeStep + 1} of 1`}
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
              error={!!nameError}
              helperText={nameError}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Hourly Rate"
              variant="standard"
              value={hourlyRate}
              error={!!hourlyRateError}
              helperText={hourlyRateError}
              onChange={(e) => setHourlyRate(parseInt(e.target.value))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              fullWidth
            />
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
          steps={1}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === 0}
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

export default JobEdit;
