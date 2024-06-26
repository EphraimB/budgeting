"use client";

import { useState } from "react";
import { addTax } from "../../services/actions/tax";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MobileStepper from "@mui/material/MobileStepper";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useTheme } from "@mui/material/styles";
import InputAdornment from "@mui/material/InputAdornment";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

function NewTaxForm({
  setShowTaxForm,
}: {
  setShowTaxForm: (show: boolean) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState("0");
  const [type, setType] = useState("0");

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [rateError, setRateError] = useState("");

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
    title,
    description,
    rate: parseFloat(rate),
    type: parseInt(type),
  };

  const validateTitle = () => {
    if (!title) {
      setTitleError("Title is required");

      return false;
    }

    return true;
  };

  const validateDescription = () => {
    if (!description) {
      setDescriptionError("Description is required");

      return false;
    }

    return true;
  };

  const validateRate = () => {
    if (parseFloat(rate) <= 0) {
      setRateError("Rate is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isRateValid = validateRate();

    if (isTitleValid && isDescriptionValid && isRateValid) {
      // Submit data
      try {
        await addTax(data);

        // Show success message
        showSnackbar(`Tax "${title}" added successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error adding tax "${title}"`, "error");
      }

      // Close form
      setShowTaxForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this tax",
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
        onClick={() => setShowTaxForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`New Tax - Step ${activeStep + 1} of 2`}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        {activeStep === 0 ? (
          <>
            <TextField
              label="Title"
              variant="standard"
              value={title}
              error={!!titleError}
              helperText={titleError}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Description"
              variant="standard"
              value={description}
              error={!!descriptionError}
              helperText={descriptionError}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </>
        ) : activeStep === 1 ? (
          <>
            <TextField
              label="Rate"
              variant="standard"
              type="number"
              error={!!rateError}
              helperText={rateError}
              inputProps={{
                step: 0.01,
              }}
              value={rate ? parseFloat(rate) * 100 : "0"}
              onChange={(e) =>
                setRate((parseFloat(e.target.value) / 100).toString())
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Type"
              variant="standard"
              value={type}
              onChange={(e) => setType(e.target.value)}
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

export default NewTaxForm;
