"use client";

import { useState } from "react";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Button from "@mui/material/Button";
import { editPayrollTax } from "../../services/actions/payrollTax";
import { PayrollTax } from "@/app/types/types";

function PayrollTaxEdit({
  jobId,
  payrollTax,
  setPayrollTaxModes,
}: {
  jobId: number;
  payrollTax: PayrollTax;
  setPayrollTaxModes: (taxModes: Record<number, string>) => void;
}) {
  const [name, setName] = useState(payrollTax.name);
  const [rate, setRate] = useState(payrollTax.rate.toString());

  const [nameError, setNameError] = useState("");
  const [rateError, setRateError] = useState("");

  const { showSnackbar } = useSnackbar();
  const { showAlert } = useAlert();

  const data = {
    jobId,
    name,
    rate: parseFloat(rate),
  };

  const validateName = () => {
    if (!name) {
      setNameError("Name is required");

      return false;
    }

    return true;
  };

  const validateRate = () => {
    if (!name) {
      setRateError("Rate is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isNameValid = validateName();
    const isRateValid = validateRate();

    if (isNameValid && isRateValid) {
      // Submit data
      try {
        await editPayrollTax(data, payrollTax.id);

        // Show success message
        showSnackbar(`Payroll tax "${name}" updated successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error updating payroll tax "${name}"`, "error");
      }

      // Close form
      setPayrollTaxModes({});
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this payroll tax",
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
        onClick={() => setPayrollTaxModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={"Edit payroll tax"}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        <>
          <TextField
            label="Name"
            variant="standard"
            value={name}
            error={!!nameError}
            helperText={nameError}
            onChange={(e: any) => setName(e.target.value)}
            fullWidth
          />
          <br />
          <br />
          <TextField
            label="Payroll tax rate"
            variant="standard"
            type="number"
            value={rate ? parseFloat(rate) * 100 : "0"}
            onChange={(e) =>
              setRate((parseFloat(e.target.value) / 100).toString())
            }
            error={!!rateError}
            helperText={rateError}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="end">%</InputAdornment>
                ),
                inputProps: {
                  step: 0.01,
                },
              },
            }}
            fullWidth
          />
          <br />
          <br />
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </>
      </CardContent>
    </Card>
  );
}

export default PayrollTaxEdit;
