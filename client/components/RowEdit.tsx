"use client";

import { useState } from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";

function RowEdit({ expense, setRowModes }: { expense: any; setRowModes: any }) {
  const [expenseTitle, setExpenseTitle] = useState(expense.expense_title);
  const [expenseDescription, setExpenseDescription] = useState(
    expense.expense_description
  );
  const [expenseAmount, setExpenseAmount] = useState(expense.expense_amount);
  const [expenseSubsidized, setExpenseSubsidized] = useState(
    expense.expense_subsidized
  );
  const [expenseTax, setExpenseTax] = useState(expense.tax_id);
  const [expenseFrequency, setExpenseFrequency] = useState(
    expense.expense_frequency
  );
  const [expenseDate, setExpenseDate] = useState(expense.expense_date);

  return (
    <TableRow>
      <TableCell>
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
        <TextField
          label="Subsidized"
          value={expenseSubsidized}
          onChange={(e) => setExpenseSubsidized(e.target.value)}
        />
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}

export default RowEdit;
