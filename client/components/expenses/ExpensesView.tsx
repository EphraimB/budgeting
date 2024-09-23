"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Expense, Tax } from "@/app/types/types";
import { getFrequency } from "../../utils/helperFunctions";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import ExpenseActionsMenu from "./ExpenseActionsMenu";

function ExpensesView({
  expense,
  taxes,
  setExpenseModes,
}: {
  expense: Expense;
  taxes: Tax[];
  setExpenseModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Find the tax object that matches the expense's tax_id
  const taxObject = taxes
    ? taxes.find((tax: Tax) => tax.id === expense.taxId)
    : 0;

  // Get the tax rate from the tax object
  const taxRate: number = taxObject ? taxObject.rate : 0;

  // Calculate the amount after tax
  const amountAfterTax: number = expense.amount + expense.amount * taxRate;

  // Calculate the amount after subsidy
  const amountAfterSubsidy: number =
    amountAfterTax - amountAfterTax * expense.subsidized;

  return (
    <>
      <IconButton
        aria-label="more"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
        }}
        size="small"
        onClick={handleClick}
        aria-controls={open ? "account-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <MoreVert />
      </IconButton>
      <ExpenseActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setExpenseModes={setExpenseModes}
        expenseId={expense.id}
      />
      <CardHeader title={expense.title} subheader={expense.description} />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${amountAfterSubsidy.toFixed(2)} next on{" "}
          {dayjs(expense.nextDate).format("dddd MMMM D, YYYY h:mm A")}. You get
          charged {getFrequency(expense)}.
        </Typography>
      </CardContent>
    </>
  );
}

export default ExpensesView;
