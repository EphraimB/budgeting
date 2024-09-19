"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { Expense, Tax } from "@/app/types/types";
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
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { editExpense } from "../../services/actions/expense";
import InputAdornment from "@mui/material/InputAdornment";
import { useAlert, useSnackbar } from "../../context/FeedbackContext";

dayjs.extend(utc);

function ExpenseEdit({
  accountId,
  expense,
  setExpenseModes,
  taxes,
}: {
  accountId: number;
  expense: Expense;
  setExpenseModes: (expenseModes: Record<number, string>) => void;
  taxes: Tax[];
}) {
  const [title, setTitle] = useState(expense.title);
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [subsidized, setSubsidized] = useState(expense.subsidized.toString());
  const [taxId, setTaxId] = useState(expense.taxId || 0);
  const [frequencyType, setFrequencyType] = useState(expense.frequency.type);
  const [frequencyDayOfWeek, setFrequencyDayOfWeek] = useState(
    expense.frequency.dayOfWeek || -1
  );
  const [frequencyWeekOfMonth, setFrequencyWeekOfMonth] = useState(
    expense.frequency.weekOfMonth || -1
  );
  const [frequencyMonthOfYear, setFrequencyMonthOfYear] = useState(
    expense.frequency.monthOfYear || -1
  );
  const [frequencyTypeVariable, setFrequencyTypeVariable] = useState<number>(
    expense.frequency.typeVariable || 1
  );
  const [beginDate, setBeginDate] = useState<string>(expense.beginDate);
  const [endDateEnabled, setEndDateEnabled] = useState(!!expense.endDate);
  const [endDate, setEndDate] = useState<null | string>(expense.endDate);

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
    accountId,
    taxId: taxId === 0 ? null : taxId,
    title,
    description,
    amount: parseFloat(amount),
    subsidized: parseFloat(subsidized),
    frequency: {
      type: frequencyType,
      typeVariable: frequencyTypeVariable,
      dayOfWeek: frequencyDayOfWeek === -1 ? null : frequencyDayOfWeek,
      weekOfMonth: frequencyWeekOfMonth === -1 ? null : frequencyWeekOfMonth,
      monthOfYear: frequencyMonthOfYear === -1 ? null : frequencyMonthOfYear,
      dayOfMonth: null,
    },
    beginDate,
    endDate,
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
      setAmountError("Amount needs to be more than $0.00");

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
        await editExpense(data, expense.id);

        // Show success message
        showSnackbar(`Expense "${title}" edited successfully`);
      } catch (error) {
        console.log(error);

        // Show error message
        showAlert(`Error editing expense "${title}"`, "error");
      }

      // Close form
      setExpenseModes({});
    } else {
      // Show error message
      showAlert(
        "You need to fill in all the required fields before editing this expense",
        "error"
      );
    }
  };

  const handleEndDateEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEndDateEnabled(e.target.checked);

    if (e.target.checked) {
      setEndDate(dayjs().format());
    } else {
      setEndDate(null);
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
        onClick={() => setExpenseModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit Expense - Step ${activeStep + 1} of 4`}
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
              error={!!titleError}
              helperText={titleError}
              fullWidth
            />
            <br />
            <br />
            <TextField
              label="Description"
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={!!descriptionError}
              helperText={descriptionError}
              fullWidth
            />
          </>
        ) : activeStep === 1 ? (
          <>
            <TextField
              label="Amount"
              variant="standard"
              type="number"
              inputProps={{
                step: 0.01,
              }}
              value={amount ? amount : "0"}
              onChange={(e) => setAmount(e.target.value)}
              error={!!amountError}
              helperText={amountError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
            />
            <br />
            <br />
            <FormControl fullWidth>
              <InputLabel id="tax-select-label">Tax</InputLabel>
              <Select
                labelId="tax-select-label"
                label="Tax"
                variant="standard"
                value={taxId}
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
            <TextField
              label="Subsidized"
              variant="standard"
              type="number"
              inputProps={{
                step: 0.01,
              }}
              value={subsidized ? parseFloat(subsidized) * 100 : "0"}
              onChange={(e) =>
                setSubsidized((parseFloat(e.target.value) / 100).toString())
              }
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
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
              value={frequencyType}
              onChange={(e) =>
                setFrequencyTypeVariable(e.target.value as unknown as number)
              }
            />
          </>
        ) : activeStep === 3 ? (
          <>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Expense begin date"
                value={dayjs.utc(beginDate).local()}
                onChange={(e: Dayjs | null) => {
                  const utcDate = e ? e.utc().format() : dayjs.utc().format();
                  setBeginDate(utcDate);
                }}
              />
              <br />
              <br />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={endDateEnabled}
                    onChange={handleEndDateEnabledChange}
                  />
                }
                label="Expense end date enabled"
              />
              {endDateEnabled && (
                <DateTimePicker
                  label="Expense end date"
                  value={dayjs.utc(endDate).local() || dayjs()}
                  onChange={(e: Dayjs | null) => {
                    const utcDate = e ? e.utc().format() : dayjs.utc().format();
                    setEndDate(utcDate);
                  }}
                />
              )}
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
          steps={4}
          position="static"
          activeStep={activeStep}
          sx={{ maxWidth: 400, flexGrow: 1 }}
          nextButton={
            <Button
              size="small"
              onClick={handleNext}
              disabled={activeStep === 3}
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

export default ExpenseEdit;
