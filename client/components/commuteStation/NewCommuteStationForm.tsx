"use client";

import React, { useState } from "react";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import { MobileStepper } from "@mui/material";
import {
  ArrowDownward,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { addCommuteStation } from "../../services/actions/commuteStation";

function NewCommuteStationForm({
  setShowCommuteStationForm,
}: {
  setShowCommuteStationForm: (showCommuteStationForm: boolean) => void;
}) {
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [tripDuration, setTripDuration] = useState<number>(0);

  const [fromStationError, setFromStationError] = useState("");
  const [toStationError, setToStationError] = useState("");
  const [tripDurationError, setTripDurationError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    fromStation,
    toStation,
    tripDuration,
  };

  const validateFromStation = () => {
    if (!fromStation) {
      setFromStationError("From station is required");

      return false;
    }

    return true;
  };

  const validateToStation = () => {
    if (!toStation) {
      setToStationError("To station is required");

      return false;
    }

    return true;
  };

  const validateTripDuration = () => {
    if (!tripDuration) {
      setTripDurationError("Trip duration is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isFromStationValid = validateFromStation();
    const isToStationValid = validateToStation();
    const tripDuration = validateTripDuration();

    if (isFromStationValid && isToStationValid && tripDuration) {
      // Submit data
      try {
        await addCommuteStation(data);

        // Show success message
        showSnackbar(
          `Commute station traveling from ${fromStation} to ${toStation} created successfully`
        );
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(
          `Error creating commute station traveling from ${fromStation} to ${toStation}`,
          "error"
        );
      }

      setShowCommuteStationForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this commute station",
        "error"
      );
    }
  };

  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <Card
      sx={{
        maxWidth: "18rem",
        position: "relative",
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
        onClick={() => setShowCommuteStationForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`New Commute Station - Step ${activeStep + 1} of 2`}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        {activeStep === 0 ? (
          <>
            <TextField
              label="From station"
              variant="standard"
              value={fromStation}
              error={!!fromStationError}
              helperText={fromStationError}
              onChange={(e) => setFromStation(e.target.value)}
              fullWidth
            />
            <ArrowDownward />
            <TextField
              label="To station"
              variant="standard"
              value={toStation}
              error={!!toStationError}
              helperText={toStationError}
              onChange={(e) => setToStation(e.target.value)}
              fullWidth
            />
            <br />
            <br />
          </>
        ) : activeStep === 1 ? (
          <>
            <TextField
              label="Trip duration (minutes)"
              variant="standard"
              value={tripDuration}
              error={!!tripDurationError}
              helperText={tripDurationError}
              onChange={(e) => setTripDuration(parseInt(e.target.value))}
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

export default NewCommuteStationForm;
