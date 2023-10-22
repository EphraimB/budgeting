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
    expense.expense_frequency
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
      </TableCell>
      <TableCell>
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
