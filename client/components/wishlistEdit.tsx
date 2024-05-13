"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { Loan, Wishlist } from "@/app/types/types";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { useTheme } from "@mui/material/styles";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import utc from "dayjs/plugin/utc";
import { editLoan } from "../services/actions/loan";
import InputAdornment from "@mui/material/InputAdornment";
import { useAlert, useSnackbar } from "../context/FeedbackContext";
import { editWishlist } from "../services/actions/wishlist";

dayjs.extend(utc);

function WishlistEdit({
  account_id,
  wishlist,
  setWishlistModes,
}: {
  account_id: number;
  wishlist: Wishlist;
  setWishlistModes: (wishlistModes: Record<number, string>) => void;
}) {
  const [title, setTitle] = useState(wishlist.wishlist_title);
  const [description, setDescription] = useState(wishlist.wishlist_description);
  const [amount, setAmount] = useState(wishlist.wishlist_amount.toString());
  const [priority, setPriority] = useState(wishlist.wishlist_priority);
  const [url_link, setUrlLink] = useState(wishlist.wishlist_url_link);
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
        title={`Edit wishlist - Step ${activeStep + 1} of 2`}
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
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

export default WishlistEdit;
