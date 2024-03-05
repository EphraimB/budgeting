"use client";

import { useState } from "react";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Close from "@mui/icons-material/Close";
import { Loan } from "@/app/types/types";
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

dayjs.extend(utc);

function LoanEdit({
  account_id,
  loan,
  setLoanModes,
}: {
  account_id: number;
  loan: Loan;
  setLoanModes: (loanModes: Record<number, string>) => void;
}) {
  const [recipient, setRecipient] = useState(loan.recipient);
  const [title, setTitle] = useState(loan.title);
  const [description, setDescription] = useState(loan.description);
  const [amount, setAmount] = useState(loan.amount.toString());
  const [plan_amount, setPlanAmount] = useState(loan.plan_amount.toString());
  const [subsidized, setSubsidized] = useState(loan.subsidized.toString());
  const [frequency_type, setFrequencyType] = useState(loan.frequency_type);
  const [frequency_day_of_week, setFrequencyDayOfWeek] = useState(
    loan.frequency_day_of_week || -1
  );
  const [frequency_week_of_month, setFrequencyWeekOfMonth] = useState(
    loan.frequency_week_of_month || -1
  );
  const [frequency_month_of_year, setFrequencyMonthOfYear] = useState(
    loan.frequency_month_of_year || -1
  );
  const [frequency_type_variable, setFrequencyTypeVariable] = useState<number>(
    loan.frequency_type_variable || 1
  );
  const [interest_rate, setInterestRate] = useState(
    loan.interest_rate.toString()
  );
  const [interest_frequency_type, setInterestFrequencyType] = useState(
    loan.interest_frequency_type.toString()
  );
  const [begin_date, setBeginDate] = useState<string>(loan.begin_date);
  const [activeStep, setActiveStep] = useState(0);

  const theme = useTheme();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const data = {
    account_id,
    recipient,
    title,
    description,
    plan_amount: parseFloat(plan_amount),
    amount: parseFloat(amount),
    subsidized: parseFloat(subsidized),
    frequency_type,
    frequency_day_of_week:
      frequency_day_of_week === -1 ? null : frequency_day_of_week,
    frequency_week_of_month:
      frequency_week_of_month === -1 ? null : frequency_week_of_month,
    frequency_month_of_year:
      frequency_month_of_year === -1 ? null : frequency_month_of_year,
    frequency_type_variable,
    interest_rate: parseFloat(interest_rate) / 100,
    interest_frequency_type: parseInt(interest_frequency_type),
    begin_date,
  };

  const handleSubmit = async () => {
    // Submit data
    try {
      await editLoan(data, loan.id);
    } catch (error) {
      console.log(error);
    }

    // Close form
    setLoanModes({});
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
        onClick={() => setLoanModes({})}
      >
        <Close />
      </IconButton>
      <br />
      <CardHeader
        title={`Edit Loan - Step ${activeStep + 1} of 5`}
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
              onChange={(e) => setRecipient(e.target.value)}
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
              label="Plan Amount"
              variant="standard"
              value={"$" + plan_amount}
              onChange={(e) => setPlanAmount(e.target.value.substring(1))}
            />
            <br />
            <br />
            <TextField
              label="Amount"
              variant="standard"
              value={"$" + amount}
              onChange={(e) => setAmount(e.target.value.substring(1))}
            />
            <br />
            <br />
            <TextField
              label="Subsidized"
              variant="standard"
              value={subsidized + "%"}
              onChange={(e) =>
                setSubsidized(
                  e.target.value.substring(0, e.target.value.length - 1)
                )
              }
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
                value={frequency_type}
                onChange={(e) => setFrequencyType(e.target.value as number)}
              >
                <MenuItem value={0}>Daily</MenuItem>
                <MenuItem value={1}>Weekly</MenuItem>
                <MenuItem value={2}>Monthly</MenuItem>
                <MenuItem value={3}>Yearly</MenuItem>
              </Select>
            </FormControl>
            {(frequency_type === 1 ||
              frequency_type === 2 ||
              frequency_type === 3) && (
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
                    value={frequency_day_of_week}
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
            {(frequency_type === 2 || frequency_type === 3) && (
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
                    value={frequency_week_of_month}
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
            {frequency_type === 3 && (
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
                    value={frequency_month_of_year}
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
              value={frequency_type_variable}
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
              value={parseFloat(interest_rate) * 100 + "%"}
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
                value={interest_frequency_type}
                onChange={(e) => setInterestFrequencyType(e.target.value)}
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
                value={dayjs(begin_date)}
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

export default LoanEdit;
