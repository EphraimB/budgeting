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
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import dayjs, { Dayjs } from "dayjs";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import utc from "dayjs/plugin/utc";
import { addLoan } from "../../services/actions/loan";
import InputAdornment from "@mui/material/InputAdornment";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

dayjs.extend(utc);

function NewLoanForm({
  accountId,
  setShowLoanForm,
}: {
  accountId: number;
  setShowLoanForm: (show: boolean) => void;
}) {
  const [recipient, setRecipient] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [planAmount, setPlanAmount] = useState("0");
  const [subsidized, setSubsidized] = useState("0");
  const [frequencyType, setFrequencyType] = useState(2);
  const [frequencyDayOfWeek, setFrequencyDayOfWeek] = useState(-1);
  const [frequencyWeekOfMonth, setFrequencyWeekOfMonth] = useState(-1);
  const [frequencyMonthOfYear, setFrequencyMonthOfYear] = useState(-1);
  const [frequencyTypeVariable, setFrequencyTypeVariable] = useState<number>(1);
  const [interestRate, setInterestRate] = useState("0");
  const [interestFrequencyType, setInterestFrequencyType] = useState(2);
  const [beginDate, setBeginDate] = useState<string>(dayjs().format());

  const [recipientError, setRecipientError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [planAmountError, setPlanAmountError] = useState("");
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
    accountId,
    recipient,
    title,
    description,
    planAmount: parseFloat(planAmount),
    amount: parseFloat(amount),
    subsidized: parseFloat(subsidized),
    frequency: {
      type: frequencyType,
      dayOfWeek: frequencyDayOfWeek === -1 ? null : frequencyDayOfWeek,
      weekOfMonth: frequencyWeekOfMonth === -1 ? null : frequencyWeekOfMonth,
      monthOfYear: frequencyMonthOfYear === -1 ? null : frequencyMonthOfYear,
      dayOfMonth: null,
      typeVariable: frequencyTypeVariable,
    },
    interestRate: parseFloat(interestRate) / 100,
    interestFrequencyType: interestFrequencyType,
    beginDate,
  };

  const validateRecipient = () => {
    if (!title) {
      setRecipientError("Recipient is required");

      return false;
    }

    return true;
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

  const validatePlanAmount = () => {
    if (parseFloat(planAmount) <= 0) {
      setPlanAmountError("Plan amount needs to be more than $0.00");

      return false;
    }

    return true;
  };

  const validateAmount = () => {
    if (parseFloat(amount) <= 0) {
      setAmountError("Amount needs to be more than $0.00");

      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const isRecipientValid = validateRecipient();
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isPlanAmountValid = validatePlanAmount();
    const isAmountValid = validateAmount();

    if (
      isRecipientValid &&
      isTitleValid &&
      isDescriptionValid &&
      isPlanAmountValid &&
      isAmountValid
    ) {
      // Submit data
      try {
        await addLoan(data);

        // Show success message
        showSnackbar(`Loan named "${title}" added successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error adding loan named "${title}"`, "error");
      }

      // Close form
      setShowLoanForm(false);
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before adding this loan",
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
        onClick={() => setShowLoanForm(false)}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Add Loan - Step ${activeStep + 1} of 5`}
        sx={{
          textAlign: "center",
        }}
      />
      <CardContent>
        {activeStep === 0 ? (
          <>
            <TextField
              label="Recipient"
              variant="standard"
              value={recipient}
              error={!!recipientError}
              helperText={recipientError}
              onChange={(e) => setRecipient(e.target.value)}
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
            <TextField
              label="Plan Amount"
              variant="standard"
              type="number"
              value={planAmount ? planAmount : "0"}
              onChange={(e) => setPlanAmount(e.target.value)}
              error={!!planAmountError}
              helperText={planAmountError}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  inputProps: {
                    step: 0.01,
                  },
                },
              }}
            />
            <br />
            <br />
            <TextField
              label="Amount"
              variant="standard"
              type="number"
              value={amount ? amount : "0"}
              error={!!amountError}
              helperText={amountError}
              onChange={(e) => setAmount(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  inputProps: {
                    step: 0.01,
                  },
                },
              }}
            />
            <br />
            <br />
            <TextField
              label="Subsidized"
              variant="standard"
              type="number"
              value={subsidized ? parseFloat(subsidized) * 100 : "0"}
              onChange={(e) =>
                setSubsidized((parseFloat(e.target.value) / 100).toString())
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                  inputProps: {
                    step: 0.01,
                  },
                },
              }}
            />
          </>
        ) : activeStep === 2 ? (
          <>
            <FormControl fullWidth>
              <InputLabel id="frequency-select-label">Frequency</InputLabel>
              <Select
                labelId="frequency-select-label"
                label="Frequency"
                variant="standard"
                value={frequencyType}
                onChange={(e) => setFrequencyType(e.target.value as number)}
              >
                <MenuItem value={0}>Daily</MenuItem>
                <MenuItem value={1}>Weekly</MenuItem>
                <MenuItem value={2}>Monthly</MenuItem>
                <MenuItem value={3}>Yearly</MenuItem>
              </Select>
            </FormControl>
            {(frequencyType === 1 ||
              frequencyType === 2 ||
              frequencyType === 3) && (
              <>
                <br />
                <br />
                <FormControl fullWidth>
                  <InputLabel id="frequency-day-of-week-select-label">
                    Day of Week
                  </InputLabel>
                  <Select
                    labelId="frequency-day-of-week-select-label"
                    label="Frequency"
                    variant="standard"
                    value={frequencyDayOfWeek}
                    onChange={(e) =>
                      setFrequencyDayOfWeek(e.target.value as number)
                    }
                  >
                    <MenuItem value={-1}>None</MenuItem>
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                    <MenuItem value={2}>Tuesday</MenuItem>
                    <MenuItem value={3}>Wednesday</MenuItem>
                    <MenuItem value={4}>Thursday</MenuItem>
                    <MenuItem value={5}>Friday</MenuItem>
                    <MenuItem value={6}>Saturday</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {(frequencyType === 2 || frequencyType === 3) && (
              <>
                <br />
                <br />
                <FormControl fullWidth>
                  <InputLabel id="frequency-week-of-month-select-label">
                    Week of Month
                  </InputLabel>
                  <Select
                    labelId="frequency-week-of-month-select-label"
                    label="Frequency"
                    variant="standard"
                    value={frequencyWeekOfMonth}
                    onChange={(e) =>
                      setFrequencyWeekOfMonth(e.target.value as number)
                    }
                  >
                    <MenuItem value={-1}>None</MenuItem>
                    <MenuItem value={0}>First</MenuItem>
                    <MenuItem value={1}>Second</MenuItem>
                    <MenuItem value={2}>Third</MenuItem>
                    <MenuItem value={3}>Fourth</MenuItem>
                    <MenuItem value={4}>Last</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {frequencyType === 3 && (
              <>
                <br />
                <br />
                <FormControl fullWidth>
                  <InputLabel id="frequency-month-of-year-select-label">
                    Month of Year
                  </InputLabel>
                  <Select
                    labelId="frequency-month-of-year-select-label"
                    label="Frequency"
                    variant="standard"
                    value={frequencyMonthOfYear}
                    onChange={(e) =>
                      setFrequencyMonthOfYear(e.target.value as number)
                    }
                  >
                    <MenuItem value={-1}>None</MenuItem>
                    <MenuItem value={0}>January</MenuItem>
                    <MenuItem value={1}>February</MenuItem>
                    <MenuItem value={2}>March</MenuItem>
                    <MenuItem value={3}>April</MenuItem>
                    <MenuItem value={4}>May</MenuItem>
                    <MenuItem value={5}>June</MenuItem>
                    <MenuItem value={6}>July</MenuItem>
                    <MenuItem value={7}>August</MenuItem>
                    <MenuItem value={8}>September</MenuItem>
                    <MenuItem value={9}>October</MenuItem>
                    <MenuItem value={10}>November</MenuItem>
                    <MenuItem value={11}>December</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            <br />
            <br />
            <TextField
              label="Frequency Type Variable"
              variant="standard"
              value={frequencyTypeVariable}
              onChange={(e) =>
                setFrequencyTypeVariable(e.target.value as unknown as number)
              }
            />
          </>
        ) : activeStep === 3 ? (
          <>
            <TextField
              label="Interest Rate"
              variant="standard"
              value={parseInt(interestRate) * 100 + "%"}
              onChange={(e) =>
                setInterestRate(
                  e.target.value.substring(0, e.target.value.length - 1)
                )
              }
            />
            <br />
            <br />
            <FormControl fullWidth>
              <InputLabel id="interest-frequency-select-label">
                Interest Frequency
              </InputLabel>
              <Select
                labelId="interest-frequency-select-label"
                label="Interest Frequency"
                variant="standard"
                value={interestFrequencyType}
                onChange={(e) =>
                  setInterestFrequencyType(e.target.value as number)
                }
              >
                <MenuItem value={0}>Daily</MenuItem>
                <MenuItem value={1}>Weekly</MenuItem>
                <MenuItem value={2}>Monthly</MenuItem>
                <MenuItem value={3}>Yearly</MenuItem>
              </Select>
            </FormControl>
          </>
        ) : activeStep === 4 ? (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Loan begin date"
                value={dayjs.utc(beginDate).local()}
                onChange={(e: Dayjs | null) => {
                  const utcDate = e ? e.utc().format() : dayjs.utc().format();
                  setBeginDate(utcDate);
                }}
              />
            </LocalizationProvider>
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
          steps={5}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === 4}
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

export default NewLoanForm;
