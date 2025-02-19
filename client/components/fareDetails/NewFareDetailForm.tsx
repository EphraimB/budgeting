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
import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  MobileStepper,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { FareDetail } from "@/app/types/types";
import { addFareDetail } from "../../services/actions/fareDetail";

function NewFareDetailForm({
  setShowFareDetailForm,
  accountId,
  commuteSystemId,
  commuteStationId,
  fareDetails,
}: {
  setShowFareDetailForm: (showFareDetailForm: boolean) => void;
  accountId: number;
  commuteSystemId: number;
  commuteStationId: number;
  fareDetails: FareDetail[];
}) {
  const [name, setName] = useState("");
  const [fare, setFare] = useState("0");
  const [timedPassEnabled, setTimedPassEnabled] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);
  const [dayStartEnabled, setDayStartEnabled] = useState(false);
  const [dayStart, setDayStart] = useState<number | null>(null);
  const [alternateFareDetailId, setAlternateFareDetailId] = useState("0");

  const [nameError, setNameError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    accountId,
    commuteSystemId,
    stationId: commuteStationId,
    name,
    fare: parseFloat(fare),
    timeslots: [],
    duration,
    dayStart,
    alternateFareDetailId:
      alternateFareDetailId === "0" ? null : parseInt(alternateFareDetailId),
  };

  const validateName = () => {
    if (!name) {
      setNameError("Name is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();

    if (isNameValid) {
      // Submit data
      try {
        await addFareDetail(data);

        // Show success message
        showSnackbar(`Fare detail "${name}" created successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error creating fare detail "${name}"`, "error");
      }

      setShowFareDetailForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this fare detail",
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

  const handleTimedPassEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTimedPassEnabled(e.target.checked);

    if (e.target.checked) {
      setDuration(30);
      setDayStart(null);
    } else {
      setDuration(null);
      setDayStart(null);
    }
  };

  const handleDayStartEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDayStartEnabled(e.target.checked);

    if (e.target.checked) {
      setDayStart(1);
    } else {
      setDayStart(null);
    }
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
        onClick={() => setShowFareDetailForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`New Fare Detail - Step ${activeStep + 1} of 3`}
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
              label="Fare"
              variant="standard"
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
              fullWidth
            />
          </>
        ) : activeStep === 1 ? (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={timedPassEnabled}
                  onChange={handleTimedPassEnabledChange}
                />
              }
              label="Fare duration enabled"
            />
            {timedPassEnabled && (
              <>
                <TextField
                  label="Duration"
                  variant="standard"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  fullWidth
                />
                <br />
                <br />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={dayStartEnabled}
                      onChange={handleDayStartEnabledChange}
                    />
                  }
                  label="Day start enabled"
                />
                {dayStartEnabled && (
                  <TextField
                    label="Day start"
                    variant="standard"
                    value={dayStart}
                    onChange={(e) => setDayStart(parseInt(e.target.value))}
                    fullWidth
                  />
                )}
              </>
            )}
          </>
        ) : activeStep === 2 ? (
          <>
            <FormControl fullWidth>
              <InputLabel id="select-alternate-fare-duration-label">
                Alternate fare
              </InputLabel>
              <Select
                labelId="select-alternate-fare-duration-label" // Ensure this matches InputLabel's id
                id="select-alternate-fare"
                value={(alternateFareDetailId as unknown as string) ?? 0}
                label="Alternate fare"
                onChange={(e: SelectChangeEvent) =>
                  setAlternateFareDetailId(e.target.value)
                }
              >
                <MenuItem value={0}>None</MenuItem>
                {fareDetails.map((fareDetail: FareDetail) => (
                  <MenuItem key={fareDetail.id} value={fareDetail.id}>
                    {fareDetail.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
          steps={3}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === 2}
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

export default NewFareDetailForm;
