"use client";

import { useState } from "react";
import dayjs from "dayjs";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Loan } from "@/app/types/types";
import { getFrequency } from "../../utils/helperFunctions";
import IconButton from "@mui/material/IconButton";
import MoreVert from "@mui/icons-material/MoreVert";
import LoanActionsMenu from "./LoanActionsMenu";

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
          You will be charged ${loan.plan_amount.toFixed(2)} next on{" "}
          {dayjs(loan.next_date).format("dddd MMMM D, YYYY h:mm A")}. You get
          charged {getFrequency(loan)}. This loan{" "}
          {loan.fully_paid_back
            ? `will be fully paid off on
          ${dayjs(loan.fully_paid_back).format("dddd MMMM D, YYYY")}`
            : "won't be paid off in the near future"}
          .
        </Typography>
      </CardContent>
    </>
  );
}

export default LoansView;
