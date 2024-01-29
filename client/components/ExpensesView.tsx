import React from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Expense, Tax } from "@/app/types/types";
import { getFrequency } from "../utils/helperFunctions";

function ExpensesView({ expense, taxes }: { expense: Expense; taxes: Tax[] }) {
  // Find the tax object that matches the expense's tax_id
  const taxObject = taxes
    ? taxes.find((tax: any) => tax.tax_id === expense.tax_id)
    : 0;

  // Get the tax rate from the tax object
  const taxRate = taxObject ? taxObject.rate : 0;

  // Calculate the amount after tax
  const amountAfterTax: number = expense.amount + expense.amount * taxRate;

  // Calculate the amount after subsidy
  const amountAfterSubsidy: number =
    amountAfterTax - amountAfterTax * expense.subsidized;

  return (
    <>
      <CardHeader title={expense.title} subheader={expense.description} />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${amountAfterSubsidy.toFixed(2)} next on{" "}
          {dayjs(expense.next_date).format("dddd MMMM D, YYYY at h:mm A")}.
        </Typography>
        <Typography variant="body2">
          You get charged {getFrequency(expense)}.
        </Typography>
      </CardContent>
    </>
  );
}

export default ExpensesView;
