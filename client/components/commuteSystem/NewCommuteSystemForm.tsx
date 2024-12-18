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
import { addCommuteSystem } from "../../services/actions/commuteSystem";
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

function NewCommuteSystemForm({
  setShowCommuteSystemForm,
}: {
  setShowCommuteSystemForm: (showCommuteSystemForm: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [fareCapEnabled, setFareCapEnabled] = useState(false);
  const [fareCap, setFareCap] = useState<number | null>(null);
  const [fareCapDuration, setFareCapDuration] = useState<string | null>(null);

  const [nameError, setNameError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    name,
    fareCap,
    fareCapDuration: fareCapDuration ? parseInt(fareCapDuration) : null,
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
        await addCommuteSystem(data);

        // Show success message
        showSnackbar(`Commute system "${name}" created successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error creating commute system "${name}"`, "error");
      }

      setShowCommuteSystemForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this commute system",
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

  const handleChangeFareCapDuration = (e: SelectChangeEvent) => {
    setFareCapDuration(e.target.value);
  };

  return (
    <Card
      sx={{
        maxWidth: "18rem",
        position: "relative",
      }}
      data-testid="new-commute-system-form"
    >
      <IconButton
        aria-label="close"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={() => setShowCommuteSystemForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`New Commute System - Step ${activeStep + 1} of 2`}
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
                  onChange={(e) => setFareCap(parseInt(e.target.value))}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
                <br />
                <br />
                <FormControl fullWidth>
                  <InputLabel id="select-fare-cap-duration-label">
                    Fare cap duration
                  </InputLabel>
                  <Select
                    labelId="select-fare-cap-duration-label"
                    id="select-fare-cap-duration"
                    value={fareCapDuration ? fareCapDuration : "0"}
                    label="Fare cap duration"
                    onChange={handleChangeFareCapDuration}
                  >
                    <MenuItem value={0}>Daily</MenuItem>
                    <MenuItem value={1}>Weekly</MenuItem>
                    <MenuItem value={2}>Monthly</MenuItem>
                    <MenuItem value={3}>Yearly</MenuItem>
                  </Select>
                </FormControl>
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

export default NewCommuteSystemForm;
