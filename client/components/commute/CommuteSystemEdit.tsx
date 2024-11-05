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
import { editCommuteSystem } from "../../services/actions/commuteSystem";
import { useTheme } from "@mui/material/styles";
import { Checkbox, FormControlLabel, MobileStepper } from "@mui/material";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { CommuteSystem } from "@/app/types/types";

function CommuteSystemEdit({
  commuteSystem,
  setCommuteSystemModes,
}: {
  commuteSystem: CommuteSystem;
  setCommuteSystemModes: (commuteSystemModes: Record<number, string>) => void;
}) {
  const [name, setName] = useState(commuteSystem.name);
  const [fareCapEnabled, setFareCapEnabled] = useState(!!commuteSystem.fareCap);
  const [fareCap, setFareCap] = useState<number | null>(commuteSystem.fareCap);
  const [fareCapDuration, setFareCapDuration] = useState<number | null>(
    commuteSystem.fareCapDuration
  );

  const [nameError, setNameError] = useState("");
  const [fareCapError, setFareCapError] = useState("");
  const [fareCapDurationError, setFareCapDurationError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    name,
    fareCap,
    fareCapDuration,
  };

  const validateName = () => {
    if (!name) {
      setNameError("Name is required");

      return false;
    }

    return true;
  };

  const validateFareCap = () => {
    if (!fareCap) {
      setFareCapError("Fare cap is required");

      return false;
    }

    return true;
  };

  const validateFareCapDuration = () => {
    if (!fareCapDuration) {
      setFareCapDurationError("Fare cap duration is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();
    const isFareCapValid = validateFareCap();
    const isFareCapDurationValid = validateFareCapDuration();

    if (isNameValid && isFareCapValid && isFareCapDurationValid) {
      // Submit data
      try {
        await editCommuteSystem(data, commuteSystem.id);

        // Show success message
        showSnackbar(`Commute system "${name}" edited successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error editing commute system "${name}"`, "error");
      }

      // Close form
      setCommuteSystemModes({});
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before editing this commute system",
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

  const handleFareCapEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFareCapEnabled(e.target.checked);

    if (e.target.checked) {
      setFareCap(0);
    } else {
      setFareCap(null);
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
        onClick={() => setCommuteSystemModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit Commute System - Step ${activeStep + 1} of 2`}
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
          </>
        ) : activeStep === 1 ? (
          <>
            <FormControlLabel
              control={
                <Checkbox
                  checked={fareCapEnabled}
                  onChange={handleFareCapEnabledChange}
                />
              }
              label="Fare cap enabled"
            />
            {fareCapEnabled && (
              <>
                <TextField
                  label="Fare cap"
                  variant="standard"
                  value={fareCap}
                  error={!!fareCapError}
                  helperText={fareCapError}
                  onChange={(e) => setFareCap(parseInt(e.target.value))}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                  fullWidth
                />
                <br />
                <br />
                <TextField
                  label="Fare cap duration"
                  variant="standard"
                  value={fareCapDuration}
                  error={!!fareCapDurationError}
                  helperText={fareCapDurationError}
                  onChange={(e) => setFareCapDuration(parseInt(e.target.value))}
                  fullWidth
                />
              </>
            )}
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

export default CommuteSystemEdit;
