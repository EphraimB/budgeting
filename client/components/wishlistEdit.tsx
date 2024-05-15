"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { Wishlist } from "@/app/types/types";
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
import { editWishlist } from "../services/actions/wishlist";
import { Checkbox, FormControlLabel, InputAdornment } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

dayjs.extend(utc);

function WishlistEdit({
  account_id,
  wishlist,
  setWishlistModes,
  total_items,
}: {
  account_id: number;
  wishlist: Wishlist;
  setWishlistModes: (wishlistModes: Record<number, string>) => void;
  total_items: number;
}) {
  const [title, setTitle] = useState(wishlist.wishlist_title);
  const [description, setDescription] = useState(wishlist.wishlist_description);
  const [amount, setAmount] = useState(wishlist.wishlist_amount.toString());
  const [priority, setPriority] = useState(wishlist.wishlist_priority);
  const [url_link, setUrlLink] = useState(wishlist.wishlist_url_link);
  const [preorder, setPreorder] = useState(!!wishlist.wishlist_date_available);
  const [date_available, setDateAvailable] = useState<null | string>(
    wishlist.wishlist_date_available
  );
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
    priority,
    url_link,
    date_available,
  };

  const handleSubmit = async () => {
    // Submit data
    try {
      await editWishlist(data, wishlist.id);

      // Show success message
      showSnackbar(`Wishlist "${title}" edited successfully`);
    } catch (error) {
      console.log(error);

      // Show error message
      showAlert(`Error editing wishlist "${title}"`, "error");
    }

    // Close form
    setWishlistModes({});
  };

  const handlePreorderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreorder(e.target.checked);

    if (e.target.checked) {
      setDateAvailable(dayjs().format());
    } else {
      setDateAvailable(null);
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
        onClick={() => setWishlistModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit wishlist - Step ${activeStep + 1} of 3`}
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
              label="Priority"
              variant="standard"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value))}
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

export default WishlistEdit;
