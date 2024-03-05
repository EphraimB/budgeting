"use client";

import { useState } from "react";
import { editTax } from "../services/actions/tax";
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
import { Tax } from "@/app/types/types";

function TaxEdit({ tax, setTaxModes }: { tax: Tax; setTaxModes: any }) {
  const [title, setTitle] = useState(tax.title);
  const [description, setDescription] = useState(tax.description);
  const [rate, setRate] = useState(tax.rate.toString());
  const [type, setType] = useState(tax.type);
  const [activeStep, setActiveStep] = useState(0);

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
    type: type,
  };

  const handleSubmit = async () => {
    // Submit data
    try {
      await editTax(data, tax.id);
    } catch (error) {
      console.log(error);
    }

    // Close form
    setTaxModes({});
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
        onClick={() => setTaxModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit Tax - Step ${activeStep + 1} of 2`}
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
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Description"
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
            />
          </>
        ) : activeStep === 1 ? (
          <>
            <TextField
              label="Rate"
              variant="standard"
              // Convert the decimal to a percentage for display
              value={`${parseFloat(rate) * 100}%`}
              onChange={(e) => {
                // Remove the '%' sign and convert back to decimal for the state
                const valueWithoutPercent = e.target.value.replace("%", "");
                if (
                  !isNaN(parseInt(valueWithoutPercent)) &&
                  valueWithoutPercent !== ""
                ) {
                  setRate(String(parseFloat(valueWithoutPercent) / 100));
                } else if (valueWithoutPercent === "") {
                  // Handle the case where the input field is cleared
                  setRate("");
                }
              }}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Type"
              variant="standard"
              value={type}
              onChange={(e) => setType(parseInt(e.target.value))}
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

export default TaxEdit;
