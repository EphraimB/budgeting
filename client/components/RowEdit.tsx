"use client";

import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";
import { yellow } from "@mui/material/colors";
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

function RowEdit({
  expense,
  taxes,
  setRowModes,
}: {
  expense: any;
  taxes: any;
  setRowModes: any;
}) {
  const [expenseTitle, setExpenseTitle] = useState(expense.expense_title);
  const [expenseDescription, setExpenseDescription] = useState(
    expense.expense_description
  );
  const [expenseAmount, setExpenseAmount] = useState(expense.expense_amount);
  const [expenseSubsidized, setExpenseSubsidized] = useState(
    expense.expense_subsidized
  );
  const [expenseTax, setExpenseTax] = useState(expense.tax_id || 0);
  const [expenseBeginDate, setExpenseBeginDate] = useState(
    expense.expense_begin_date
  );
  const [expenseEndDate, setExpenseEndDate] = useState(
    expense.expense_end_date
  );
  const [expenseEndDateEnabled, setExpenseEndDateEnabled] = useState(
    expense.expense_end_date ? true : false
  );
  const [expenseFrequency, setExpenseFrequency] = useState(
    expense.frequency_type
  );
  const [frequencyVariable, setFrequencyVariable] = useState(
    expense.frequency_type_variable
  );
  const [frequencyDayOfWeek, setFrequencyDayOfWeek] = useState(
    expense.frequency_day_of_week || -1
  );
  const [frequencyWeekOfMonth, setFrequencyWeekOfMonth] = useState(
    expense.frequency_week_of_month || -1
  );
  const [frequencyMonthOfYear, setFrequencyMonthOfYear] = useState(
    expense.frequency_month_of_year || -1
  );

  const handleExpenseEndDateEnabledChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setExpenseEndDateEnabled(e.target.checked);

    if (e.target.checked) {
      setExpenseEndDate(dayjs().format());
    } else {
      setExpenseEndDate(null);
    }
  };

  const handleCancel = () => {
    setRowModes((prevModes: any) => ({
      ...prevModes,
      [expense.expense_id]: "view",
    }));
  };

  return (
    <TableRow
      sx={{
        backgroundColor: yellow[500],
      }}
    >
      <TableCell colSpan={2}>
        <TextField
          label="Title"
          value={expenseTitle}
          onChange={(e) => setExpenseTitle(e.target.value)}
        />
        <br />
        <br />
        <TextField
          label="Description"
          value={expenseDescription}
          onChange={(e) => setExpenseDescription(e.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          label="Amount"
          value={expenseAmount}
          onChange={(e) => setExpenseAmount(e.target.value)}
        />
        <br />
        <br />
        <TextField
          label="Subsidized"
          value={expenseSubsidized}
          onChange={(e) => setExpenseSubsidized(e.target.value)}
        />
        <br />
        <br />
        {taxes.length > 0 ? (
          <FormControl>
            <InputLabel id="tax-select-label">Tax</InputLabel>
            <Select
              labelId="tax-select-label"
              label="Tax"
              value={expenseTax}
              onChange={(e) => setExpenseTax(e.target.value)}
            >
              <MenuItem value={0}>None - 0%</MenuItem>
              {taxes.map((tax: any) => (
                <MenuItem key={tax.tax_id} value={tax.tax_id}>
                  {tax.tax_title} - {tax.tax_rate * 100}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </TableCell>
      <TableCell>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateTimePicker
            label="Expense begin date"
            value={dayjs(expenseBeginDate)}
            onChange={(e: Dayjs | null) =>
              setExpenseBeginDate(e ? e.format() : dayjs().format())
            }
          />
          <br />
          <br />
          <FormControlLabel
            control={
              <Checkbox
                checked={expenseEndDateEnabled}
                onChange={handleExpenseEndDateEnabledChange}
              />
            }
            label="Expense end date"
          />
          {expenseEndDateEnabled && (
            <DateTimePicker
              label="Expense end date"
              value={dayjs(expenseEndDate) || dayjs()}
              onChange={(e: Dayjs | null) =>
                setExpenseEndDate(e ? e.format() : dayjs().format())
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
            value={expenseFrequency}
            onChange={(e) => setExpenseFrequency(e.target.value)}
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
          onChange={(e) => setFrequencyVariable(e.target.value)}
        />
        <br />
        <br />
        {(expenseFrequency === 1 ||
          expenseFrequency === 2 ||
          expenseFrequency === 3) && (
          <FormControl>
            <InputLabel id="frequency-day-of-week-select-label">
              Day of week
            </InputLabel>
            <Select
              labelId="frequency-day-of-week-select-label"
              label="Day of week"
              value={frequencyDayOfWeek}
              onChange={(e) => setFrequencyDayOfWeek(e.target.value)}
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
        {(expenseFrequency === 2 || expenseFrequency === 3) && (
          <FormControl>
            <InputLabel id="frequency-week-of-month-select-label">
              Week of month
            </InputLabel>
            <Select
              labelId="frequency-week-of-month-select-label"
              label="Week of month"
              value={frequencyWeekOfMonth}
              onChange={(e) => setFrequencyWeekOfMonth(e.target.value)}
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
        {expenseFrequency === 3 && (
          <FormControl>
            <InputLabel id="frequency-month-of-year-select-label">
              Month of year
            </InputLabel>
            <Select
              labelId="frequency-month-of-year-select-label"
              label="Month of year"
              value={frequencyMonthOfYear}
              onChange={(e) => setFrequencyMonthOfYear(e.target.value)}
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
          <Button variant="contained" color="primary">
            Update expense
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

export default RowEdit;
