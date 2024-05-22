"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useTheme } from "@mui/material/styles";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { addWishlist } from "../services/actions/wishlist";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Slider,
} from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Tax } from "@/app/types/types";

dayjs.extend(utc);

function NewWishlistForm({
  account_id,
  taxes,
  setShowWishlistForm,
  total_items,
}: {
  account_id: number;
  taxes: Tax[];
  setShowWishlistForm: (show: boolean) => void;
  total_items: number;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [tax_id, setTaxId] = useState(0);
  const [priority, setPriority] = useState(total_items);
  const [url_link, setUrlLink] = useState("");
  const [preorder, setPreorder] = useState(false);
  const [date_available, setDateAvailable] = useState<null | string>(null);

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");

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
    account_id,
    title,
    description,
    amount: parseFloat(amount),
    tax_id: tax_id === 0 ? null : tax_id,
    priority,
    url_link,
    date_available,
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

  const validateAmount = () => {
    if (parseFloat(amount) <= 0) {
      setAmountError("Amount is required");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isAmountValid = validateAmount();

    if (isTitleValid && isDescriptionValid && isAmountValid) {
      // Submit data
      try {
        await addWishlist(data);

        // Show success message
        showSnackbar(`Wishlist named "${title}" added successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error adding wishlist named "${title}"`, "error");
      }

      // Close form
      setShowWishlistForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this wishlist",
        "error"
      );
    }
  };

  const handlePreorderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreorder(e.target.checked);

    if (e.target.checked) {
      setDateAvailable(dayjs().format());
    } else {
      setDateAvailable(null);
    }
  };

  function valuetext(value: number) {
    return `${value}`;
  }

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
        onClick={() => setShowWishlistForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Add wishlist - Step ${activeStep + 1} of 3`}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        {activeStep === 0 ? (
          <>
            <TextField
              label="Amount"
              variant="standard"
              inputProps={{
                step: 0.01,
              }}
              value={amount}
              error={!!amountError}
              helperText={amountError}
              onChange={(e) => setAmount(e.target.value)}
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
            <FormControl fullWidth>
              <InputLabel id="tax-select-label">Tax</InputLabel>
              <Select
                labelId="tax-select-label"
                label="Tax"
                variant="standard"
                value={tax_id}
                onChange={(e) => setTaxId(e.target.value as number)}
              >
                <MenuItem value={0}>No tax - 0%</MenuItem>
                {taxes.map((tax: Tax) => (
                  <MenuItem key={tax.id} value={tax.id}>
                    {tax.title} - {tax.rate * 100}%
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <br />
            <br />
            <Slider
              aria-label="Priority"
              value={priority}
              getAriaValueText={valuetext}
              valueLabelDisplay="auto"
              step={1}
              marks
              min={0}
              max={total_items}
              onChange={(e, value) => {
                if (typeof value === "number") {
                  setPriority(value);
                }
              }}
            />
            <br />
            <br />
            <TextField
              label="URL Link"
              variant="standard"
              value={url_link}
              onChange={(e) => setUrlLink(e.target.value)}
            />
          </>
        ) : activeStep === 2 ? (
          <>
            <FormControlLabel
              control={
                <Checkbox checked={preorder} onChange={handlePreorderChange} />
              }
              label="Preorder?"
            />
            {preorder && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  label="Product avalable date"
                  value={dayjs.utc(date_available).local()}
                  onChange={(e: Dayjs | null) => {
                    const utcDate = e ? e.utc().format() : dayjs.utc().format();
                    setDateAvailable(utcDate);
                  }}
                />
              </LocalizationProvider>
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

export default NewWishlistForm;
