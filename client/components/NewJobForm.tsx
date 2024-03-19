"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { Job } from "@/app/types/types";
import { useTheme } from "@mui/material/styles";
import { addJob } from "../services/actions/job";
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

function NewJobForm({
  setShowJobForm,
  account_id,
}: {
  setShowJobForm: (showJobForm: boolean) => void;
  account_id: number;
}) {
  const [name, setName] = useState("");
  const [hourly_rate, setHourlyRate] = useState(0);
  const [vacation_days, setVacationDays] = useState(0);
  const [sick_days, setSickDays] = useState(0);
  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const data = {
    account_id,
    name,
    hourly_rate,
    vacation_days,
    sick_days,
    job_schedule: [],
  };

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const handleSubmit = async () => {
    // Submit data
    try {
      await addJob(data);

      // Show success message
      showSnackbar(`Job "${name}" created successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error creating job "${name}"`, "error");
    }

    setShowJobForm(false);
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
        onClick={() => setShowJobForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Add Job - Step ${activeStep + 1} of 2`}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
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

export default NewJobForm;
