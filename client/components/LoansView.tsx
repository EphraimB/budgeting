"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Loan } from "@/app/types/types";
import { getFrequency } from "../utils/helperFunctions";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import LoanActionsMenu from "./LoanActionMenu";

function LoansView({
  loan,
  setLoanModes,
}: {
  loan: Loan;
  setLoanModes: React.Dispatch<React.SetStateAction<Record<number, string>>>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Calculate the loan with interest
  let periodsPerYear;

  // Determine the number of periods in a year based on the interest frequency
  switch (loan.interest_frequency_type) {
    case 0: // Daily
      periodsPerYear = 365;
      break;
    case 1: // Weekly
      periodsPerYear = 52;
      break;
    case 2: // Monthly
      periodsPerYear = 12;
      break;
    case 3: // Yearly
      periodsPerYear = 1;
      break;
    default:
      throw new Error("Invalid interest frequency type");
  }

  // Infer the number of periods from the total repayment and the repayment plan
  const inferredPeriods =
    loan.plan_amount > 0 ? loan.amount / loan.plan_amount : 0;

  // Adjust the interest rate per period
  const interestRatePerPeriod = loan.interest_rate / periodsPerYear;

  // Calculate the compound interest for the inferred number of periods
  const interestMultiplier = Math.pow(
    1 + interestRatePerPeriod,
    inferredPeriods
  );

  // Calculate the total amount after interest
  const amountAfterInterest = loan.amount * interestMultiplier;

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
      <LoanActionsMenu
        anchorEl={anchorEl}
        open={open}
        handleClose={handleClose}
        setLoanModes={setLoanModes}
        loan_id={loan.id}
      />
      <CardHeader title={loan.title} subheader={loan.description} />
      <CardContent>
        <Typography variant="body2">
          You will be charged ${amountAfterInterest.toFixed(2)} next on{" "}
          {dayjs(loan.next_date).format("dddd MMMM D, YYYY h:mm A")}. You get
          charged {getFrequency(loan)}.
        </Typography>
      </CardContent>
    </>
  );
}

export default LoansView;
