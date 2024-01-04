"use client";

import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import { green } from "@mui/material/colors";
import { DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs, { Dayjs } from "dayjs";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

function RowAdd({
  account_id,
  taxes,
  setShowAddForm,
  handleAdd,
}: {
  account_id: number;
  taxes: any;
  setShowAddForm: any;
  handleAdd: any;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("0");
  const [subsidized, setSubsidized] = useState("0");
  const [tax, setTax] = useState(0);
  const [beginDate, setBeginDate] = useState(dayjs().format());
  const [endDate, setEndDate] = useState<null | string>(null);
  const [endDateEnabled, setEndDateEnabled] = useState(false);
  const [frequency, setFrequency] = useState(2);
  const [frequencyVariable, setFrequencyVariable] = useState<number>(1);
  const [frequencyDayOfWeek, setFrequencyDayOfWeek] = useState<number>(-1);
  const [frequencyWeekOfMonth, setFrequencyWeekOfMonth] = useState<number>(-1);
  const [frequencyMonthOfYear, setFrequencyMonthOfYear] = useState<number>(-1);

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [amountError, setAmountError] = useState("");

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

  const handleCancel = () => {
    setShowAddForm(false);
  };

  const data = {
    account_id,
    title: title,
    description: description,
    amount: parseFloat(amount),
    subsidized: parseFloat(subsidized),
    tax_id: tax === 0 ? null : tax,
    begin_date: beginDate,
    end_date: endDate,
    frequency_type: frequency,
    frequency_type_variable: frequencyVariable,
    frequency_day_of_week:
      frequencyDayOfWeek === -1 ? null : frequencyDayOfWeek,
    frequency_week_of_month:
      frequencyWeekOfMonth === -1 ? null : frequencyWeekOfMonth,
    frequency_month_of_year:
      frequencyMonthOfYear === -1 ? null : frequencyMonthOfYear,
  };

  const validateTitle = () => {
    if (!title) {
      setTitleError("Title is required");
      return false;
    }

    setTitleError("");

    return true;
  };

  const validateDescription = () => {
    if (!description) {
      setDescriptionError("Description is required");
      return false;
    }

    setDescriptionError("");

    return true;
  };

  const validateAmount = () => {
    if (parseFloat(amount) === 0) {
      setAmountError("Amount needs to be greater than 0");
      return false;
    }

    setAmountError("");

    return true;
  };

  const handleSubmit = () => {
    const isTitleValid = validateTitle();
    const isDescriptionValid = validateDescription();
    const isAmountValid = validateAmount();

    if (isTitleValid && isDescriptionValid && isAmountValid) {
      // Submit data
      try {
        handleAdd(data);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <TableRow
      key="row-add"
      sx={{
        backgroundColor: green[500],
      }}
    >
      <TableCell colSpan={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!titleError}
          helperText={titleError}
        />
        <br />
        <br />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!descriptionError}
          helperText={descriptionError}
        />
      </TableCell>
      <TableCell>
        <TextField
          label="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          error={!!amountError}
          helperText={amountError}
        />
        <br />
        <br />
        <TextField
          label="Subsidized"
          value={subsidized}
          onChange={(e) => setSubsidized(e.target.value)}
        />
        <br />
        <br />
        <FormControl>
          <InputLabel id="tax-select-label">Tax</InputLabel>
          <Select
            labelId="tax-select-label"
            label="Tax"
            value={tax}
            onChange={(e) => setTax(e.target.value as number)}
          >
            <MenuItem key={0} value={0}>
              None - 0%
            </MenuItem>
            {taxes
              ? taxes.map((tax: any) => (
                  <MenuItem key={tax.id} value={tax.id}>
                    {tax.title} - {tax.rate * 100}%
                  </MenuItem>
                ))
              : null}
          </Select>
        </FormControl>
      </TableCell>
      <TableCell>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Expense begin date"
            value={dayjs(beginDate)}
            onChange={(e: Dayjs | null) =>
              setBeginDate(e ? e.format() : dayjs().format())
            }
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
            label="Expense end date"
          />
          {endDateEnabled && (
            <DateTimePicker
              label="Expense end date"
              value={dayjs(endDate) || dayjs()}
              onChange={(e: Dayjs | null) =>
                setEndDate(e ? e.format() : dayjs().format())
              }
            />
          )}
        </LocalizationProvider>
      </TableCell>
      <TableCell>
        <FormControl>
          <InputLabel id="frequency-select-label">Frequency</InputLabel>
          <Select
            labelId="frequency-select-label"
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as number)}
          >
            <MenuItem value={-1}>None</MenuItem>
            <MenuItem value={0}>Daily</MenuItem>
            <MenuItem value={1}>Weekly</MenuItem>
            <MenuItem value={2}>Monthly</MenuItem>
            <MenuItem value={3}>Yearly</MenuItem>
          </Select>
        </FormControl>
        <br />
        <br />
        <TextField
          label="Frequency variable"
          value={frequencyVariable}
          onChange={(e) => setFrequencyVariable(parseInt(e.target.value))}
        />
        <br />
        <br />
        {(frequency === 1 || frequency === 2 || frequency === 3) && (
          <FormControl>
            <InputLabel id="frequency-day-of-week-select-label">
              Day of week
            </InputLabel>
            <Select
              labelId="frequency-day-of-week-select-label"
              label="Day of week"
              value={frequencyDayOfWeek}
              onChange={(e) => setFrequencyDayOfWeek(e.target.value as number)}
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
        )}
        {(frequency === 2 || frequency === 3) && (
          <FormControl>
            <InputLabel id="frequency-week-of-month-select-label">
              Week of month
            </InputLabel>
            <Select
              labelId="frequency-week-of-month-select-label"
              label="Week of month"
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
        )}
        {frequency === 3 && (
          <FormControl>
            <InputLabel id="frequency-month-of-year-select-label">
              Month of year
            </InputLabel>
            <Select
              labelId="frequency-month-of-year-select-label"
              label="Month of year"
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
        )}
      </TableCell>
      <TableCell>
        <Stack direction="column" spacing={2}>
          <Button variant="contained" color="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <br />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Add expense
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default RowAdd;
