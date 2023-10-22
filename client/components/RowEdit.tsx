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
  const [expenseTax, setExpenseTax] = useState(expense.tax_id);
  const [expenseBeginDate, setExpenseBeginDate] = useState(
    expense.expense_begin_date
  );
  const [expenseEndDateExists, setExpenseEndDateExists] = useState(false);
  const [expenseEndDate, setExpenseEndDate] = useState(
    expense.expense_end_date
  );
  const [expenseFrequency, setExpenseFrequency] = useState(
    expense.expense_frequency
  );

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
          <Select
            label="Tax"
            value={expenseTax}
            onChange={(e) => setExpenseTax(e.target.value)}
          >
            {taxes.map((tax: any) => (
              <option key={tax.tax_id} value={tax.tax_id}>
                {tax.tax_title} - {tax.tax_rate * 100}%
              </option>
            ))}
          </Select>
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
        </LocalizationProvider>
        {/* <br />
        <br /> */}
      </TableCell>
    </TableRow>
  );
}

export default RowEdit;
